// app/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AppContext";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { username, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#009E60" />
      </View>
    );
  }

  return <Redirect href={username ? "/(chat)" : "/login"} />;
}
