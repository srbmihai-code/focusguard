import { StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkForPermission, showUsageAccessSettings } from '@brighthustle/react-native-usage-stats-manager';
import { Alert } from 'react-native';

const Hello = () => {
  async function setHelloPageStatus() {
    try {
      const hasPermission = await checkForPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permisiune necesară',
          'FocusGuard are nevoie de permisiunea de utilizare pentru a funcționa corect.',
          [
            { text: 'Anulează', style: 'cancel' },
            { text: 'Deschide setările', onPress: () => showUsageAccessSettings('') },
          ]
        );
        return;
      }

      await AsyncStorage.setItem('hasSeenHelloPage', 'true');
      router.replace('/');
    } catch (error) {
      console.error('Error during permission check or AsyncStorage:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bun venit la FocusGuard! 🚀</Text>
      <Text style={styles.description}>
        Ești gata să preiei controlul asupra timpului tău?{'\n\n'}
        Cu FocusGuard, îți poți organiza eficient programul și bloca aplicațiile care îți distrag atenția, astfel încât să rămâi concentrat pe ceea ce contează cu adevărat.
      </Text>
      <Pressable onPress={setHelloPageStatus} style={styles.button}>
        <Text style={styles.buttonText}>Am înțeles</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4a4a4a',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Hello;
