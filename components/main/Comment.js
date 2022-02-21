import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'

import firebase from 'firebase'
require('firebase/firestore')

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUsersData } from '../../redux/actions/index'

function Comment(props) {
    const [comments, setComments] = useState([]);
    const [postId, setPostId] = useState("");
    const [text, setText] = useState("");

    useEffect(() => {

        function matchUserToComment(comments) {
            for (let i = 0; i < comments.length; i++) {

                if (comments[i].hasOwnProperty('user')) {
                    continue;
                }


                const user = props.users.find(x => x.uid === comments[i].creator)
                if (user == undefined) {
                    props.fetchUsersData(comments[i].creator, false)
                } else {
                    comments[i].user = user
                }
            }
            setComments(comments)
        }

        if (props.route.params.postId !== postId) {
            firebase.firestore()
                .collection('posts')
                .doc(props.route.params.uid)
                .collection('userPosts')
                .doc(props.route.params.postId)
                .collection('comments')
                .get()
                .then((snapshot) => {
                    let comments = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data }
                    })
                    matchUserToComment(comments)
                })
            setPostId(props.route.params.postId)
        } else {
            matchUserToComment(comments)
        }

    }, [props.route.params.postId, props.users])

    const onCommentSend = () => {
        firebase.firestore()
            .collection('posts')
            .doc(props.route.params.uid)
            .collection('userPosts')
            .doc(props.route.params.postId)
            .collection('comments')
            .add({
                creator: firebase.auth().currentUser.uid,
                text
            })
    }

    return (
        <ScrollView>
            <FlatList

                numColumns={1}
                horizontal={false}
                data={comments}
                renderItem={({ item }) => (
                    <View>
                        {item.user !== undefined ?
                            <Text style={{ fontWeight: 'bold', fontSize: 15, paddingTop: 10 }}>
                                <FontAwesome name="user-circle-o" size={20} color="black" /><Text> </Text>
                                {item.user.name}
                            </Text>
                            : null}
                        <Text style={{}}> {item.text}</Text>
                    </View>
                )}
            />

            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
                <TextInput
                    placeholder='comment...'
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
                    onChangeText={(text) => setText(text)}
                />

                <View style={{paddingTop: 20}}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => onCommentSend()}
                    >
                        <Text style={styles.textColor}> Send </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
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
    }
})

const mapStateToProps = (store) => ({
    users: store.usersState.users,
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Comment);
