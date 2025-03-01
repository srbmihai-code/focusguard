import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import AddPopUp from './AddPopUp';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Add = ({ date }: { date: string }) => {
  const [popUp, setPopUp] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const insets = useSafeAreaInsets();
  
  function closePopup(added: boolean) {
    setPopUp(false);
    if (added) {
      setNotificationVisible(true);
      setTimeout(() => setNotificationVisible(false), 1000);
    }
  }
  
  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setPopUp(true)}>
          <Image source={require("@/assets/images/plus.png")} style={styles.image} />
        </TouchableOpacity>
        <AddPopUp visible={popUp} onClose={closePopup} date={date} />
      </View>
      
      {notificationVisible && (
        <View 
          style={
            styles.notificationContainer
          }
          pointerEvents="none"
        >
          <View style={styles.notification}>
            <Text style={styles.notificationText}>Activitate adaugata!</Text>
          </View>
        </View>
      )}
    </>
  );
};

export default Add;

const styles = StyleSheet.create({
  container: {
    
  },
  image: {
    width: 30,
    height: 30,
  },
  notificationContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    alignItems: 'center',
    zIndex: 9999,
  },
  notification: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    width: 320,
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontWeight: 'bold',
  },
});