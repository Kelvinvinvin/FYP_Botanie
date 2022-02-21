import React, { useState, useEffect } from 'react'
import { Alert } from 'react-native'

import axios from "axios";
import { config } from "./config";


export const getPlantById = (base64: any) => {
    console.log("in the api");
  
    const plantImg = {images:[base64]};
    let axiosConfig = {
      headers: {
        "Content-Type": "application/json",
        "Api-Key": config.PLANT_ID_API_KEY,
      },
    };
    console.log("test 1")
    return axios
    .post("https://api.plant.id/v2/identify", plantImg, axiosConfig)
    .then(({ data: { suggestions } }) => {
      const scientificName = suggestions[0].plant_details;
      Alert.alert(
        "Your Plant Result: ",
        JSON.stringify(scientificName),
        [
            {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
            },
            {
                text: "Yes", onPress: () => console.log("Button is Pressed")
            }
        ]
    );
      // alert(JSON.stringify(scientificName))
      console.log(scientificName)
    })
    .catch(err => {
      alert("Unable to identify the plant. Please capture another photo")
      console.log(err);
    });
  };

