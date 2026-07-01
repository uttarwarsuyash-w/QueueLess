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

    if (!error && data) {
      setQueue(data);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && data.owner_id === user.id) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    }
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
      Alert.alert("Error", "Please login first.");
      return;
    }

    if (myEntry) {
      Alert.alert("Already Joined", "You are already in this queue.");
      return;
    }

    const { count } = await supabase
      .from("queue_members")
      .select("*", { count: "exact", head: true })
      .eq("queue_id", id);

    const nextToken = (count ?? 0) + 1;

    const { error } = await supabase.from("queue_members").insert({
      queue_id: id,
      user_id: user.id,
      token_number: nextToken,
      status: "waiting",
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    await supabase
      .from("queues")
      .update({
        total_people: nextToken,
      })
      .eq("id", id);

    Alert.alert("Success", `Your Token Number is ${nextToken}`);

    await loadData();
  }

  async function nextToken() {
    const { error } = await supabase
      .from("queues")
      .update({
        current_token: queue.current_token + 1,
      })
      .eq("id", id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Moved to next token.");
    await loadData();
  }

  async function resetQueue() {
    Alert.alert("Reset Queue", "Reset this queue?", [
      { text: "Cancel" },
      {
        text: "Reset",
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
        },
      },
    ]);
  }

  async function deleteQueue() {
    Alert.alert("Delete Queue", "Delete this queue permanently?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("queues")
            .delete()
            .eq("id", id);

          if (error) {
            Alert.alert("Error", error.message);
            return;
          }

          Alert.alert("Queue Deleted");
          router.back();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
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

      <Text style={styles.info}>📍 {queue.location}</Text>
      <Text style={styles.info}>🏷 {queue.category}</Text>
      <Text style={styles.info}>🎫 Current Token: {queue.current_token}</Text>
      <Text style={styles.info}>👥 People: {queue.total_people}</Text>

      {myEntry && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>🎟 My Queue Status</Text>
          <Text style={styles.statusText}>Token: {myEntry.token_number}</Text>
          <Text style={styles.statusText}>Status: {myEntry.status}</Text>
          <Text style={styles.statusText}>
            People Ahead:{" "}
            {Math.max(myEntry.token_number - queue.current_token, 0)}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          myEntry && { backgroundColor: "#16a34a" },
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
          <Text style={styles.ownerTitle}>👑 Owner Panel</Text>

          <TouchableOpacity style={styles.button} onPress={nextToken}>
            <Text style={styles.buttonText}>Next Token</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#f59e0b" }]}
            onPress={resetQueue}
          >
            <Text style={styles.buttonText}>Reset Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#dc2626" }]}
            onPress={deleteQueue}
          >
            <Text style={styles.buttonText}>Delete Queue</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    marginBottom: 30,
    color: Colors.primary,
  },

  info: {
    fontSize: 18,
    marginBottom: 10,
  },

  statusCard: {
    backgroundColor: "#eef6ff",
    padding: 18,
    borderRadius: 15,
    marginVertical: 20,
  },

  statusTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  statusText: {
    fontSize: 16,
    marginBottom: 5,
  },

  ownerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 30,
    marginBottom: 15,
  },

  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});