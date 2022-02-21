import * as React from 'react'
import { View, Button, Image, ScrollView, StyleSheet, Text } from 'react-native'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import * as Animatable from 'react-native-reanimated';

import firebase from 'firebase'


export class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
        }

        this.onSignUp = this.onSignUp.bind(this)
    }

    onSignUp() {
        const { email, password } = this.state;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((result) => {
                console.log(result)
            })
            .catch((error) => {
                alert("Please enter correct email and password.")
                console.log(error)
                
            })
    }

    render() {
        return (
            <ScrollView>
                <View style={styles.root}>
                    <Text style={{ fontSize: 25, marginTop: 20 }}>Welcome Back! </Text>
                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 20 }}>Sign in to continue</Text>
                    <View>
                        <TextInput
                            placeholder="email"
                            onChangeText={(email) => this.setState({ email })}
                            style={{ marginTop: 40, borderBottomColor: '#ddd', borderBottomWidth: 1, paddingBottom: 20 }}
                        />
                        <TextInput
                            placeholder="password"
                            secureTextEntry={true}
                            onChangeText={(password) => this.setState({ password })}
                            style={{ marginTop: 40, borderBottomColor: '#ddd', borderBottomWidth: 1, paddingBottom: 20 }}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => this.onSignUp()}
                        style={{ width: 200, backgroundColor: '#00D100', padding: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 40, marginTop: 30 }}
                    >
                        <Text style={{ textAlign: 'center', color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Login Now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
    logo: {
        width: '70%',
        maxWidth: 300,
        maxHeight: 200,
    },
    containter: {
        backgroundColor: 'white',
        width: '100%',
        flex: 1,
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 5,
    },



})


export default Login