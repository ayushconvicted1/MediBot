import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useIsFocused } from "@react-navigation/native";
import { BaseURL } from "@/constants/API";
import { useAuth } from "@/context/AppContext";
import { IHistoryData, Message } from "@/app/history";

const ChatTab = () => {
  const { username, selectedChat, setSelectedChat, historyData } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingAnimationRef = useRef<LottieView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const focused = useIsFocused();

  useEffect(() => {
    if (selectedChat !== "") {
      const chat = historyData.find((chat) => chat._id === selectedChat);
      if (chat) {
        setMessages(chat.messages);
      }
    } else {
      setMessages([]);
    }
  }, [focused, selectedChat, historyData]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [...prev, { message: inputText, role: "user" }]);
    setInputText("");
    try {
      setIsTyping(true);
      typingAnimationRef.current?.play();
      const response = await fetch(BaseURL + "chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: inputText,
          chatId: selectedChat,
          userName: username,
        }),
      });
      const messageResponse: IHistoryData = await response.json();
      setSelectedChat(messageResponse._id);
      setIsTyping(false);
      typingAnimationRef.current?.pause();
      setMessages((prev) => [
        ...prev,
        {
          message:
            messageResponse.messages[messageResponse.messages.length - 1]
              .message,
          role: "doctor",
        },
      ]);
    } catch (error) {
      setIsTyping(false);
      typingAnimationRef.current?.pause();
      console.error("Failed to send message", error);
    }
  };

  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <Text key={index} style={{ fontWeight: "bold" }}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";

    return (
      <Animated.View
        style={[
          styles.messageRow,
          isUser ? styles.userRow : styles.botRow,
          { opacity: fadeAnim },
        ]}
      >
        {!isUser && (
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.avatar}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text style={isUser ? styles.userMessageText : styles.botMessageText}>
            {renderBoldText(item.message)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.tabContainer}>
      {messages.length === 0 ? (
        <View style={styles.emptyChatContainer}>
          <Text style={styles.emptyChatTitle}>No messages yet</Text>
          <Text style={styles.emptyChatSubtitle}>
            Start your consultation by sending a message
          </Text>
          <View style={styles.emptyChatDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          <TouchableOpacity
            onPress={() => {
              setInputText("What are common headache remedies?");
            }}
            style={styles.sampleQuestionButton}
          >
            <Text style={styles.sampleQuestionText}>
              "What are common headache remedies?"
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setInputText("How to improve appetite?");
            }}
            style={styles.sampleQuestionButton}
          >
            <Text style={styles.sampleQuestionText}>
              "How to improve appetite?"
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setInputText("How to fix my sleep cycle?");
            }}
            style={styles.sampleQuestionButton}
          >
            <Text style={styles.sampleQuestionText}>
              "How to fix my sleep cycle?"
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.messagesContainer}
          ListFooterComponent={
            isTyping && (
              <View style={styles.typingIndicator}>
                <LottieView
                  ref={typingAnimationRef}
                  source={require("../assets/typing.json")}
                  style={styles.typingAnimation}
                  autoPlay={false}
                  loop
                />
              </View>
            )
          }
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#A0A3BD"
          multiline
        />
        <TouchableOpacity
          disabled={isTyping}
          style={styles.sendButton}
          onPress={handleSend}
        >
          <Ionicons name="send" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#E2E2FF",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#009E60",
    borderBottomRightRadius: 4,
  },
  botMessageText: {
    color: "#2E3A59",
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
  },
  typingIndicator: {
    padding: 10,
    alignSelf: "flex-start",
  },
  typingAnimation: {
    width: 60,
    height: 40,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EFF0F6",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: "#F8F9FF",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: "#2E3A59",
    fontSize: 16,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#E2E2FF",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#009E60",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#009E60",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyChatTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyChatSubtitle: {
    fontSize: 16,
    color: "#A0A3BD",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyChatDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E2FF",
  },
  dividerText: {
    paddingHorizontal: 10,
    color: "#A0A3BD",
    fontSize: 14,
  },
  sampleQuestionButton: {
    backgroundColor: "#F8F9FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E2FF",
    marginTop: 8,
    marginBottom: 10,
  },
  sampleQuestionText: {
    color: "#009E60",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ChatTab;
