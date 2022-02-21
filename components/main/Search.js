import React, { useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StatusBar } from 'react-native'
import Ionic from 'react-native-vector-icons/Ionicons'

import firebase from 'firebase';
require('firebase/firestore');

export default function Search(props) {
    const [users, setUsers] = useState([])

    const fetchUsers = (search) => {
        if(search){
            firebase.firestore()
            .collection('users')
            .where('name', '>=', search)
            .get()
            .then((snapshot) => {
                let users = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                });
                setUsers(users);
            })
        }else{
            setUsers([]);
        }

    }
    return (
        <View
        style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            paddingVertical: 30,
            position: 'relative',
        }}>
            <TextInput
                placeholder="Search"
                placeholderTextColor="#909090"
                style={{
                    width: '94%',
                    backgroundColor: '#EBEBEB',
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    padding: 4,
                    paddingLeft: 40,
                }}
                onChangeText={(search) => fetchUsers(search)}
            />
            <FlatList
                numColumns={1}
                horizontal={false}
                data={users}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => props.navigation.navigate("Profile", {uid: item.id})}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>

                )}
            />
        </View>

    )
}