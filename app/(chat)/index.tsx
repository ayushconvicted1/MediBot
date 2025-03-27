import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useAuth } from "../../context/AppContext";
import { useRouter } from "expo-router";
import ChatTab from "@/components/ChatTab";
import PrescriptionsTab from "@/components/PrescriptionsTab";

const Tab = createMaterialTopTabNavigator();

const ChatScreen = () => {
  const { username, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const navigateToHistory = () => {
    router.push("/history");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, {username}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={navigateToHistory}
          >
            <MaterialIcons name="history" size={24} color="#009E60" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#009E60" />
          </TouchableOpacity>
        </View>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#009E60",
          tabBarInactiveTintColor: "#A0A3BD",
          tabBarIndicatorStyle: {
            backgroundColor: "#009E60",
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: "600",
            textTransform: "capitalize",
          },
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tab.Screen name="Consultation" component={ChatTab} />
        <Tab.Screen name="Prescription" component={PrescriptionsTab} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFF0F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E3A59",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
});

export default ChatScreen;
