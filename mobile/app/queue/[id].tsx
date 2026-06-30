import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";

export default function QueueDetails() {
  const { id } = useLocalSearchParams();

  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    const { data, error } = await supabase
      .from("queues")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
    } else {
      setQueue(data);
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
        📍 Location: {queue.location}
      </Text>

      <Text style={styles.info}>
        🏷 Category: {queue.category}
      </Text>

      <Text style={styles.info}>
        🎫 Current Token: {queue.current_token}
      </Text>

      <Text style={styles.info}>
        👥 People Waiting: {queue.total_people}
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Join Queue</Text>
      </TouchableOpacity>
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
    marginBottom: 15,
    color: "#444",
  },

  button: {
    marginTop: 40,
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});