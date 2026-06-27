import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email || !password) {
      Alert.alert("Error", "Enter email and password");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      Alert.alert("Signup Failed", error.message);
      return;
    }

    // Create profile in database
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email: data.user.email,
        });

      if (profileError) {
        console.log(profileError);
      }
    }

    setLoading(false);

    Alert.alert("Success", "Account created successfully!");
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Login
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
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
    padding: 14,
    marginBottom: 16,
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
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#2563eb",
  },
});