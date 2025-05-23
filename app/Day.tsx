import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Share } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions } from "react-native";

const screenHeight = Dimensions.get("window").height;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const Day = () => {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [journalEntry, setJournalEntry] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isAvailableSlotsVisible, setIsAvailableSlotsVisible] = useState(false);

  useEffect(() => {
    getTasks();
    getJournalEntry();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 6000);

    return () => clearInterval(interval);
  }, [selectedDay]);

  useEffect(() => {
    getJournalEntry();
  }, [selectedDay]);

  useEffect(() => {
    calculateAvailableTimeSlots();
  }, [tasks]);

  async function changeSelectedDay(increment:number) {
    const currentDateKey = selectedDay.toLocaleDateString("ro-RO");
    await AsyncStorage.setItem(currentDateKey, journalEntry);
  
    const newDate = new Date(selectedDay.getTime());
    newDate.setDate(newDate.getDate() + increment);
    setSelectedDay(newDate);
  
    setTimeout(() => {
      getJournalEntry();
    }, 0);
  }
  
  useEffect(() => {
    const delaySave = setTimeout(() => {
      const save = async () => {
        const dateKey = selectedDay.toLocaleDateString("ro-RO");
        await AsyncStorage.setItem(dateKey, journalEntry);
      };
      if (journalEntry) save();
    }, 500);
  
    return () => clearTimeout(delaySave);
  }, [journalEntry]);

  async function getTasks() {
    const storedData = await AsyncStorage.getItem("task");
    const allTasks = storedData ? JSON.parse(storedData) : [];
    const newActivities = [];
    const today = new Date();
    const monthNames = [
      "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
      "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"
    ];
    const fullDate = `${selectedDay.getDate()} ${monthNames[selectedDay.getMonth()]} ${selectedDay.getFullYear()}`;
    for (const task of allTasks) {
      const taskStartDate = task.day;

      
      if (!taskStartDate) continue;
      const taskEndTime = new Date(taskStartDate);
      taskEndTime.setHours(task.endHour, task.endMinute, 0, 0);
      
      if (
          (task.repetition === "one-time" && task.day === fullDate) ||
          (task.repetition === "same-weekday" && new Date(taskStartDate).getDay() === selectedDay.getDay()) ||
          (task.repetition === "weekdays" && selectedDay.getDay() >= 1 && selectedDay.getDay() <= 5) ||
          (task.repetition === "everyday")
      ) {
        newActivities.push({
          name: task.name,
          startHour: task.startHour,
          startMinute: task.startMinute,
          endHour: task.endHour,
          endMinute: task.endMinute
        });
      }
    }

    setTasks(newActivities);
  }

  async function getJournalEntry() {
    const dateKey = selectedDay.toLocaleDateString("ro-RO");
    const entry = await AsyncStorage.getItem(dateKey);
    if (entry) {
      setJournalEntry(entry);
    }
  }

  async function saveJournalEntry() {
    const dateKey = selectedDay.toLocaleDateString("ro-RO");
    await AsyncStorage.setItem(dateKey, journalEntry);
  }

function calculateAvailableTimeSlots() {
  const startHour = 6;
  const endHour = 20;
  const startMinuteIndex = startHour * 60;
  const endMinuteIndex = endHour * 60;

  let takenMinutes = Array(endMinuteIndex - startMinuteIndex).fill(false);

  tasks.forEach((task) => {
    const taskStart = Math.max(task.startHour * 60 + task.startMinute, startMinuteIndex);
    const taskEnd = Math.min(task.endHour * 60 + task.endMinute, endMinuteIndex);

    for (let i = taskStart; i < taskEnd; i++) {
      if (i >= startMinuteIndex && i < endMinuteIndex) {
        takenMinutes[i - startMinuteIndex] = true;
      }
    }
  });

  let slots = [];
  let start = null;

  for (let i = 0; i < takenMinutes.length; i++) {
    if (!takenMinutes[i] && start === null) {
      start = i + startMinuteIndex;
    }
    if (takenMinutes[i] && start !== null) {
      const startTime = new Date(0);
      startTime.setMinutes(start);
      const endTime = new Date(0);
      endTime.setMinutes(i + startMinuteIndex);

      slots.push(
        `${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, "0")} - ${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, "0")}`
      );

      start = null;
    }
  }

  if (start !== null) {
    const startTime = new Date(0);
    startTime.setMinutes(start);
    const endTime = new Date(0);
    endTime.setMinutes(endMinuteIndex);

    slots.push(
      `${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, "0")} - ${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, "0")}`
    );
  }

  setAvailableTimeSlots(slots);
}

  function handleShareAvailableSlots() {
    const slotsText = availableTimeSlots.join(", ");

    Share.share({
      message: slotsText,
    })
      .then((result) => console.log(result))
      .catch((error) => console.log(error));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeSelectedDay(-1)}>
          <Image source={require("@/assets/images/left.png")} style={styles.arrow} />
        </TouchableOpacity>
        <Text style={styles.weekText}>{selectedDay.toLocaleDateString("ro-RO")}</Text>
        <TouchableOpacity onPress={() => changeSelectedDay(1)}>
          <Image source={require("@/assets/images/right.png")} style={styles.arrow} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.timelineContainer}>
          {HOURS.map((hour) => (
            <View key={hour} style={styles.hourBlock}>
              <Text style={styles.hourText}>{`${hour}:00`}</Text>
            </View>
          ))}
          <View style={[styles.currentTimeLine, { top: (currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60) * screenHeight }]} />
          {tasks.map((task, index) => (
            <View
              key={index}
              style={{
                top: (task.startHour * 60 + task.startMinute) / (24 * 60) * screenHeight,
                height: (task.endHour * 60 + task.endMinute - task.startHour * 60 - task.startMinute) / (24 * 60) * screenHeight,
                backgroundColor: "#007bff",
                position: "absolute",
                width: "70%",
                left: "30%",
                borderRadius: 6,
                padding: 5,
              }}>
              <Text style={styles.taskText}>{task.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.journalContainer}>
        <Text style={styles.journalHeader}>Mini-Jurnal</Text>
        <TextInput
          style={styles.journalInput}
          value={journalEntry}
          onChangeText={setJournalEntry}
          multiline
          placeholder="Scrie despre ce s-a îmbunătățit astăzi..."
        />
      </View>

      <TouchableOpacity onPress={handleShareAvailableSlots} style={styles.shareButton}>
        <Text style={styles.shareButtonText}>Distribuie perioadele libere</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Day;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
  },
  weekText: {
    fontSize: 16,
    fontWeight: "600",
  },
  arrow: {
    width: 30,
    height: 30,
  },
  scrollContainer: {
    flex: 1,
  },
  timelineContainer: {
    position: "relative",
    paddingHorizontal: 20,
    height: screenHeight,
  },
  hourBlock: {
    height: screenHeight / 24,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  hourText: {
    fontSize: 14,
    color: "#333",
  },
  currentTimeLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "red",
  },
  taskText: {
    color: "white",
    fontWeight: "bold",
  },
  journalContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  journalHeader: {
    fontSize: 16,
    fontWeight: "600",
  },
  journalInput: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 10,
    padding: 10,
    textAlignVertical: "top",
  },
  shareButton: {
    backgroundColor: "#007bff",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
