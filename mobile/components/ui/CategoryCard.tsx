import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
};

export default function CategoryCard({ icon, title }: Props) {
  return (
    <View style={styles.card}>
      <Ionicons
        name={icon}
        size={32}
        color={Colors.primary}
      />

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  title: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
});