import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { supabase } from "@/lib/supabase";

export default function CreateQueue() {
  const [queueName, setQueueName] = useState("");
  const [loading, setLoading] = useState(false);

  async function createQueue() {
    if (!queueName.trim()) {
      Alert.alert("Error", "Please enter a queue name.");
      return;
    }

    setLoading(true);

    // Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setLoading(false);
      console.log("User Error:", userError);
      Alert.alert("Error", userError.message);
      return;
    }

    if (!user) {
      setLoading(false);
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    console.log("Logged in User ID:", user.id);

    // Insert queue
    const { data, error } = await supabase
      .from("queues")
      .insert({
        name: queueName,
        category: "General",
        location: "Pune",
        created_by: user.id,
        owner_id: user.id,
        current_token: 0,
        total_people: 0,
      })
      .select();

    setLoading(false);

    if (error) {
      console.log("========== SUPABASE ERROR ==========");
      console.log(JSON.stringify(error, null, 2));
      console.log("====================================");

      Alert.alert("Error", error.message);
      return;
    }

    console.log("========== INSERT SUCCESS ==========");
    console.log(JSON.stringify(data, null, 2));
    console.log("===================================");

    Alert.alert("Success", "Queue created successfully!");
    setQueueName("");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Queue</Text>

      <TextInput
        placeholder="Queue Name"
        style={styles.input}
        value={queueName}
        onChangeText={setQueueName}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={createQueue}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating..." : "Create Queue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});