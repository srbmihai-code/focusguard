import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import generateDate from './utils/generateDate'
import getDayOfWeek from './utils/getDayOfWeek'
import WeekDay from './WeekDay'

const Week = () => {
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedDay, setSelectedDay] = useState(new Date());
  const weekDaysNames = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];

  useEffect(() => {
    setSelectedWeek(generateDate(new Date()));
  }, []);

  function changeSelectedDay(increment: number) {
    const newDate = new Date(selectedDay.getTime());
    newDate.setDate(newDate.getDate() + increment);
    setSelectedDay(newDate);
    setSelectedWeek(generateDate(newDate));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeSelectedDay(-7)}>
          <Image source={require("@/assets/images/left.png")} style={styles.arrow} />
        </TouchableOpacity>
        <Text style={styles.weekText}>{selectedWeek}</Text>
        <TouchableOpacity onPress={() => changeSelectedDay(7)}>
          <Image source={require("@/assets/images/right.png")} style={styles.arrow} />
        </TouchableOpacity>
      </View>

      {weekDaysNames.map((day, index) => {
        const dayDate = getDayOfWeek(selectedDay, index);
        return (
          <View key={index} style={styles.weekDay}>
            <WeekDay weekDay={day} date={dayDate} />
          </View>
        );
      })}

    </View>
  );
};

export default Week;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    position: 'relative',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  weekText: {
    fontSize: 16,
    fontWeight: "600",
  },
  arrow: {
    width: 30,
    height: 30,
  },
  weekDay: {
    paddingBottom: 10
  }
});
