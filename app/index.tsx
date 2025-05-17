import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Hello from './Hello';
import Day from './Day';
import Week from './Week';
import { router } from 'expo-router';

export default function App({ navigation }: any) {
  const [hasSeenHelloPage, setHasSeenHelloPage] = useState<boolean | null | number>(null);
  const [dayOrWeek, setDayOrWeek] = useState<'day' | 'week'>('week');

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem('hasSeenHelloPage');
        console.log(value);
        if (value !== null && value !== "null") {
          setHasSeenHelloPage(true);
        } else {
          setHasSeenHelloPage(false);
        }
      } catch (e) {
        console.error('Failed to load value from AsyncStorage:', e);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {hasSeenHelloPage === null ? (
        <Text>Loading...</Text>
      ) : hasSeenHelloPage === false ? (
        <Hello />
      ) : (
        <>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                dayOrWeek === 'day' ? styles.activeButton : styles.inactiveButton,
              ]}
              onPress={() => setDayOrWeek('day')}
            >
              <Text style={styles.buttonText}>Program zi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                dayOrWeek === 'week' ? styles.activeButton : styles.inactiveButton,
              ]}
              onPress={() => setDayOrWeek('week')}
            >
              <Text style={styles.buttonText}>Program săptămână</Text>
            </TouchableOpacity>

          <View style={styles.statisticsContainer}>
            <TouchableOpacity
              style={styles.statisticsButton}
              onPress={() => router.push('/Statistics')}
            >
              <Text style={styles.statisticsButtonText}>💡</Text>
            </TouchableOpacity>
          </View>
          </View>

          {dayOrWeek === 'day' ? <Day /> : <Week />}

          {/* Debug Button */}
          <TouchableOpacity
            style={styles.debugButton}
            onPress={async () => {
              try {
                console.log('AsyncStorage has been reset');
                await AsyncStorage.setItem('task', '[]');
                await AsyncStorage.setItem('task_statistics', '');
                await AsyncStorage.setItem('hasSeenHelloPage', 'null');
              } catch (e) {
                console.error('Error resetting AsyncStorage:', e);
              }
            }}
          >
            <Text style={styles.debugButtonText}>Reset AsyncStorage</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignContent: 'center',
    marginBottom: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 1,
    borderRadius: 6,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  inactiveButton: {
    backgroundColor: '#DDDDDD',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statisticsContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  statisticsButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  statisticsButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  debugButton: {
    marginTop: 8,
    backgroundColor: '#FF5733',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  debugButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
});
