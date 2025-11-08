import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function App() {
  // ------------------ State ------------------
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  // ------------------ Lifecycle ------------------
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const saved = await AsyncStorage.getItem("calcHistory");
    if (saved) setHistory(JSON.parse(saved));
  };

  const saveHistory = async (expr: string, res: any) => {
    const newHistory = [`${expr} = ${res}`, ...history.slice(0, 4)];
    setHistory(newHistory);
    await AsyncStorage.setItem("calcHistory", JSON.stringify(newHistory));
  };

  // ------------------ Native Feedback ------------------
  const giveFeedback = async () => {
    try {
      // Haptic feedback (light tap)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.log("Sound error:", e);
    }
  };

  // ------------------ Logic ------------------
  const handlePress = (value: string) => {
    giveFeedback();
    setExpression((prev) => prev + value);
  };

  const handleClear = () => {
    giveFeedback();
    setExpression("");
    setResult("");
  };

  const handleBackspace = () => {
    giveFeedback();
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleCalculate = async () => {
    giveFeedback();
    try {
      const expr = expression
        .replace(/÷/g, "/")
        .replace(/×/g, "*")
        .replace(/√/g, "Math.sqrt")
        .replace(/\^/g, "**");

      const res = eval(expr);
      const finalResult = res.toString();
      setResult(finalResult);
      await saveHistory(expression, finalResult);
    } catch {
      setResult("Error");
    }
  };

  // ------------------ UI Buttons ------------------
  const buttons = [
    ["C", "⌫", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["√", "0", "^", "="],
  ];

  // ------------------ UI ------------------
  return (
    <SafeAreaView style={styles.container}>
      {/* Display */}
      <View style={styles.display}>
        <Text style={styles.expression}>{expression || "0"}</Text>
        <Text style={styles.result}>{result ? "= " + result : ""}</Text>
      </View>

      {/* History */}
      {history.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Calculations</Text>
          <ScrollView>
            {history.map((item, i) => (
              <Text key={i} style={styles.historyItem}>
                {item}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.keypad}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={[
                  styles.button,
                  btn === "=" && styles.equals,
                  btn === "C" && styles.clear,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (btn === "C") handleClear();
                  else if (btn === "=") handleCalculate();
                  else if (btn === "⌫") handleBackspace();
                  else handlePress(btn);
                }}
              >
                <Text
                  style={[
                    styles.btnText,
                    btn === "=" && { color: "white" },
                    btn === "C" && { color: "white" },
                  ]}
                >
                  {btn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
    justifyContent: "flex-end",
  },
  display: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  expression: {
    fontSize: 38,
    color: "#1E293B",
    fontWeight: "500",
  },
  result: {
    fontSize: 28,
    color: "#2563EB",
    marginTop: 5,
    fontWeight: "600",
  },
  historyContainer: {
    backgroundColor: "#E2E8F0",
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    maxHeight: 110,
  },
  historyTitle: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 5,
  },
  historyItem: {
    color: "#334155",
    fontSize: 16,
    marginVertical: 2,
  },
  keypad: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  button: {
    width: width / 4 - 20,
    height: 70,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  equals: {
    backgroundColor: "#2563EB",
  },
  clear: {
    backgroundColor: "#EF4444",
  },
  btnText: {
    fontSize: 24,
    color: "#1E293B",
    fontWeight: "500",
  },
});
