import { TextInput, StyleSheet } from "react-native";
import { Theme } from "@/constants/theme";

export default function Input(props: any) {
  return (
    <TextInput
      placeholderTextColor={Theme.colors.textSecondary}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
    padding: 16,
    fontSize: 16,
  },
});