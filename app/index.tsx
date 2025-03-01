import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Hello from './Hello';
import Day from './Day';
import Week from './Week';

export default function App() {
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
          </View>

          {dayOrWeek === 'day' ? <Day /> : <Week />}

          {/* Debug Button */}
          <TouchableOpacity
            style={styles.debugButton}
            onPress={async () => {
              try {
                console.log('AsyncStorage has been reset');
                await AsyncStorage.setItem('task', '[]');
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
    width: 150,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  inactiveButton: {
    backgroundColor: '#DDDDDD',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  debugButton: {
    marginTop: 20,
    backgroundColor: '#FF5733',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
  debugButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
