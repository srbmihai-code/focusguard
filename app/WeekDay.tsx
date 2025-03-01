import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import Add from "./Add";
import Activity from "./Activity";

const WeekDay = ({ weekDay, date }: { weekDay: string; date: string }) => {
  useEffect(() => {
    
  }, [])
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>
          {weekDay}, {date}
        </Text>
        <Add date={date} />
      </View>
      <Activity name="Teme" time="20:00-20:30" isPhoneBlocked={true} />
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
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    position: 'relative',
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  header: {
    fontSize: 16,
    fontWeight: "600",
  },
});
