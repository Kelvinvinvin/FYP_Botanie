import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import * as Location from 'expo-location'
import ImageLoader from 'react-native-web/dist/cjs/modules/ImageLoader'
import WeatherInfo from './WeatherInfo'
import UnitsPicker from './UnitsPicker'
import ReloadWeather from './ReloadWeather'
import WeatherDetails from './WeatherDetails'

const WEATHER_API_KEY = '-- apply api key from openweathermap --'
const BASE_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather?'

export default function Weather() {

    const [errorMessage, setErrorMessage] = useState(null)
    const [currentWeather, setCurrentWeather] = useState(null)
    const [unitsSystem, setUnitsSystem] = useState('metric')

    useEffect(() => {
        load()
    }, [unitsSystem])

    async function load() {
        setCurrentWeather(null)
        setErrorMessage(null)
        try {
            let { status } = await Location.requestForegroundPermissionsAsync()

            if (status !== 'granted') {
                setErrorMessage('Access to location is needed to run the app')
                return
            }
            const location = await Location.getCurrentPositionAsync()

            const { latitude, longitude } = location.coords

            const weatherUrl = `${BASE_WEATHER_URL}lat=${latitude}&lon=${longitude}&units=${unitsSystem}&appid=${WEATHER_API_KEY}`

            const response = await fetch(weatherUrl)

            const result = await response.json()

            if (response.ok) {
                setCurrentWeather(result)
            } else {
                setErrorMessage(result.message)
            }
        } catch (error) {
            setErrorMessage(error.message)
        }
    }

    if (currentWeather) {

        return (
            <View style={styles.container}>
                <View style={styles.main}>
                    <UnitsPicker unitsSystem={unitsSystem} setUnitsSystem={setUnitsSystem} />
                    <ReloadWeather load={load} />
                    <WeatherInfo currentWeather={currentWeather} />
                </View>
                <WeatherDetails currentWeather={currentWeather} unitsSystem={unitsSystem} />
            </View>
        )
    } else if (errorMessage) {

        return (
            <View style={styles.container}>
                <ReloadWeather load={load} />
                <Text style={{ textAlign: 'center' }}>{errorMessage}</Text>
            </View>
        )
    } else {
        return (
            <View style={styles.container}>
                <ActivityIndicator />
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    main: {
        justifyContent: 'center',
        flex: 1
    }
})
