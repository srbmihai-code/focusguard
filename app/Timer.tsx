import React, { useState, useEffect } from "react";
import { View, Text, AppState, FlatList, StyleSheet, TouchableOpacity, Button, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";

const Timer: React.FC = () => {
  const { taskIndex } = useLocalSearchParams<{ taskIndex: string }>();
  const [task, setTask] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [appState, setAppState] = useState<string>(AppState.currentState);
  const [isTaskFailed, setIsTaskFailed] = useState<boolean>(false);
  const [timerExpired, setTimerExpired] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [breaks, setBreaks] = useState<{ start: number; end: number }[]>([]);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    const getTaskFromStorage = async () => {
      try {
        const storedData = await AsyncStorage.getItem("task");
        if (storedData) {
          const tasks = JSON.parse(storedData);
          const taskData = tasks[taskIndex];
          if (taskData) {
            setTask(taskData);
            calculateTimers(taskData);
          }
        }
      } catch (error) {
        console.error("Eroare la încărcarea task-ului:", error);
      }
    };

    getTaskFromStorage();
  }, [taskIndex]);

  useEffect(() => {
    const appStateListener = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });

    const interval = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft((prev) => prev - 1);
        checkBreaks();
      } else if (!timerExpired) {
        setTimerExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      appStateListener.remove();
    };
  }, [timeLeft, timerExpired]);

  useEffect(() => {
    if (appState === "background" && !isBreak && !timerExpired && task.phoneBlocked) {
      setIsTaskFailed(true);
    }
  }, [appState, isBreak, timerExpired]);

  const handleRating = async (star: number) => {
    setRating(star);

    try {
      const existingStats = await AsyncStorage.getItem("task_statistics");
      const statsArray = existingStats ? JSON.parse(existingStats) : [];
      
      const newEntry = {
        rating: star,
        passed: !isTaskFailed,
      };
      
      statsArray[taskIndex] = [
        ...(statsArray[taskIndex] || []),
        newEntry
      ];
      
      await AsyncStorage.setItem("task_statistics", JSON.stringify(statsArray));
    } catch (error) {
      console.error("Eroare la salvarea statisticilor:", error);
    }
    setTimeout(() => router.push("/"), 1000);
  };

  const calculateTimers = (task: any) => {
    const now = new Date();
    const endTime = new Date();
    endTime.setHours(task.endHour, task.endMinute, 0, 0);

    let totalSeconds = Math.max(Math.floor((endTime.getTime() - now.getTime()) / 1000), 0);
    setTimeLeft(totalSeconds);

    const breaksArray = [];
    let breakStart = totalSeconds / (task.breaksCount + 1);
    for (let i = 0; i < task.breaksCount; i++) {
      const start = Math.floor(breakStart * (i + 1));
      const end = start + task.breaksDuration * 60;
      breaksArray.push({ start, end });
    }
    setBreaks(breaksArray);
  };

  const checkBreaks = () => {
    for (const breakPeriod of breaks) {
      if (timeLeft === breakPeriod.start) {
        setIsBreak(true);
      } else if (timeLeft === breakPeriod.end) {
        setIsBreak(false);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (!task) {
    return <Text>Se încarcă task-ul...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.taskTitle}>📝 {task.name}</Text>
      <Text style={styles.timeText}>⏳ Timp rămas: {formatTime(timeLeft)}</Text>

      <Text style={styles.timeDetails}>Start: {task.startHour}:{task.startMinute.toString().padStart(2, "0")}</Text>
      <Text style={styles.timeDetails}>Sfârșit: {task.endHour}:{task.endMinute.toString().padStart(2, "0")}</Text>

      {isBreak ? (
        <Text style={styles.breakText}>☕ Pauză! Poți folosi telefonul 📱</Text>
      ) : timerExpired ? (
        <View>
          <Text style={styles.successText}>🎉 Felicitări! Ai terminat task-ul!</Text>
          <Text style={styles.ratingText}>Cum a mers task-ul?</Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                <Text style={[styles.star, star <= (rating ?? 0) ? styles.starSelected : {}]}>⭐</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : isTaskFailed ? (
        <Text style={styles.failedText}>⚠ Task-ul a eșuat! Ai ieșit din aplicație.</Text>
      ) : (
        <Text style={styles.taskActiveText}>🔥 Task-ul este activ.</Text>
      )}

      <Text style={styles.details}>Detalii: {task.details}</Text>
      <Text style={styles.phoneBlock}>Telefon blocat: {task.phoneBlocked ? "Da" : "Nu"}</Text>

      <Text style={styles.stepsHeader}>Pașii de urmat:</Text>
      <FlatList
        data={task.steps}
        renderItem={({ item, index }) => <Text style={styles.step}>{index + 1}. {item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
      <Button onPress={() => setTimeLeft(1)} title="Termina taskul"/>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 20,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  timeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  timeDetails: {
    fontSize: 22,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  breakText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
    marginBottom: 15,
    textAlign: "center",
  },
  failedText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  successText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
    marginBottom: 15,
    textAlign: "center",
  },
  taskActiveText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginBottom: 15,
    textAlign: "center",
  },
  details: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  phoneBlock: {
    fontSize: 18,
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  stepsHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  step: {
    fontSize: 18,
    color: "#333",
    paddingVertical: 4,
    textAlign: "center",
  },
  ratingText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  starContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
  },
  star: {
    fontSize: 30,
    marginHorizontal: 10,
  },
  starSelected: {
    color: "gold",
  },
});

export default Timer;
