import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";

export default function QueueMembers() {
  const { id } = useLocalSearchParams();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();

    const channel = supabase
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
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchMembers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("queue_members")
      .select("*")
      .eq("queue_id", id)
      .order("token_number", {
        ascending: true,
      });

    if (error) {
      console.log(error);
    }

    setMembers(data || []);
    setLoading(false);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "serving":
        return "#22C55E";
      case "completed":
        return "#3B82F6";
      default:
        return "#F59E0B";
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case "serving":
        return "🟢 Serving";
      case "completed":
        return "✅ Completed";
      default:
        return "🟡 Waiting";
    }
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        👥 Queue Members
      </Text>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No members in this queue.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.token}>
                🎟 Token #{item.token_number}
              </Text>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: getStatusColor(
                      item.status
                    ),
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.member}>
              Member #{item.token_number}
            </Text>

            <Text style={styles.id}>
              User ID:
            </Text>

            <Text
              numberOfLines={1}
              style={styles.userId}
            >
              {item.user_id}
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
    backgroundColor: "#F8FAFC",
    padding: 20,
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
    marginBottom: 20,
  },

  empty: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 18,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  token: {
    fontSize: 20,
    fontWeight: "700",
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  member: {
    marginTop: 18,
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },

  id: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 13,
  },

  userId: {
    color: "#334155",
    marginTop: 2,
    fontSize: 12,
  },
});