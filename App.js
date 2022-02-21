import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View, LogBox } from 'react-native';
import firebase from 'firebase'
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

  // --------------------//
  // firebase api key
  // -------------------//
  
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './redux/reducers'
import thunk from 'redux-thunk'
const store = createStore(rootReducer, applyMiddleware(thunk))

// import { createAppContainer } from 'react-navigation';
// import { createStackNavigator } from 'react-navigation-stack';

import LandingScreen from './components/auth/Landing'
import RegisterScreen from './components/auth/Register'
import LoginScreen from './components/auth/Login'
import MainScreen from './components/Main'
import AddScreen from './components/main/Add'
import SaveScreen from './components/main/Save'
import CommentScreen from './components/main/Comment'
import WeatherScreen from './components/main/Weather'
import InfoScreen from './components/main/Info';
import FAQScreen from './components/main/FAQ'
import GameInventoryScreen from './components/main/Game_Inventory'
import GameShopScreen from './components/main/Game_Shop'
import GameQuizScreen from './components/main/Game_Quiz'
import GameStartQuizScreen from './components/main/Game_StartQuiz'
import GameAchievementScreen from './components/main/Game_Achievement'

//Be the screen and control the route
const Stack = createStackNavigator();

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        this.setState({
          loggedIn: false,
          loaded: true,
        })
      } else {
        this.setState({
          loggedIn: true,
          loaded: true,
        })
      }
    })
  }
  render() {
    const { loggedIn, loaded } = this.state;
    if (!loaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{fontWeight: 'bold'}}>
            Loading...
          </Text>
        </View>
      )
    }
    if (!loggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{
              headerStyle: {
                backgroundColor: '#00D100',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}/>
            <Stack.Screen name="Login" component={LoginScreen} options={{
              headerStyle: {
                backgroundColor: '#00D100',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}/>
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
    return (
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Botanie">
            <Stack.Screen name="Botanie" component={MainScreen} options={{
              headerStyle: {
                backgroundColor: '#00D100',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }} />
            <Stack.Screen name="Add" component={AddScreen} navigation={this.props.navigation} options={{
              headerStyle: {
                backgroundColor: '#00D100',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}/>
            <Stack.Screen name="Save" component={SaveScreen} navigation={this.props.navigation} options={{
              headerStyle: {
                backgroundColor: '#00D100',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}/>
            <Stack.Screen name="Comment" component={CommentScreen} navigation={this.props.navigation} options={{
              headerStyle: {
                backgroundColor: '#00D100',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}/>
            <Stack.Screen name="Weather" component={WeatherScreen} navigation={this.props.navigation} options={{
              headerStyle: {
                backgroundColor: '#00D100',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}/>
            <Stack.Screen name="Info" component={InfoScreen} navigation={this.props.navigation} options={{
              headerStyle: {
                backgroundColor: '#00D100',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}/>
            <Stack.Screen name="FAQ" component={FAQScreen} navigation={this.props.navigation} options={{
              headerStyle: {
                backgroundColor: '#00D100',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}/>
            <Stack.Screen options={{ headerShown: false }} name="Game_Inventory" component={GameInventoryScreen} navigation={this.props.navigation} />
            <Stack.Screen options={{ headerShown: false }} name="Game_Shop" component={GameShopScreen} navigation={this.props.navigation} />
            <Stack.Screen options={{ headerShown: false }} name="Game_Quiz" component={GameQuizScreen} navigation={this.props.navigation} />
            <Stack.Screen options={{ headerShown: false }} name="Game_StartQuiz" component={GameStartQuizScreen} navigation={this.props.navigation} />
            <Stack.Screen options={{ headerShown: false }} name="Game_Achievement" component={GameAchievementScreen} navigation={this.props.navigation} />
          </Stack.Navigator>
        </NavigationContainer>

      </Provider>

    )
  }
}

export default App


