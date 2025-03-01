import { StyleSheet, Text, View, Button } from 'react-native';
import { router } from 'expo-router';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Hello = () => {
  async function setHelloPageStatus() {
    try {
      await AsyncStorage.setItem('hasSeenHelloPage', 'true');
      router.replace('/');
    } catch (error) {
      console.error('Error setting AsyncStorage:', error);
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bun venit la FocusGuard! 🚀</Text>
      <Text style={styles.description}>
      Ești gata să preiei controlul asupra timpului tău?
      Cu FocusGuard, îți poți organiza eficient programul și bloca aplicațiile care îți distrag atenția, astfel încât să rămâi concentrat pe ceea ce contează cu adevărat.
      </Text>
        <Button title="Am înțeles" onPress={setHelloPageStatus}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default Hello;