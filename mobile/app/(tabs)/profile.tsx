import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [createdQueues, setCreatedQueues] = useState(0);
  const [joinedQueues, setJoinedQueues] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUser(user);

    const { count: created } = await supabase
      .from("queues")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("owner_id", user.id);

    const { count: joined } = await supabase
      .from("queue_members")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

    setCreatedQueues(created ?? 0);
    setJoinedQueues(joined ?? 0);

    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();

    Alert.alert("Logged Out");

    router.replace("/login");
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

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.email?.charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text style={styles.name}>
        {user?.email?.split("@")[0]}
      </Text>

      <Text style={styles.email}>
        {user?.email}
      </Text>

      <View style={styles.statsRow}>

        <View style={styles.card}>
          <Text style={styles.number}>
            {createdQueues}
          </Text>
          <Text style={styles.label}>
            Created
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>
            {joinedQueues}
          </Text>
          <Text style={styles.label}>
            Joined
          </Text>
        </View>

      </View>

      <TouchableOpacity
        style={styles.logout}
        onPress={logout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "800",
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 20,
  },

  email: {
    color: "#64748B",
    marginTop: 5,
    fontSize: 16,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 35,
  },

  card: {
    backgroundColor: "#fff",
    width: 150,
    height: 110,
    marginHorizontal: 8,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  number: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.primary,
  },

  label: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 16,
  },

  logout: {
    marginTop: 60,
    backgroundColor: "#EF4444",
    width: "100%",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});