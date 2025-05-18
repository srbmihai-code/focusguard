import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Add from "./Add";
import { router } from "expo-router";
import Activity from "./Activity";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WeekDay = ({ weekDay, date }: { weekDay: string; date: string }) => {
  const [activities, setActivities] = useState<
    { name: string; time: string; index: number }[]
  >([]);

  useEffect(() => {
    getTasks();
    const interval = setInterval(() => {
      getTasks();
    }, 2000);

    return () => clearInterval(interval);
  }, [weekDay, date]);

  const monthMap: { [key: string]: number } = {
    ianuarie: 0,
    februarie: 1,
    martie: 2,
    aprilie: 3,
    mai: 4,
    iunie: 5,
    iulie: 6,
    august: 7,
    septembrie: 8,
    octombrie: 9,
    noiembrie: 10,
    decembrie: 11,
  };

  function parseRomanianDate(dateStr: string): Date | null {
    const dateParts = dateStr.split(" ");
    if (dateParts.length !== 3) return null;

    const day = parseInt(dateParts[0], 10);
    const month = monthMap[dateParts[1].toLowerCase()];
    const year = parseInt(dateParts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    return new Date(year, month, day);
  }
  // Gets tasks for a day
  async function getTasks() {
    const storedData = await AsyncStorage.getItem("task");
    const tasks = storedData ? JSON.parse(storedData) : [];
    const newActivities = [];
    const today = new Date();
    const todayDateString = `${date} ${today.getFullYear()}`;
    const todayDateObj = parseRomanianDate(todayDateString);
    if (!todayDateObj) return;
    for (const [i, task] of tasks.entries()) {
      const taskStartDate = task.day ? parseRomanianDate(task.day) : null;


      if (!taskStartDate) continue;

      const taskStartTime = new Date();
      taskStartTime.setHours(task.startHour, task.startMinute, 0, 0);

      const taskEndTime = new Date();
      taskEndTime.setHours(task.endHour, task.endMinute, 0, 0);

      const isTaskValid =
        task.repetition === "one-time" && todayDateString === task.day ||
        task.repetition === "same-weekday" && task.weekDay === weekDay ||
        task.repetition === "weekdays" && ["Luni", "Marți", "Miercuri", "Joi", "Vineri"].includes(weekDay) ||
        task.repetition === "everyday";


      const isTaskActive = today >= taskStartTime && today <= taskEndTime;
      if (isTaskValid) {
        newActivities.push({
          index: i,
          name: task.name,
          time: `${task.startHour}:${task.startMinute
            .toString()
            .padStart(2, "0")}-${task.endHour}:${task.endMinute
            .toString()
            .padStart(2, "0")}`
        });

        if (isTaskActive) {

          router.push({
            pathname: "/Timer", 
            params: { taskIndex: i },
          });
        }
      }
    }

    setActivities(newActivities);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>
          {weekDay}, {date}
        </Text>
        <Add weekDay={weekDay} date={date} />
      </View>
      <View style={styles.taskRow}>
        {activities.map((activity) => (
          <Activity
            name={activity.name}
            time={activity.time}
            key={activity.index}
            index={activity.index}
          />
        ))}
      </View>
    </View>
  );
};

export default WeekDay;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  taskRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
});
