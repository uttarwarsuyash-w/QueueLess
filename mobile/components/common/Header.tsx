import { View, Text, StyleSheet } from "react-native";
import { Theme } from "@/constants/theme";

type Props = {
  title: string;
  subtitle?: string;
};

export default function Header({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: Theme.colors.text,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: Theme.colors.textSecondary,
  },
});