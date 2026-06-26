import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

export default function QueueCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name="time-outline"
          size={26}
          color={Colors.primary}
        />

        <Text style={styles.title}>Active Queue</Text>
      </View>

      <Text style={styles.status}>No Active Queue</Text>

      <Text style={styles.subtitle}>
        Join a queue to track your waiting position in real time.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
    color: Colors.text,
  },

  status: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.success,
    marginBottom: 8,
  },

  subtitle: {
    color: Colors.subtitle,
    fontSize: 15,
    lineHeight: 22,
  },
});