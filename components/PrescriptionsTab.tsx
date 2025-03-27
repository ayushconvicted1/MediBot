import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { BaseURL } from "@/constants/API";
import { useAuth } from "@/context/AppContext";
import { handleDownloadPdf } from "@/utils/BlobToPdf";
import { useRouter } from "expo-router";

type Question = {
  key: string;
  category: string;
  question: string;
  answer?: string;
};

const SymptomFlow = () => {
  const router = useRouter();
  // Flow states
  const { username } = useAuth();
  const [currentStep, setCurrentStep] = useState<
    "symptom" | "questions" | "generating" | "success"
  >("symptom");
  const [progress, setProgress] = useState(10);
  const [symptom, setSymptom] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [downloadedBlob, setDownloadedBlob] = useState<Blob>();

  const resetFlow = () => {
    setCurrentStep("symptom");
    setProgress(10);
    setSymptom("");
    setQuestions([]);
    setAnswers({});
    setDownloadedBlob(undefined);
  };

  const goBack = () => {
    if (currentStep === "questions") {
      setCurrentStep("symptom");
      setProgress(10);
    } else if (currentStep === "generating") {
      setCurrentStep("questions");
      setProgress(33);
    } else if (currentStep === "success") {
      // If on success, going back would go to symptom (home)
      resetFlow();
    }
  };

  const fetchQuestions = async (symptom: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(BaseURL + "chat/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptom }),
      });
      const data = await response.json();
      setQuestions(data.questions);
      setProgress(33);
      setCurrentStep("questions");
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePrescription = async () => {
    setIsLoading(true);
    setCurrentStep("generating");
    setProgress(66);
    try {
      const formattedQuestions = prepareAnswersForBackend();
      console.log({ userName: username, qna: formattedQuestions });

      const response = await fetch(BaseURL + "chat/prescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: username,
          qna: formattedQuestions,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Failed to generate prescription");
      }
      setDownloadedBlob(data.pdfBase64);
      setProgress(100);
      setCurrentStep("success");
    } catch (error) {
      console.error("Error generating prescription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (key: string, value: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.key === key ? { ...q, answer: value } : q))
    );
  };

  const prepareAnswersForBackend = () => {
    return questions.map((question) => ({
      ...question,
      answer: question.answer || "", // Ensure answer exists even if empty
    }));
  };

  const handleSubmitSymptom = () => {
    if (symptom.trim()) {
      fetchQuestions(symptom);
    }
  };

  const handleDownloadPrescription = () => {
    if (downloadedBlob) {
      handleDownloadPdf(downloadedBlob);
    }
  };

  const handleGoHome = () => {
    resetFlow();
    router.back(); // Or router.navigate('/home') depending on your setup
  };

  // Progress bar component
  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );

  // Header with back button
  const FlowHeader = () => (
    <View style={styles.header}>
      {currentStep !== "symptom" && (
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#009E60" />
        </TouchableOpacity>
      )}
      <ProgressBar />
    </View>
  );

  // Symptom input screen
  if (currentStep === "symptom") {
    return (
      <SafeAreaView style={styles.container}>
        <FlowHeader />
        <View style={styles.content}>
          <Text style={styles.title}>What symptoms are you experiencing?</Text>

          <TextInput
            multiline
            style={styles.input}
            placeholder="e.g. Having a severe headache for past an hour"
            value={symptom}
            onChangeText={setSymptom}
            autoFocus
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmitSymptom}
            disabled={!symptom.trim() || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? (
                <ActivityIndicator size={"small"} color={"#fff"} />
              ) : (
                "Continue"
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Questions screen
  if (currentStep === "questions") {
    return (
      <SafeAreaView style={styles.container}>
        <FlowHeader />
        <ScrollView contentContainerStyle={styles.questionsContainer}>
          <Text style={styles.title}>Tell us more about your {symptom}</Text>
          {questions.map((q) => (
            <View key={q.key} style={styles.questionCard}>
              <Text style={styles.questionText}>{q.question}</Text>
              <TextInput
                style={styles.answerInput}
                placeholder="Your answer..."
                value={q.answer || ""}
                onChangeText={(text) => handleAnswerChange(q.key, text)}
              />
            </View>
          ))}
          <TouchableOpacity
            style={styles.button}
            onPress={generatePrescription}
            disabled={questions.some((q) => !q.answer?.trim())}
          >
            <Text style={styles.buttonText}>Generate Prescription</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Generating prescription screen
  if (currentStep === "generating") {
    return (
      <SafeAreaView style={styles.container}>
        <FlowHeader />
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#009E60" />
          <Text style={styles.generatingText}>
            Generating your prescription...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Success screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LottieView
          source={require("../assets/animations/success-checkmark.json")}
          autoPlay
          loop={false}
          style={styles.successAnimation}
        />
        <Text style={styles.successTitle}>Prescription Generated!</Text>
        <Text style={styles.successSubtitle}>
          Your prescription is ready to download
        </Text>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadPrescription}
        >
          <MaterialIcons name="file-download" size={24} color="white" />
          <Text style={styles.downloadButtonText}>Download Prescription</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <Text style={styles.homeButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  header: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#E2E2FF",
    width: "100%",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#009E60",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E2FF",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#009E60",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  questionsContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E2FF",
  },
  questionText: {
    fontSize: 16,
    color: "#2E3A59",
    marginBottom: 12,
  },
  answerInput: {
    backgroundColor: "#F8F9FF",
    borderColor: "#E2E2FF",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  generatingText: {
    marginTop: 24,
    fontSize: 18,
    color: "#2E3A59",
  },
  successAnimation: {
    width: 150,
    height: 150,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2E3A59",
    marginTop: 24,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#4E4B66",
    marginTop: 8,
    marginBottom: 32,
  },
  downloadButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  downloadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  homeButton: {
    padding: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#009E60",
  },
  homeButtonText: {
    color: "#009E60",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SymptomFlow;
