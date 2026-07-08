import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function QueueMembers() {
  const { id } = useLocalSearchParams();

  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const { data } = await supabase
      .from("queue_members")
      .select("*")
      .eq("queue_id", id)
      .order("token_number", {
        ascending: true,
      });

    setMembers(data || []);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Queue Members
      </Text>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.token}>
              🎟 Token #{item.token_number}
            </Text>

            <Text>
              User: {item.user_id}
            </Text>

            <Text>
              Status: {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  token: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});