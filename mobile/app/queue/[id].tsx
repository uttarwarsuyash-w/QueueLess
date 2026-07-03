import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";

export default function QueueDetails() {
  const { id } = useLocalSearchParams();

  const [queue, setQueue] = useState<any>(null);
  const [myEntry, setMyEntry] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  loadData();

  const queueChannel = supabase
    .channel(`queue-${id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "queues",
        filter: `id=eq.${id}`,
      },
      () => {
        loadData();
      }
    )
    .subscribe();

  const memberChannel = supabase
    .channel(`members-${id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "queue_members",
        filter: `queue_id=eq.${id}`,
      },
      () => {
        loadData();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(queueChannel);
    supabase.removeChannel(memberChannel);
  };
}, []);

  async function loadData() {
    await fetchQueue();
    await fetchMyQueueStatus();
    setLoading(false);
  }

  async function fetchQueue() {
    const { data, error } = await supabase
      .from("queues")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setQueue(data);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setIsOwner(user?.id === data.owner_id);
  }

  async function fetchMyQueueStatus() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("queue_members")
      .select("*")
      .eq("queue_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    setMyEntry(data);
  }

  async function joinQueue() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Login Required");
      return;
    }

    if (myEntry) {
      Alert.alert("Already Joined");
      return;
    }

    const { count } = await supabase
      .from("queue_members")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("queue_id", id);

    const nextToken = (count ?? 0) + 1;

    const { error } = await supabase
      .from("queue_members")
      .insert({
        queue_id: id,
        user_id: user.id,
        token_number: nextToken,
        status: "waiting",
      });

    if (error) {
      Alert.alert(error.message);
      return;
    }

    const { count: memberCount } = await supabase
  .from("queue_members")
  .select("*", {
    count: "exact",
    head: true,
  })
  .eq("queue_id", id);

await supabase
  .from("queues")
  .update({
    total_people: memberCount ?? 0,
  })
  .eq("id", id);

    Alert.alert(
      "Joined Successfully",
      `Your Token Number is ${nextToken}`
    );

    await loadData();
  }
  async function nextToken() {
  if (!isOwner) return;

  const { data: latestQueue } = await supabase
    .from("queues")
    .select("*")
    .eq("id", id)
    .single();

  if (!latestQueue) return;

  const next = latestQueue.current_token + 1;

  await supabase
    .from("queues")
    .update({
      current_token: next,
    })
    .eq("id", id);

  await supabase
  .from("queue_members")
  .update({ status: "completed" })
  .eq("queue_id", id)
  .lt("token_number", next);

await supabase
  .from("queue_members")
  .update({ status: "serving" })
  .eq("queue_id", id)
  .eq("token_number", next);

await supabase
  .from("queue_members")
  .update({ status: "waiting" })
  .eq("queue_id", id)
  .gt("token_number", next);

  await loadData();

  Alert.alert(`Now Serving Token ${next}`);
}
    

async function resetQueue() {
  Alert.alert(
    "Reset Queue",
    "Are you sure you want to reset this queue?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await supabase
            .from("queue_members")
            .delete()
            .eq("queue_id", id);

          await supabase
            .from("queues")
            .update({
              current_token: 0,
              total_people: 0,
            })
            .eq("id", id);

          setMyEntry(null);

          await loadData();

          Alert.alert("Queue Reset Successfully");
        },
      },
    ]
  );
}

  async function deleteQueue() {
    Alert.alert(
      "Delete Queue",
      "This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await supabase
              .from("queue_members")
              .delete()
              .eq("queue_id", id);

            const { error } = await supabase
              .from("queues")
              .delete()
              .eq("id", id);

            if (error) {
              Alert.alert("Error", error.message);
              return;
            }

            Alert.alert("Queue Deleted");

           router.replace("/(tabs)");
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />
      </View>
    );
  }

  if (!queue) {
    return (
      <View style={styles.center}>
        <Text>Queue not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{queue.name}</Text>

      <Text style={styles.info}>
        📍 {queue.location}
      </Text>

      <Text style={styles.info}>
        🏷 {queue.category}
      </Text>

      <Text style={styles.info}>
        🎫 Current Token : {queue.current_token}
      </Text>

      <Text style={styles.info}>
        👥 Total People : {queue.total_people}
      </Text>

      <Text style={styles.info}>
        📊 Progress :
        {" "}
        {queue.current_token}/{queue.total_people}
      </Text>

      {myEntry && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            🎟 My Queue Status
          </Text>

          <Text style={styles.statusText}>
            Your Token : {myEntry.token_number}
          </Text>

          <Text style={styles.statusText}>
  Status:{" "}
  {myEntry.status === "completed"
    ? "✅ Completed"
    : myEntry.status === "serving"
    ? "🔵 It's Your Turn!"
    : myEntry.token_number === queue.current_token + 1
    ? "🟢 Your Turn Next"
    : "🟡 Waiting"}
</Text>
          <Text style={styles.statusText}>
            People Ahead :
            {" "}
            {Math.max(
              myEntry.token_number -
                queue.current_token -
                1,
              0
            )}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          myEntry && {
            backgroundColor: "#16a34a",
          },
        ]}
        onPress={joinQueue}
        disabled={!!myEntry}
      >
       <Text style={styles.buttonText}>
  {myEntry ? "✓ Already Joined" : "Join Queue"}
</Text>
      </TouchableOpacity>

      {isOwner && (
        <>
          <View style={styles.ownerCard}>
            <Text style={styles.ownerTitle}>
              👑 Owner Controls
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: "#2563EB",
              },
            ]}
            onPress={nextToken}
          >
            <Text style={styles.buttonText}>
              ▶ Next Token
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: "#F59E0B",
              },
            ]}
            onPress={resetQueue}
          >
            <Text style={styles.buttonText}>
              🔄 Reset Queue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: "#DC2626",
              },
            ]}
            onPress={deleteQueue}
          >
            <Text style={styles.buttonText}>
              🗑 Delete Queue
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
    justifyContent: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: 28,
  },

  info: {
    fontSize: 17,
    color: "#475569",
    marginBottom: 10,
  },

  statusCard: {
    backgroundColor: "#EFF6FF",
    padding: 18,
    borderRadius: 18,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  statusTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1E3A8A",
  },

  statusText: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 6,
  },

  ownerCard: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 18,
    marginTop: 25,
    marginBottom: 10,
  },

  ownerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#92400E",
    textAlign: "center",
  },

  button: {
    backgroundColor: Colors.primary,
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});