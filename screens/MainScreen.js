import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  PermissionsAndroid, 
  Alert,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system'; // Expo-friendly file system module
import { ProgressCircle } from 'react-native-svg-charts';
import { ref, onValue, push, query, limitToLast, get } from 'firebase/database';
import { database } from '../firebase';
import LottieView from 'lottie-react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import Animated, { Easing, withTiming } from 'react-native-reanimated';

export default function MainScreen({ navigation }) {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    pulseRate: 0,
    oxygenRate: 0,
    spO2: 0,
  });
  const [rotations, setRotations] = useState({
    temperature: 0,
    humidity: 0,
    pulseRate: 0,
    oxygenRate: 0,
    spO2: 0,
  });
  const [modalVisible, setModalVisible] = useState(false); // Menu Modal
  const [messageModalVisible, setMessageModalVisible] = useState(false); // Message Modal
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const viewRef = useRef(); // Ref for capturing screenshot

  // Fetch and update sensor data in real-time
  useEffect(() => {
    const sensorDataRef = ref(database, 'sensorData');

    const unsubscribe = onValue(sensorDataRef, (snapshot) => {
      const data = snapshot.val() || {};
      const newSensorData = {
        temperature: data.temperature || 0,
        humidity: data.humidity || 0,
        pulseRate: data.heartRate || 0,
        oxygenRate: data.oxygenRate || 0,
        spO2: data.SpO2 || 0,
      };

      setSensorData(newSensorData);

      setRotations({
        temperature: withTiming((newSensorData.temperature / 50) * 360, { duration: 1000, easing: Easing.linear }),
        humidity: withTiming((newSensorData.humidity / 100) * 360, { duration: 1000, easing: Easing.linear }),
        pulseRate: withTiming((newSensorData.pulseRate / 120) * 360, { duration: 1000, easing: Easing.linear }),
        oxygenRate: withTiming((newSensorData.oxygenRate / 100) * 360, { duration: 1000, easing: Easing.linear }),
        spO2: withTiming((newSensorData.spO2 / 100) * 360, { duration: 1000, easing: Easing.linear }),
      });
    });

    


    // Fetch recent messages
    const messagesRef = query(ref(database, 'messages'), limitToLast(10));
    get(messagesRef).then((snapshot) => {
      const fetchedMessages = [];
      snapshot.forEach((childSnapshot) => {
        fetchedMessages.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      setMessages(fetchedMessages.reverse());
    });

    return () => {
      unsubscribe();
    };
  }, []);


 /// Capture and save the screenshot to the gallery
const handleExportToImage = async () => {
  try {
    // Request permission to access media library
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to save images to your gallery.');
      return;
    }

    // Capture the screenshot
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 0.8,
    });

    // Save the file to the gallery
    const asset = await MediaLibrary.createAssetAsync(uri);
    const album = await MediaLibrary.getAlbumAsync('HealthDataScreenshots');
    if (album == null) {
      await MediaLibrary.createAlbumAsync('HealthDataScreenshots', asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }

    Alert.alert('Success', 'Screenshot saved to your gallery!');
  } catch (error) {
    Alert.alert('Error', 'Failed to save screenshot: ' + error.message);
  }
};
  // Send message to Firebase
  const handleSendMessage = () => {
    if (message.trim() === '') {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    const messagesRef = ref(database, 'messages');
    push(messagesRef, {
      text: message,
      timestamp: Date.now(),
      sender: 'User', // Replace with actual user identification
    })
      .then(() => {
        setMessage('');
        Alert.alert('Success', 'Message sent successfully');
      })
      .catch((error) => {
        Alert.alert('Error', `Failed to send message: ${error.message}`);
      });
  };

  // Render health cards
  const renderHealthCard = (title, value, unit, progress, progressColor, rotation) => {
    return (
      <View style={styles.sensorCard}>
        <Text style={styles.sensorTitle}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate: `${rotation}deg` }] }}>
          <ProgressCircle
            style={styles.progressCircle}
            progress={progress}
            progressColor={progressColor}
            backgroundColor={'#ECEFF1'}
          />
        </Animated.View>
        <Text style={styles.sensorValue}>
          {value}
          {unit}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />

      {/* Header */}
      <View style={styles.header}>
        <LottieView source={require('../assets/logo.json')} autoPlay loop style={styles.logo} />
        <Text style={styles.appTitle}>SeniorTrack</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setModalVisible(true)}>
          <FontAwesome name="bars" size={24} color="#333" />
        </TouchableOpacity>
      </View>

       {/* Health Cards */}
       <ScrollView contentContainerStyle={styles.scrollViewContent} ref={viewRef}>
        <View style={styles.sensorGrid}>
          {renderHealthCard('Temperature', sensorData.temperature.toFixed(1), '°C', sensorData.temperature / 50, '#FFA500', rotations.temperature)}
          {renderHealthCard('Humidity', sensorData.humidity.toFixed(1), '%', sensorData.humidity / 100, '#00A2FF', rotations.humidity)}
          {renderHealthCard('Pulse Rate', sensorData.pulseRate, ' bpm', sensorData.pulseRate / 120, '#FF4D4D', rotations.pulseRate)}
          {renderHealthCard('SpO2', sensorData.spO2, '%', sensorData.spO2 / 100, '#FF69B4', rotations.spO2)}
        </View>
      </ScrollView>

      {/* Export to Image Button */}
      <View style={styles.exportSection}>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportToImage}>
          <Ionicons name="download" size={24} color="white" />
          <Text style={styles.exportButtonText}>Export to Image</Text>
        </TouchableOpacity>
      </View>

      {/* Message Button */}
      <View style={styles.messageSection}>
        <TouchableOpacity style={styles.messagesButton} onPress={() => setMessageModalVisible(true)}>
          <Ionicons name="chatbubbles" size={24} color="white" />
          <Text style={styles.messagesButtonText}>View Messages</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.menuModalContent}>
            <Text style={styles.menuModalTitle}>Menu</Text>
         
            <TouchableOpacity style={styles.menuModalButton} onPress={() => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel' }, { text: 'OK', onPress: () => navigation.navigate('Login') }])}>
              <Text style={styles.menuModalButtonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeMenuButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeMenuButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Message Modal */}
      <Modal
        visible={messageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMessageModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.messageModalContent}>
            <Text style={styles.messageModalTitle}>Messages</Text>
            <ScrollView style={styles.messagesScrollView}>
              {messages.map((msg) => (
                <View key={msg.id} style={styles.messageItem}>
                  <Text style={styles.messageText}>{msg.text}</Text>
                  <Text style={styles.messageTimestamp}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type your message..."
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <TouchableOpacity style={styles.sendMessageButton} onPress={handleSendMessage}>
                <Ionicons name="send" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setMessageModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  logo: {
    height: 50,
    width: 50,
    marginRight: 10,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  menuButton: {
    padding: 10,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    top:33
  },
  sensorCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sensorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressCircle: {
    height: 120,
    width: 120,
  },
  sensorValue: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
  },
  messageSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  messagesButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    bottom: 100
  },
  messagesButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for modals
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5, // Adds a slight shadow effect
  },
  menuModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  menuModalButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  menuModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeMenuButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeMenuButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  messageModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  messagesScrollView: {
    width: '100%',
    maxHeight: 300,
    marginBottom: 20,
  },
  messageItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  messageText: {
    fontSize: 16,
  },
  messageTimestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  sendMessageButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeModalButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exportSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  exportButton: {
    top:20,
    flexDirection: 'row',
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  exportButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});