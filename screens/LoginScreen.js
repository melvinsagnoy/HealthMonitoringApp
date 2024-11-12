import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useWindowDimensions } from 'react-native';

export default function LoginScreen({ navigation }) {
  const { height } = useWindowDimensions();

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298']} // Blue gradient background
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      {/* Lottie Animation for the Avatar Icon */}
      <View style={{ marginBottom: 10 }}>
      <LottieView
        source={require('../assets/logo.json')}
        autoPlay
        loop
        style={{ width: 300, height: 300 }}
        />
      </View>

      {/* Login Text */}
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
      SeniorTrack
      </Text>

      {/* Input Fields */}
      <View style={{ width: '80%', marginBottom: 10 }}>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#ccc"
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 12,
            marginBottom: 10,
            fontSize: 16,
          }}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#ccc"
          secureTextEntry
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
          }}
        />
      </View>

      {/* Forgot Password Text */}
      <TouchableOpacity>
        <Text style={{ color: '#e0e0e0', marginBottom: 20 }}>FORGOT YOUR PASSWORD?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#0b3d91',
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 40,
          width: '80%',
          alignItems: 'center',
        }}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>LOGIN</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
