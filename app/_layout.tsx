import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView,View } from "react-native";
import React from "react";

export default function RootLayout() {
  return <SafeAreaView style={{ flex: 1 }}>
  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <View style={{ flex: 1, padding: 3 }}>
      <Slot />
    </View>
  </ScrollView>
</SafeAreaView>
}

