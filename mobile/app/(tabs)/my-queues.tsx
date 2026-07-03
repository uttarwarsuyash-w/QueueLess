import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";

type MyQueue = {
  id: string;
  queue_id: string;
  token_number: number;
  status: string;
  queues: {
    id: string;
    name: string;
    location: string;
    current_token: number;
  };
};

export default function MyQueues() {
  const [queues, setQueues] = useState<MyQueue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyQueues();
  }, []);

  async function fetchMyQueues() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("queue_members")
      .select(`
        id,
        queue_id,
        token_number,
        status,
        queues (
          id,
          name,
          location,
          current_token
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
    } else {
      setQueues(data as any);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎟 My Queues</Text>

      {queues.length === 0 ? (
        <Text style={styles.empty}>You haven't joined any queues.</Text>
      ) : (
        <FlatList
          data={queues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push(`/queue/${item.queues.id}`)
              }
            >
              <Text style={styles.queueName}>
                {item.queues.name}
              </Text>

              <Text style={styles.info}>
                📍 {item.queues.location}
              </Text>

              <Text style={styles.info}>
                🎫 Your Token: {item.token_number}
              </Text>

              <Text style={styles.info}>
                👥 People Ahead:{" "}
                {Math.max(
                  item.token_number -
                    item.queues.current_token,
                  0
                )}
              </Text>

              <Text style={styles.status}>
                Status: {item.status}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 20,
    color: Colors.primary,
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#666",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
  },

  queueName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  info: {
    fontSize: 16,
    marginBottom: 6,
    color: "#444",
  },

  status: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
  },
});