import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import { ref, onValue, push } from 'firebase/database';
import { database } from '../firebase'; // Import the database object
import LottieView from 'lottie-react-native'; // Import Lottie for the animation
import { FontAwesome } from '@expo/vector-icons'; // To use the menu icon
import { LinearGradient } from 'expo-linear-gradient'; // To create gradient buttons
import Animated, { Easing, withTiming } from 'react-native-reanimated'; // Import Reanimated

export default function MainScreen({ navigation }) {
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [pulseRate, setPulseRate] = useState(0);
  const [oxygenRate, setOxygenRate] = useState(0);
  const [spO2, setSpO2] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState(''); // State for message input

  const [tempRotation, setTempRotation] = useState(0);
  const [humRotation, setHumRotation] = useState(0);
  const [pulseRotation, setPulseRotation] = useState(0);
  const [oxygenRotation, setOxygenRotation] = useState(0);
  const [spO2Rotation, setSpO2Rotation] = useState(0);
  const maxPulseRate = 120; // Maximum value for pulse rate
  const progressPulseRate = pulseRate / maxPulseRate; // Calculate progress for pulse rate

  const maxSpO2 = 100; // Maximum value for SpO2
  const progressSpO2 = spO2 / maxSpO2; // Calculate progress for SpO2


  useEffect(() => {
    const sensorDataRef = ref(database, 'sensorData');

    onValue(sensorDataRef, (snapshot) => {
      const sensorData = snapshot.val();
      if (sensorData) {
        setTemperature(sensorData.temperature || 0);
        setHumidity(sensorData.humidity || 0);
        setPulseRate(sensorData.heartRate || 0);
        setOxygenRate(sensorData.oxygenRate || 0);
        setSpO2(sensorData.SpO2 || 0);
      } else {
        setTemperature(0);
        setHumidity(0);
        setPulseRate(0);
        setOxygenRate(0);
        setSpO2(0);
      }
    });
  }, []);
  // Function to determine the pulse rate status
const getPulseRateStatus = () => {
  if (pulseRate >= 60 && pulseRate <= 100) {
    return { status: 'Normal', color: 'green' };
  } else {
    return { status: 'Abnormal', color: 'red' };
  }
};

// Function to determine the SpO2 status
const getSpO2Status = () => {
  if (spO2 >= 95 && spO2 <= 100) {
    return { status: 'Normal', color: 'green' };
  } else {
    return { status: 'Low', color: 'red' };
  }
};

  useEffect(() => {
    setTempRotation(withTiming((temperature / 50) * 360, { duration: 1000, easing: Easing.linear }));
    setHumRotation(withTiming((humidity / 100) * 360, { duration: 1000, easing: Easing.linear }));
    setPulseRotation(withTiming((pulseRate / 120) * 360, { duration: 1000, easing: Easing.linear }));
    setOxygenRotation(withTiming((oxygenRate / 100) * 360, { duration: 1000, easing: Easing.linear }));
    setSpO2Rotation(withTiming((spO2 / 100) * 360, { duration: 1000, easing: Easing.linear }));
  }, [temperature, humidity, pulseRate, oxygenRate, spO2]);

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      const messagesRef = ref(database, 'messages');
      push(messagesRef, { text: message, timestamp: Date.now() })
        .then(() => {
          Alert.alert('Success', 'Message sent successfully');
          setMessage(''); // Clear the input field
        })
        .catch((error) => {
          Alert.alert('Error', 'Failed to send message: ' + error.message);
        });
    } else {
      Alert.alert('Error', 'Message cannot be empty');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 16 }}>
      <LottieView source={require('../assets/logo.json')} autoPlay loop style={{ height: 150, width: 150, marginBottom: 20 }} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>SeniorTrack</Text>

      {/* Row for Temperature and Humidity */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 16, alignItems: 'center', width: '45%' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Temperature</Text>
          <Animated.View style={{ transform: [{ rotate: `${tempRotation}deg` }] }}>
            <ProgressCircle style={{ height: 120, width: 120 }} progress={temperature / 50} progressColor={'#FFA500'} backgroundColor={'#ECEFF1'} />
          </Animated.View>
          <Text style={{ marginTop: 12, fontWeight: 'bold', fontSize: 18 }}>{temperature.toFixed(1)}°C</Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 16, alignItems: 'center', width: '45%' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Humidity</Text>
          <Animated.View style={{ transform: [{ rotate: `${humRotation}deg` }] }}>
            <ProgressCircle style={{ height: 120, width: 120 }} progress={humidity / 100} progressColor={'#00A2FF'} backgroundColor={'#ECEFF1'} />
          </Animated.View>
          <Text style={{ marginTop: 12, fontWeight: 'bold', fontSize: 18 }}>{humidity.toFixed(1)}%</Text>
        </View>
      </View>

      {/* Row for Pulse Rate and Oxygen Rate */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 16, alignItems: 'center', width: '45%' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Pulse Rate</Text>
          <Animated.View style={{ transform: [{ rotate: `${pulseRotation}deg` }] }}>
            <ProgressCircle style={{ height: 120, width: 120 }} progress={progressPulseRate} progressColor={'#FF4D4D'} backgroundColor={'#ECEFF1'} />
          </Animated.View>
          <Text style={{ marginTop: 12, fontWeight: 'bold', fontSize: 18 }}>{pulseRate} bpm</Text>
          <Text style={{ color: getPulseRateStatus().color, fontWeight: 'bold', marginTop: 5 }}>{getPulseRateStatus().status}</Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 16, alignItems: 'center', width: '45%' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Oxygen Rate</Text>
          <Animated.View style={{ transform: [{ rotate: `${spO2Rotation}deg` }] }}>
            <ProgressCircle style={{ height: 120, width: 120 }} progress={progressSpO2} progressColor={'#FF69B4'} backgroundColor={'#ECEFF1'} />
          </Animated.View>
          <Text style={{ marginTop: 12, fontWeight: 'bold', fontSize: 18 }}>{spO2}%</Text>
          <Text style={{ color: getSpO2Status().color, fontWeight: 'bold', marginTop: 5 }}>{getSpO2Status().status}</Text>
        </View>
      </View>

      {/* Message Input and Send Button */}
      <View style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center', width: '100%' }}>
        <TextInput
          style={{ flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, padding: 10, marginRight: 10 }}
          placeholder="Type your message..."
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        <TouchableOpacity
          style={{ backgroundColor: '#00BFFF', padding: 10, borderRadius: 5 }}
          onPress={handleSendMessage}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20 }} onPress={() => setModalVisible(true)}>
        <FontAwesome name="bars" size={30} color="black" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ width: 250, padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>Menu</Text>
            <LinearGradient colors={['#FF4C4C', '#FF6F6F']} style={{ marginBottom: 10, borderRadius: 5, paddingVertical: 12, width: '100%' }}>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Logout</Text>
              </TouchableOpacity>
            </LinearGradient>
            <LinearGradient colors={['#00BFFF', '#1E90FF']} style={{ borderRadius: 5, paddingVertical: 12, width: '100%' }}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Close</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}
