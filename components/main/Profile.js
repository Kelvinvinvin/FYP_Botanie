import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Image, FlatList, Button, Alert, TouchableOpacity, PermissionsAndroid, Platform, ScrollView, SafeAreaView } from 'react-native'
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../utils/index'



import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { fetchUserPosts } from '../../redux/actions/index';

function Profile(props) {
    const [userPosts, setUserPosts] = useState([]);
    const [user, setUser] = useState([null]);
    const [following, setFollowing] = useState(false);



    useEffect(() => {
        const { currentUser, posts } = props;


        if (props.route.params.uid === firebase.auth().currentUser.uid) {
            setUser(currentUser)
            setUserPosts(posts)

        }
        else {
            firebase.firestore()
                .collection("users")
                .doc(props.route.params.uid)
                .get()
                .then((snapshot) => {
                    if (snapshot.exists) {
                        setUser(snapshot.data());
                    } else {
                        console.log('does not exist')
                    }
                })
            firebase.firestore()
                .collection("posts")
                .doc(props.route.params.uid)
                .collection("userPosts")
                .orderBy("creation", "asc")
                .get()
                .then((snapshot) => {
                    let posts = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data }
                    })
                    setUserPosts(posts)
                })
        }



        if (props.following.indexOf(props.route.params.uid) > -1) {
            setFollowing(true);
        } else {
            setFollowing(false);
        }

    }, [props.route.params.uid, props.following, props.posts])

    const onFollow = () => {
        firebase.firestore()
            .collection("following")
            .doc(firebase.auth().currentUser.uid)
            .collection("userFollowing")
            .doc(props.route.params.uid)
            .set({})
    }

    const onUnfollow = () => {
        firebase.firestore()
            .collection("following")
            .doc(firebase.auth().currentUser.uid)
            .collection("userFollowing")
            .doc(props.route.params.uid)
            .delete()
    }

    const deleteAlert = (props) =>
        Alert.alert(
            "Happy Tips",
            "Do you in a bad mood? Just hold on for awhile, take a brake and a cup of coffee... (๑ᵔ⌔ᵔ๑)",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "Yes", onPress: () => console.log("Button is Pressed")
                }
            ]
        );

    // ------------------------from https://www.youtube.com/watch?v=GEtqS9Qozv4&t=1757s ---------------
    // const checkPermission = async () => {
    //     if(Platform.OS === 'ios'){
    //         downloadImage()
    //     }else {
    //         try {
    //             const granted = await PermissionsAndroid.request(
    //                 PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    //                 {
    //                     title: 'Storage Permission Required',
    //                     message: 'App needs access to your storage to download Photos'
    //                 }
    //             )
    //             if(granted === PermissionsAndroid.RESULTS.GRANTED) {
    //                 console.log('Storage Permission Granted.')
    //                 downloadImage()
    //             }else {
    //                 alert('Storage Permission Not Granted')
    //             }
    //         } catch (error) {
    //             console.warn(error)
    //         }
    //     }
    // }

    // const downloadImage = () => {
    //     let date = new Date()
    //     let image_URL = 
    //     let ext = getExtention(image_URL)
    //     ext ='.' + ext[0]
    //     const { config, fs} = RNFetchBlob
    //     let PictureDir = fs.dirs.PictureDir
    //     let options = {
    //         fileCache: true,
    //         addAndroidDownloads: {
    //             useDownloadManager: true,
    //             notification: true,
    //             path: PictureDir + '/image_' +
    //             Math.floor(date.getTime() + date.getSeconds()/2) + ext,
    //             description: 'Image'
    //         }
    //     }
    //     config(options)
    //     .fetch('GET',image_URL)
    //     .then(res => {
    //         console.log('res -> ', JSON.stringify(res))
    //         alert('Image Download Sucessfully.')
    //     })
    // }

    // const getExtention = filename => {
    //     return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined
    // }

    /*---------------from Hindi tutorial--------------------*/

    // onSelectedImage = () => {
    //     const splitedArray = item.path.split('/');
    //     const fileName = splitedArray[splitedArray.length - 1];
    //     this.saveImage()
    // }

    // saveImage(data: {source:String,path:String}){

    // }

    /*----------------------------------------------------*/

    const onLogout = () => {
        firebase.auth().signOut();
    }

    if (user === null) {
        return <View />
    }

    return (
        <View style={styles.container}>
            <View style={styles.containerInfo}>
                
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}><FontAwesome name="user-circle-o" size={24} color="black" /><Text> </Text>{user.name}</Text>
                <Text>{user.email}</Text>
                <MaterialCommunityIcons name="frequently-asked-questions" size={27} color="black"  style={styles.faqIcons} onPress={() => props.navigation.navigate('FAQ')}/>

                {props.route.params.uid !== firebase.auth().currentUser.uid ? (
                    <View>
                        {following ? (
                            <TouchableOpacity onPress={() => onUnfollow()} style={styles.mainFollowButton}>
                                <Text style={styles.followText}>Following</Text>
                            </TouchableOpacity>
                        ) :
                            (

                                <TouchableOpacity onPress={() => onFollow()} style={styles.mainFollowButton}>
                                    <Text style={styles.followText}>Follow</Text>
                                </TouchableOpacity>
                            )}
                    </View>
                ) :
                    <TouchableOpacity onPress={() => onLogout()} style={styles.mainLogoutButton}>
                        <MaterialCommunityIcons name="logout" size={30} color="white" />
                    </TouchableOpacity>
                }
                <TouchableOpacity onPress={() => props.navigation.navigate('Weather')} style={styles.mainCameraButton}>
                    <FontAwesome name="cloud" size={30} color="white" />
                </TouchableOpacity>
            </View>

            <SafeAreaView style={styles.containerGallery}>
                <FlatList
                    numColumns={3}
                    horizontal={false}
                    data={userPosts}
                    renderItem={({ item }) => (

                        <View
                            style={styles.containerImage}>
                            <TouchableOpacity onLongPress={deleteAlert}>
                                <Image
                                    style={styles.image}
                                    source={{ uri: item.downloadURL }}
                                />
                                <Text>{item.caption}</Text>
                            </TouchableOpacity>

                        </View>
                    )}

                />
            </SafeAreaView>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerInfo: {
        margin: 20
    },
    containerGallery: {
        paddingTop: 50,
        flex: 1
    },
    containerImage: {
        flex: 1 / 3

    },
    image: {
        flex: 1,
        aspectRatio: 1 / 1,
        padding: 10,
    },
    mainCameraButton: {
        width: 100,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#00D100',
        position: "absolute",
        bottom: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: {
            width: 8,
            height: 8,
        },
        shadowColor: "black",
        shadowRadius: 8,
        top: 50,
        left: 200,
    },
    mainLogoutButton: {
        width: 100,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#00D100',
        position: "absolute",
        bottom: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: {
            width: 8,
            height: 8,
        },
        shadowColor: "black",
        shadowRadius: 8,
        top: 50,
        left: 30,

    },
    mainFollowButton: {
        width: 100,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#00D100',
        position: "absolute",
        bottom: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: {
            width: 8,
            height: 8,
        },
        shadowColor: "black",
        shadowRadius: 8,
        bottom: -18,
        left: 30,

    },
    followText: {
        fontWeight: 'bold',
        color: 'white'
    },
    profileIcons: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 15,

    },
    faqIcons: {
        alignItems: 'center',
        justifyContent: 'center',
        left: 280,
        bottom: 40,
    }
})

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    posts: store.userState.posts,
    following: store.userState.following
})

const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUserPosts }, dispatch);
export default connect(mapStateToProps, mapDispatchProps)(Profile);