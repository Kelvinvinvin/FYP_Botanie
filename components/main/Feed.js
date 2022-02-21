import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Image, FlatList, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native'
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'
import Ionic from 'react-native-vector-icons/Ionicons'

import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { reload, fetchFeedPosts } from '../../redux/actions/index'

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

function Feed(props) {
    const [posts, setPosts] = useState([]);
    const [refreshing, setRefreshing] = useState(false)
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
    }, []);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (props.usersFollowingLoaded == props.following.length && props.following.length !== 0) {
            props.feed.sort(function (x, y) {
                return x.creation - y.creation;
            })
            setPosts(props.feed);
            setRefreshing(false)
        }
        console.log(posts)

        const interval = setInterval(() => {
            setSeconds(seconds => seconds + 1);
        }, 1000);
        return () => clearInterval(interval);


    }, [props.usersFollowingLoaded, props.feed])

    return (

        <View style={styles.container}>
            <View style={styles.containerGallery}>
                <FlatList
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                onRefresh;
                                setRefreshing(false);
                                props.reload();
                            }
                            }
                        />
                    }
                    numColumns={1}
                    horizontal={false}
                    data={posts}
                    renderItem={({ item }) => (
                        <View
                            style={styles.containerImage}>
                            <View style={{ paddingBottom: 10, paddingTop: 20, paddingLeft: 10, }} >
                                <Text style={{ fontSize: 15, fontWeight: 'bold', }}><FontAwesome name="user-circle-o" size={24} color="black" /> {item.user.name}</Text>
                            </View>
                            <View
                                style={{
                                    position: 'relative',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Text style={{fontSize: 15}}>{item.caption}</Text>
                                <Image
                                    style={{ width: '100%', height: 400 }}
                                    source={{ uri: item.downloadURL }}
                                />
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingHorizontal: 12,
                                paddingVertical: 15,
                            }}>
                                <TouchableOpacity
                                    onPress={() => props.navigation.navigate('Comment',
                                        { postId: item.id, uid: item.user.uid })}>
                                    <Ionic
                                        name="ios-chatbubble-outline"
                                        style={{ fontSize: 22, paddingRight: 10, }}
                                    />

                                </TouchableOpacity>



                                <TouchableOpacity onPress={() => props.navigation.navigate('Comment',
                                    { postId: item.id, uid: item.user.uid })}>
                                    <Text>View Comments...</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',

    },
    containerInfo: {
        margin: 20
    },
    containerGallery: {
        flex: 1
    },
    containerImage: {
        flex: 1 / 3,

    },
    image: {
        flex: 1,
        aspectRatio: 1 / 1
    }
})

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    following: store.userState.following,
    feed: store.usersState.feed,
    usersFollowingLoaded: store.usersState.usersFollowingLoaded,
})

const mapDispatchProps = (dispatch) => bindActionCreators({ reload, fetchFeedPosts }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Feed);
