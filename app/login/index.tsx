import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AppContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const { login } = useAuth();
  const [focused, setFocused] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = () => {
    if (username.trim()) {
      login(username);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome to MediBot!</Text>
          <Text style={styles.subtitle}>Your personal medical assistant</Text>
        </View>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={22}
            color={focused ? "#009E60" : "#A0A3BD"}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, focused && { borderColor: "#009E60" }]}
            placeholder="Enter your username"
            placeholderTextColor="#A0A3BD"
            value={username}
            onChangeText={setUsername}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Start Consultation</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>By continuing, you agree to our</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Terms & Privacy</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#A0A3BD",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E2FF",
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#2E3A59",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#009E60",
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#009E60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    color: "#A0A3BD",
    fontSize: 12,
    marginBottom: 4,
  },
  footerLink: {
    color: "#009E60",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default LoginPage;
