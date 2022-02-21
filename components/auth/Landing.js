import * as React from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, Button } from 'react-native';

export default function Landing({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={{ textAlign: 'center', color: 'black', fontSize: 30, fontWeight: 'bold', fontStyle: 'italic' }}>BOTANIE</Text>
            <Image
                style={{ width: "100%", height: 300 }}
                source={require('../../assets/images/Logo_4.png')}
                resizeMode="contain"
            />
            <Text style={{ fontSize: 40, fontWeight: 'bold' }} >Hello!</Text>
            <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center', marginHorizontal: 20 }} >Welcome to Botanie. An app make you love nature.</Text>
            <View style={{ flexDirection: 'row', margin: 20, paddingVertical: 20 }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Login")}
                    style={{ backgroundColor: '#00D100', padding: 10, width: 150, borderRadius: 30, marginHorizontal: 2 }}
                >
                    <Text style={{ textAlign: 'center', color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate("Register")}
                    style={{ backgroundColor: '#FFF', padding: 10, width: 150, borderRadius: 30, marginHorizontal: 2, borderWidth: 1, borderColor: '#00D100' }}
                >
                    <Text style={{ textAlign: 'center', color: '#00D100', fontSize: 18, fontWeight: 'bold' }}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center'
    }
})
