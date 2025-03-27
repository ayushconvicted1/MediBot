// app/_layout.tsx
import { AuthProvider } from "@/context/AppContext";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(chat)" options={{ headerShown: false }} />
          <Stack.Screen name="history" options={{ headerShown: false }} />
        </Stack>
        <StatusBar backgroundColor={"#009E60"} barStyle={"light-content"} />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
