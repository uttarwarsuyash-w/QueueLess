import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import SearchBar from "@/components/ui/SearchBar";
import QueueCard from "@/components/ui/QueueCard";
import CategoryCard from "@/components/ui/CategoryCard";
import { Colors } from "@/constants/colors";

export default function HomeScreen() {
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

      <SearchBar />

      <Text style={styles.heading}>Nearby Queues</Text>

      <View style={styles.grid}>
        <CategoryCard icon="medical" title="Hospital" />
        <CategoryCard icon="business" title="Bank" />
        <CategoryCard icon="restaurant" title="Restaurant" />
        <CategoryCard icon="school" title="College" />
      </View>

      <QueueCard />

      <TouchableOpacity style={styles.button}>
        <Ionicons name="add-circle-outline" size={22} color="white" />
        <Text style={styles.buttonText}>Join Queue</Text>
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
    marginTop: 10,
  },

  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
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