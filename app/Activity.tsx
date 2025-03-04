import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import AddPopUp from "./AddPopUp";

interface ActivityProps {
  name: string;
  time: string;
  isPhoneBlocked: boolean;
  index: number
}

const Activity: React.FC<ActivityProps> = ({ name, time, isPhoneBlocked, index }) => {
  const [popUp, setPopUp] = useState(false);
  return (
    <TouchableOpacity onPress={() => setPopUp(true)}>
    <View style={styles.container}>

      {
        popUp &&  <AddPopUp visible={popUp} onClose={() => setPopUp(false)} index={index}/>
      }
      <View>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      {isPhoneBlocked && (
        <Image
          source={require("@/assets/images/smartphone.png")}
          style={styles.image}
        />
      )}

    </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    width: 110,
    backgroundColor: "white",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  time: {
    fontSize: 12,
    color: "gray",
  },
  image: {
    width: 20,
    height: 20,
  },
});

export default Activity;