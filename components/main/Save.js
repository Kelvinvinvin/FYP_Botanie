import React, { useState } from 'react'
import { View, TextInput, Image, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchUserPosts } from '../../redux/actions';

import firebase from 'firebase'
require("firebase/firestore")
require("firebase/firebase-storage")

function Save(props) {
    const [caption, setCaption] = useState("")

    const uploadImage = async () => {
        const uri = props.route.params.image;
        const childPath = `post/${firebase.auth().currentUser.uid}/${Math.random().toString(36)}`;
        console.log(childPath)

        const response = await fetch(uri);
        const blob = await response.blob();

        const task = firebase
            .storage()
            .ref()
            .child(childPath)
            .put(blob);

        const taskProgress = snapshot => {
            console.log(`transferred: ${snapshot.bytesTransferred}`)
        }

        const taskCompleted = () => {
            task.snapshot.ref.getDownloadURL().then((snapshot) => {
                savePostData(snapshot);
                console.log(snapshot);
                alert("Your photo is saved to database successfully. You can see your photo in profile.");
                // Alert.alert(
                //     "Done",
                //     "You have successfully save your photo in database, you may see it in your profile.",
                //     [
                //         {
                //             text: "Cancel",
                //             onPress: () => console.log("Cancel Pressed"),
                //             style: "cancel"
                //         },
                //         {
                //             text: "Yes", onPress: () => props.navigation.navigate('Profile')
                //         }
                //     ]
                // )

            })
        }

        const taskError = snapshot => {
            console.log(snapshot)
        }

        task.on("state_changed", taskProgress, taskError, taskCompleted);

    }

    const savePostData = (downloadURL) => {
        try {
            firebase.firestore()
                .collection('posts')
                .doc(firebase.auth().currentUser.uid)
                .collection("userPosts")
                .add({
                    downloadURL,
                    caption,
                    creation: firebase.firestore.FieldValue.serverTimestamp()
                }).then((function () {
                    props.fetchUserPosts()
                    props.navigation.popToTop()
                }))
        } catch (error) {
            console.log(error)
        }

    }
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
            <Image source={{ uri: props.route.params.image }} />
            <TextInput
                placeholder="Write somethings...."
                style={{
                    width: '94%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    padding: 4,
                    paddingLeft: 40,
                }}
                onChangeText={(caption) => setCaption(caption)}
            />

            <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 20
            }}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => uploadImage()}
                >
                    <Text style={styles.textColor}> Save </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00D100',
        padding: 10,
        width: 150,
        height: 50
    },
    textColor: {
        color: 'white',
        fontWeight: 'bold',
    },
})


const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUserPosts }, dispatch);
export default connect(null, mapDispatchProps)(Save);

