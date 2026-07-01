import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Theme } from "@/constants/theme";

type Props = {
  title: string;
  onPress: () => void;
};

export default function Button({ title, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: Theme.radius.lg,
    alignItems: "center",
  },

  text: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});