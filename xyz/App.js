import MapView, { Callout, Circle, Marker,Image } from 'react-native-maps';
import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, Dimensions, Alert, Modal, Pressable,Button } from 'react-native';
import Constants from 'expo-constants';
import { TextInput } from "react-native-paper";
import * as Location from 'expo-location';
const isAndroid = Platform.OS === "android";

//Cal dist from origin
const getDistance = (lat1, lat2, lon1, lon2) => {

  lon1 = lon1 * Math.PI / 180;
  lon2 = lon2 * Math.PI / 180;
  lat1 = lat1 * Math.PI / 180;
  lat2 = lat2 * Math.PI / 180;

  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a = Math.pow(Math.sin(dlat / 2), 2)
    + Math.cos(lat1) * Math.cos(lat2)
    * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));
  const d = c * 6371 * 100;

  return d;
}

export default function App() {
  const [location, setLocation] = useState(null);
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [newlat, setNewlat] = useState(0);
  const [newlng, setNewlng] = useState(0);
  const [radius, setRadius] = useState(500);
  const [dist, setDist] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [isInRange, setIsInRange] = useState(true);
  
  //Get Location Access and set origin
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android' && !Constants.isDevice) {
        setErrorMsg(
          'Oops, this will not work on Snack in an Android emulator. Try it on your device!'
        );
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setNewlat(location.coords.latitude );
      setNewlng(location.coords.longitude);
    })();
  }, []);

  //Get Location every 2 sec
  const locationTracker = () => {
    intervalId = setInterval(async () => {
      let location = await Location.getCurrentPositionAsync();
      setLat(location.coords.latitude);
      setLng(location.coords.longitude);
    }, 2000);
  }
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        locationTracker();
      }
    })();
  }, []);

  //Set new origin
  const newLoc = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let location = await Location.getCurrentPositionAsync();
      setNewlat(location.coords.latitude);
      setNewlng(location.coords.longitude);
      alert('Location Changed');
    }
  }

  //Alert In and Out
  useEffect(() => {
   const d = getDistance(lat, newlat, lng, newlng)
    if(d > radius) {
      if(isInRange) alert('Out of range')
      setIsInRange(false)
    } else {
      if(!isInRange) alert('You are in range')
      setIsInRange(true)
    }
  }, [lat, newlat, lng, newlng, radius])

  return (
    <View style={styles.container}>
    <View style={styles.button1}>
      <Button title="Change Radius"  onPress={() => { setModalVisible(true) }}/>
    </View>
    <View style={styles.button2}>
      <Button title="Change Location"  onPress={() => { newLoc() }}/>
    </View>
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Radius not changed");
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TextInput
                style={styles.input}
                placeholder="Change Radius(m)"
                keyboardType="numeric"
                onChangeText={(value) => setRadius(parseInt(value))}
              />
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Change</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
      <MapView style={styles.map}
        region={{
          latitude: lat, longitude: lng,
          latitudeDelta: 0.09, longitudeDelta: 0.04
        }}
      >
        <Marker
          coordinate={{ latitude: lat, longitude: lng }}
        >
          <Callout>
            <Text>I'm here</Text>
          </Callout>
        </Marker>
        <Circle center={{ latitude: newlat, longitude: newlng }} radius={radius} />
      </MapView>
      <View style={styles.msg}>
        <Text style={styles.msgtxt}>{isInRange ? 'IN' : 'OUT'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button1: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 999
  },
  button2: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 999
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  msg: {
    position: 'absolute',
    top: 150,
    right: 23,
    height: 40,
    width: 50,
    backgroundColor: "black",
    justifyContent: 'center',
    alignContent: 'center'
  },
  msgtxt: {
    alignSelf: 'center',
    fontSize: 20,
    color: "white",
    fontWeight: 'bold'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  input: {
    width: "80%",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    marginBottom: 8,
  }
});
