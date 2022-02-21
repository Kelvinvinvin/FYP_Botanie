import React, { Component } from 'react'
import {View, StyleSheet, Text} from 'react-native'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import firebase from 'firebase'

export class Register extends Component {
    //first function to be called when a component is created
    constructor(props){
        super(props);

        this.state ={
            email: '',
            password: '',
            name: ''
        }

        this.onSignUp = this.onSignUp.bind(this)
    }

    onSignUp(){
        const{email, password, name} =this.state;
        if (name.length == 0 || email.length == 0 || password.length == 0) {
            alert("Please fill in empty field")
            return;
        }
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((result) => {
            firebase.firestore().collection("users")
                .doc(firebase.auth().currentUser.uid)
                .set({
                    name, 
                    email
                })
            console.log(result)
        })
        .catch((error) => {
            console.log(error);
            alert("Please signup with valid password with no empty field")
        })
    }

    //to be called if there is state component change
    render() {
        return (
            <View style={styles.root}>
                <Text style={{ fontSize: 25, marginTop: 20 }}>Welcome To Botanie! </Text>
                <Text style={{ fontSize: 16, color: 'gray', marginTop: 20 }}>Sign up for the first time use</Text>
                <View>
                 <TextInput 
                     placeholder="name"
                     onChangeText={(name) => this.setState({name})}
                     style={{ marginTop: 40, borderBottomColor: '#ddd', borderBottomWidth: 1, paddingBottom: 20 }}
                 />
                 <TextInput 
                     placeholder="email"
                     onChangeText={(email) => this.setState({email})}
                     style={{ marginTop: 40, borderBottomColor: '#ddd', borderBottomWidth: 1, paddingBottom: 20 }}
                 />
                 <TextInput 
                     placeholder="password"
                     secureTextEntry = {true}
                     onChangeText={(password) => this.setState({password})}
                     style={{ marginTop: 40, borderBottomColor: '#ddd', borderBottomWidth: 1, paddingBottom: 20 }}
                        />
                </View>
                <TouchableOpacity
                        onPress={() => this.onSignUp()}
                        style={{ width: 200, backgroundColor: '#00D100', padding: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 40, marginTop: 30 }}
                    >
                        <Text style={{ textAlign: 'center', color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Sign Up</Text>
                    </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 20,
        alignContent: 'center',
    },
});

export default Register