import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { router } from 'expo-router';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkForPermission, showUsageAccessSettings} from '@brighthustle/react-native-usage-stats-manager';

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
        Ești gata să preiei controlul asupra timpului tău?
        Cu FocusGuard, îți poți organiza eficient programul și bloca aplicațiile care îți distrag atenția, astfel încât să rămâi concentrat pe ceea ce contează cu adevărat.
      </Text>
      <Button title="Am înțeles" onPress={setHelloPageStatus} />
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
