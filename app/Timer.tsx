import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { queryEvents } from "@brighthustle/react-native-usage-stats-manager";

const Timer: React.FC = () => {
  const { taskIndex } = useLocalSearchParams<{ taskIndex: string }>();
  const [task, setTask] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTaskFailed, setIsTaskFailed] = useState<boolean>(false);
  const [timerExpired, setTimerExpired] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [breaks, setBreaks] = useState<{ start: number; end: number }[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [taskTimestamps, setTaskTimestamps] = useState<Date[]>([]);

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

  async function logresults() {
    const startMilliseconds = taskTimestamps[0].getTime();
    const endMilliseconds = taskTimestamps[1].getTime();

    try {
      const result1 = await queryEvents(startMilliseconds, endMilliseconds);

      const bannedApps = await AsyncStorage.getItem("banned_apps");
      const bannedList: string[] = bannedApps ? JSON.parse(bannedApps) : [];

      const usedBannedApp = Object.values(result1).some((event: any) => {
        const packageName = event.packageName;
        const isAppOpenEvent = event.eventType === 0;
        return bannedList.includes(packageName) && isAppOpenEvent;
      });

      if (usedBannedApp) {
        setIsTaskFailed(true);
      }
    } catch (error) {
      console.error("Eroare la verificarea aplicațiilor interzise:", error);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft((prev) => prev - 1);
        checkBreaks();
      } else if (!timerExpired) {
        logresults();
        setTimerExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timeLeft, timerExpired]);

  const handleRating = async (star: number) => {
    setRating(star);

    try {
      const existingStats = await AsyncStorage.getItem("task_statistics");
      const statsArray = existingStats ? JSON.parse(existingStats) : [];

      const newEntry = {
        rating: star,
        passed: !isTaskFailed,
      };

      statsArray[taskIndex] = [...(statsArray[taskIndex] || []), newEntry];

      await AsyncStorage.setItem("task_statistics", JSON.stringify(statsArray));
    } catch (error) {
      console.error("Eroare la salvarea statisticilor:", error);
    }
    setTimeout(() => router.push("/"), 1000);
  };

  const calculateTimers = (task: any) => {
    const now = new Date();
    const endTime = new Date();
    const startTime = new Date();
    endTime.setHours(task.endHour, task.endMinute, 0, 0);
    startTime.setHours(task.startHour, task.startMinute, 0, 0);

    setTaskTimestamps([startTime, endTime]);
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
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Se încarcă sarcina...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.taskTitle}>{task.name}</Text>
        <View style={styles.sectionDivider} />

        <Text style={styles.timeText}>⌛Timp rămas: {formatTime(timeLeft)}</Text>
        <Text style={styles.timeDetails}>
          Start: {task.startHour}:{task.startMinute.toString().padStart(2, "0")}
        </Text>
        <Text style={styles.timeDetails}>
          Sfârșit: {task.endHour}:{task.endMinute.toString().padStart(2, "0")}
        </Text>

        <View style={styles.sectionDivider} />

        {isBreak ? (
          <Text style={styles.breakText}>Pauză activă – poți folosi telefonul</Text>
        ) : timerExpired ? (
          <View style={styles.resultSection}>
            {isTaskFailed ? (
              <Text style={styles.failedText}>
                Task-ul a eșuat. A fost detectată o aplicație interzisă.
              </Text>
            ) : (
              <Text style={styles.successText}>
                🎉 Task finalizat cu succes, fără aplicații interzise.
              </Text>
            )}
            <Text style={styles.ratingText}>Cum a fost sarcina?</Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                  <Text
                    style={[
                      styles.star,
                      star <= (rating ?? 0) ? styles.starSelected : {},
                    ]}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <Text style={styles.taskActiveText}>🔄Sarcina este în desfășurare</Text>
        )}

        <View style={styles.sectionDivider} />

        <Text style={styles.details}>Detalii: {task.details}</Text>

        <Text style={styles.stepsHeader}>Pași de urmat:</Text>

        <FlatList
          data={task.steps}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Text style={styles.step}>
              {index + 1}. {item}
            </Text>
          )}
          scrollEnabled={false}
        />
        {/* Debug Button */}
        <View style={styles.footerButtonContainer}>
          <TouchableOpacity onPress={() => setTimeLeft(1)} style={styles.footerButton} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    margin: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  taskTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  timeText: {
    fontSize: 26,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  timeDetails: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
  },
  breakText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#2e7d32",
    marginTop: 15,
    textAlign: "center",
  },
  failedText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#c62828",
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 12,
    textAlign: "center",
  },
  taskActiveText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  details: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#444",
    textAlign: "center",
    marginBottom: 10,
  },
  stepsHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  step: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 6,
    textAlign: "center",
  },
  ratingText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  starContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
  },
  star: {
    fontSize: 30,
    marginHorizontal: 6,
    color: "#bbb",
  },
  starSelected: {
    color: "#f4b400",
  },
  resultSection: {
    marginTop: 10,
    alignItems: "center",
    gap: 8,
  },
  footerButtonContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  footerButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ccc",
  },
});


export default Timer;
