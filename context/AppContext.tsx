import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BaseURL } from "@/constants/API";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { IHistoryData } from "@/app/history";

type AuthContextType = {
  username: string | null;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  selectedChat: string | undefined;
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
  historyData: IHistoryData[];
  setHistoryData: React.Dispatch<React.SetStateAction<IHistoryData[]>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string>("");
  const router = useRouter();
  const [historyData, setHistoryData] = useState<IHistoryData[]>([]);

  const getHistory = async () => {
    try {
      const response = await fetch(BaseURL + "chat/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName: username }),
      });
      const historyResponse = await response.json();

      const sortedData = historyResponse.sort(
        (a: IHistoryData, b: IHistoryData) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      );

      setHistoryData(sortedData);
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  useEffect(() => {
    if (username) {
      getHistory();
    }
  }, [username]);

  useEffect(() => {
    const loadStoredUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
          router.replace("/(chat)");
        }
      } catch (error) {
        console.error("Failed to load username from storage", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredUsername();
  }, []);

  const login = async (username: string) => {
    try {
      setIsLoading(true);
      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        throw new Error("Username cannot be empty");
      }

      const response = await fetch(`${BaseURL}user/` + username, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      await AsyncStorage.setItem("username", trimmedUsername);
      setUsername(trimmedUsername);
      router.replace("/(chat)");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Error",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("username");
      setUsername(null);
      setHistoryData([]);
      setSelectedChat("");
      router.navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Error", "Failed to logout properly");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        isLoading,
        login,
        logout,
        selectedChat,
        setSelectedChat,
        historyData,
        setHistoryData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
