import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, PermissionsAndroid, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import { CAMERA_ROLL } from 'expo-permissions';
import axios from 'axios';
import { config } from '../../config';
import * as api from '../../api'
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'


export default function Add({ navigation }) {

  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAlbumPermission, setHasAlbumPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const galleryStatus = await ImagePicker.requestCameraRollPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');


    })();
  }, []);

  const AnalysePicture = async () => {
    try {
      console.log("Picture Taken!");
      if (camera) {
        const options = { base64: true };
        camera
          .takePictureAsync(options)
          .then(photo => {
            camera.pausePreview();
            console.log("photo taken");
            handleSave(photo.uri);
            api.getPlantById(photo.base64);
          })
      }
    } catch (error) {
      console.log(error)
    }
  }


  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      console.log(result);

      if (!result.cancelled) {
        setImage(result.uri);
        alert("You have selected your photo. Please press save button.")
      }
    } catch (error) {
      console.log(error)
      alert("Unable to pick image")
    }

  };

  const handleSave = async (image) => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === "granted") {
        const assert = await MediaLibrary.createAssetAsync(image);
        await MediaLibrary.createAlbumAsync("Botanie", assert);
      } else {
        console.log("Oh You Missed to give permission");
      }
    } catch (error) {
      console.log(error)
      alert("Unable to save to phone")
    }
  }


  if (hasCameraPermission === null || hasGalleryPermission === false) {
    return <View />;
  }
  if (hasCameraPermission === false || hasGalleryPermission === false) {
    return <Text>No access to camera</Text>;
  }
  if (hasAlbumPermission === false) {
    return <Text>Require Permission to Save Your Image In Phone</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={ref => setCamera(ref)}
          style={styles.fixedRatio}
          type={type}
          ratio={'1:1'} />
      </View>
      <View style={styles.instrucText}>
        <Text>
          You can save your photo in your account at below here. Any doubt please press '?' button above
        </Text>
        <Text>
          <Text style={{ fontWeight: 'bold' }}>
            *Important note. 
          </Text>
          <Text> </Text>
          After you select your photo, you have to press save icon to save photo into your account.
        </Text>
      </View>

      <TouchableOpacity onPress={() => AnalysePicture()} style={styles.mainCameraButton}>
        <MaterialCommunityIcons name='camera' size={30} color="white" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Info')} style={styles.mainInfoButton}>
        <MaterialCommunityIcons name='help' size={30} color="white" />
      </TouchableOpacity>
      <View>
        <Text style={styles.mainGalleryText}>
          Gallery
        </Text>
        <Text style={styles.mainSaveText}>
          Save
        </Text>
      </View>

      <TouchableOpacity onPress={() => pickImage()} style={styles.mainGalleryButton}>
        <MaterialCommunityIcons name='folder' size={50} color="white" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Save', { image })} style={styles.mainSaveButton}>
        <MaterialCommunityIcons name='upload' size={50} color="white" />
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1
  },
  mainCameraButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#00D100',
    position: "absolute",
    bottom: 90,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowColor: "black",
    shadowRadius: 8,
    top: 280,
    left: 150,
  },
  mainInfoButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#00D100',
    position: "absolute",
    bottom: 90,
    right: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowColor: "black",
    shadowRadius: 8,
    top: 280,
    right: 30,
  },
  mainGalleryButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#00D100',
    position: "absolute",
    bottom: 90,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowColor: "black",
    shadowRadius: 8,
    left: 50

  },
  mainSaveButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#00D100',
    position: "absolute",
    bottom: 90,
    right: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowColor: "black",
    shadowRadius: 8,
    right: 50,
  },
  mainGalleryText: {
    width: 60,
    height: 60,
    position: "absolute",
    bottom: 27,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    left: 57,
    fontWeight: "bold"
  },
  mainSaveText: {
    position: "absolute",
    bottom: 70,
    right: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    right: 65,
    fontWeight: "bold"
  },
  instrucText: {
    flex: 1 / 1.5,

  }
})