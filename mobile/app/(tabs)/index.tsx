import { useState, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import SearchBar from "@/components/ui/SearchBar";
import CategoryCard from "@/components/ui/CategoryCard";
import { Colors } from "@/constants/colors";
import { supabase } from "@/lib/supabase";

type Queue = {
  id: string;
  name: string;
  category: string;
  location: string;
  current_token: number;
  total_people: number;
};

export default function HomeScreen() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchQueues();
    }, [])
  );

  async function fetchQueues() {
    setLoading(true);

    const { data, error } = await supabase
      .from("queues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
    } else {
      setQueues(data || []);
    }

    setLoading(false);
  }

  const filteredQueues = queues.filter((queue) => {
    const matchesSearch =
      queue.name.toLowerCase().includes(search.toLowerCase()) ||
      queue.location.toLowerCase().includes(search.toLowerCase()) ||
      queue.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "" ||
      queue.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.logo}>QueueLess</Text>

      <Text style={styles.welcome}>Hello 👋</Text>

      <Text style={styles.subtitle}>
        Skip long queues and save your valuable time.
      </Text>

      <SearchBar
        value={search}
        onChangeText={setSearch}
      />

      <Text style={styles.heading}>Categories</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          onPress={() => setSelectedCategory("Hospital")}
        >
          <CategoryCard
            icon="medical"
            title="Hospital"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedCategory("Bank")}
        >
          <CategoryCard
            icon="business"
            title="Bank"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedCategory("Restaurant")}
        >
          <CategoryCard
            icon="restaurant"
            title="Restaurant"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedCategory("College")}
        >
          <CategoryCard
            icon="school"
            title="College"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => setSelectedCategory("")}
      >
        <Text
          style={{
            color: Colors.primary,
            fontWeight: "700",
            marginBottom: 20,
          }}
        >
          Show All
        </Text>
      </TouchableOpacity>

      <Text style={styles.heading}>
        Available Queues
      </Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : filteredQueues.length === 0 ? (
        <Text>No queues found.</Text>
      ) : (
        filteredQueues.map((queue) => (
          <TouchableOpacity
            key={queue.id}
            style={styles.queueCard}
            onPress={() =>
              router.push(`/queue/${queue.id}`)
            }
          >
            <Text style={styles.queueName}>
              {queue.name}
            </Text>

            <Text style={styles.queueInfo}>
              📍 {queue.location}
            </Text>

            <Text style={styles.queueInfo}>
              Category: {queue.category}
            </Text>

            <Text style={styles.queueInfo}>
              Current Token: {queue.current_token}
            </Text>

            <Text style={styles.queueInfo}>
              People in Queue: {queue.total_people}
            </Text>

            <Text style={styles.tapText}>
              Tap to view details →
            </Text>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity style={styles.button}>
        <Ionicons
          name="add-circle-outline"
          size={22}
          color="white"
        />
        <Text style={styles.buttonText}>
          Join Queue
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: Colors.primary,
  },

  welcome: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 20,
  },

  subtitle: {
    color: Colors.subtitle,
    fontSize: 16,
    marginTop: 6,
    marginBottom: 10,
    lineHeight: 24,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 18,
    marginTop: 20,
  },

  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  queueCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
  },

  queueName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  queueInfo: {
    fontSize: 15,
    marginBottom: 4,
    color: "#555",
  },

  tapText: {
    marginTop: 10,
    color: Colors.primary,
    fontWeight: "700",
  },

  button: {
    backgroundColor: Colors.primary,
    height: 58,
    borderRadius: 18,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
});