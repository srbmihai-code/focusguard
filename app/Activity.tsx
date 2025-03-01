import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface ActivityProps {
  name: string;
  time: string;
  isPhoneBlocked: boolean;
}

const Activity: React.FC<ActivityProps> = ({ name, time, isPhoneBlocked }) => {
  return (
    <View style={styles.container}>
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
    width: 200,
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