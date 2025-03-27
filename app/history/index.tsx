import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BaseURL } from "@/constants/API";
import { useAuth } from "@/context/AppContext";
import { useIsFocused } from "@react-navigation/native";
import { Alert } from "react-native";
import { handleDownloadPdf } from "@/utils/BlobToPdf";

export interface IHistoryData {
  _id: string;
  title: string;
  messages: Message[];
  userName: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Message {
  message: string;
  role: string;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  pdfBlob?: any;
}

const HistoryScreen = () => {
  const router = useRouter();
  const { username, setSelectedChat } = useAuth();
  const [history, setHistory] = useState<IHistoryData[]>();
  const [loading, setLoading] = useState(false);
  const focused = useIsFocused();

  const getHistory = async () => {
    setLoading(true);
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
      setHistory(sortedData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch history", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (focused) {
      getHistory();
    }
  }, [focused]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: IHistoryData }) => {
    let pdfData = null;
    for (const message of item.messages) {
      if (message.pdfBlob) {
        pdfData = message.pdfBlob;
        break;
      }
    }

    return (
      <TouchableOpacity
        style={[styles.card, !!pdfData && styles.cardWithPrescription]}
        onPress={() => {
          if (!pdfData) {
            setSelectedChat(item._id);
            router.push("/(chat)");
          } else {
            const base64String = btoa(
              String.fromCharCode.apply(null, pdfData.data)
            );
            handleDownloadPdf(base64String);
          }
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          {!!pdfData && (
            <View style={styles.pdfBadge}>
              <MaterialIcons name="picture-as-pdf" size={18} color="#E53E3E" />
              <Text style={styles.pdfText}>Prescription</Text>
            </View>
          )}
        </View>
        <Text style={styles.summaryText}>{item.title}</Text>

        {!!pdfData && (
          <View style={styles.prescriptionPreview}>
            <Text style={styles.prescriptionText}>Download Prescription</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            style={{ paddingTop: 5, paddingRight: "3%" }}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Consultation History</Text>
        <View style={{ flexGrow: 1 }} />
      </View>
      <TouchableOpacity
        onPress={() => {
          setSelectedChat("");
          router.push("/(chat)");
        }}
        style={{
          height: 50,
          backgroundColor: "#009E60",
          marginBottom: 16,
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          New +
        </Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size={40} color={"#009E60"} />
      ) : history?.length === 0 ? (
        <Text style={styles.summaryText}>No chat history found</Text>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 24,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E2FF",
  },
  cardWithPrescription: {
    borderLeftWidth: 4,
    borderLeftColor: "#009E60",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateText: {
    color: "#4E4B66",
    fontSize: 14,
  },
  pdfBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEEBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pdfText: {
    color: "#E53E3E",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  summaryText: {
    color: "#2E3A59",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  prescriptionPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E2FF",
  },
  pdfIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  prescriptionText: {
    color: "#009E60",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default HistoryScreen;
