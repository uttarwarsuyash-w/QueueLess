import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={22} color="#888" />

      <TextInput
        placeholder="Search queues..."
        placeholderTextColor="#888"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 15,
    height: 55,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
});