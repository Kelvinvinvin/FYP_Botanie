import React, { Component, useEffect } from 'react'
import { View, Text, StatusBar, ScrollView } from 'react-native'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import firebase from 'firebase'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUser, fetchUserPosts, fetchUserFollowing, clearData, reload } from '../redux/actions/index'

import FeedScreen from './main/Feed'
import AddScreen from './main/Add'
import ProfileScreen from './main/Profile'
import SearchScreen from './main/Search'
import GameScreen from './main/Game'
import { event } from 'react-native-reanimated';

const Tab = createMaterialBottomTabNavigator();
const EmptyScreen = () => {
    return (null)
}

export class Main extends Component {
    componentDidMount() {
        this.props.clearData();
        this.props.fetchUser();
        this.props.fetchUserPosts();
        this.props.fetchUserFollowing();
        // this.props.reload();
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <Tab.Navigator initialRouteName="Feed"
                    labeled={false}
                    tabBarOptions={{
                        showIcon: true, showLabel: false, indicatorStyle: {
                            opacity: 0
                        }
                    }}
                    barStyle={{ backgroundColor: '#00D100' }}>
                    <Tab.Screen name="Feed" component={FeedScreen}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <MaterialCommunityIcons name="home" color={color} size={26} />
                            ),
                        }} />
                    <Tab.Screen name="Search" component={SearchScreen} navigation={this.props.navigation}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <MaterialCommunityIcons name="magnify" color={color} size={26} />
                            ),
                        }} />
                    <Tab.Screen name="AddContainer" component={EmptyScreen}
                        listeners={({ navigation }) => ({
                            tabPress: event => {
                                event.preventDefault();
                                navigation.navigate("Add")
                            }
                        })}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <MaterialCommunityIcons name="plus-box" color={color} size={26} />
                            ),
                        }} />
                        <Tab.Screen name="GameScreen" component={GameScreen}
                            listeners ={({navigation}) => ({
                                tabPress: event => {
                                    event.preventDefault();
                                    navigation.navigate("GameScreen", {uid:firebase.auth().currentUser.uid})
                            }})}
                            options={{
                                tabBarIcon: ({color, size}) =>(
                                    <MaterialCommunityIcons name="gamepad-variant-outline" color={color} size={24}/>
                                ),
                            }} />
                    <Tab.Screen name="Profile" component={ProfileScreen}
                        listeners={({ navigation }) => ({
                            tabPress: event => {
                                event.preventDefault();
                                navigation.navigate("Profile", { uid: firebase.auth().currentUser.uid })
                            }
                        })}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <MaterialCommunityIcons name="account-circle" color={color} size={26} />
                            ),
                        }} />
                </Tab.Navigator>
            </View>

        )
    }
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser
    // posts: store.userState.posts
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUser, fetchUserPosts, fetchUserFollowing, clearData }, dispatch);


export default connect(mapStateToProps, mapDispatchProps)(Main);
