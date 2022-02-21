import React from 'react'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Feather } from '@expo/vector-icons';


export default function Info() {
    return (
        <ScrollView style={{ flex: 1, padding: 10 }}>
            <View>
                <Text style={{ fontWeight: 'bold', fontSize: 18, paddingTop: 15, fontFamily: 'sans-serif-condensed' }}>
                    Manual to use the Plant Recognition.
                </Text>
            </View>
            <View style={{ paddingTop: 20 }}>
                <MaterialCommunityIcons name='camera' size={30} />
                <Text>
                    Press this to analyse plant.
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <MaterialCommunityIcons name='folder' size={30} />
                <Text>
                    Press this to select photo from gallery.
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <MaterialCommunityIcons name='upload' size={30} />
                <Text>
                    Press this to save your photo selected to database.
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, paddingTop: 20, fontFamily: 'sans-serif-condensed'}}>
                    The steps to use the plant recogntion.
                </Text>

            </View>
            <View style={{ paddingTop: 10 }}>
                <Text>
                    1. After you press the capture, you have to wait for awhile to retrieve the result. Remember to hold your phone stable until the photo is freezed to prevent blur images.
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <Text>
                    2. You can press the Gallery to select the photo you capture just now. Next, you can press Save and you will be led into Saving post page.
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <Text>
                    3. Next, you can press Save and you will be led into Saving post page.
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <Text>
                    4. You can enter any caption you like to label the photo and you have to press Save button.
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <Text>
                    5. You can view your photo in the Profile page.
                </Text>
            </View>
            <View style={{ paddingTop: 20 }}>
                <MaterialCommunityIcons name="frequently-asked-questions" size={30} color="black" style ={styles.faqIcons}/>
                <Text style={styles.faqTitles}>
                    FAQ
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <Text style = {styles.questionsAsk}>
                    Q: How do I capture another plant photo for recognition.
                </Text>
                <Text>
                    A: You have to quit the camera and press the camera page again.
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <Text style = {styles.questionsAsk}>
                    Q: Why the apps didn't return results?
                </Text>
                <Text>
                    A: The apps need some time to return your result. Please be patient. (❛˓◞˂̵✧)
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <Text style = {styles.questionsAsk}>
                    Q: Why my camera screen is freeze when I capture photo?
                </Text>
                <Text>
                    A: It is one of the design of the apps where it enable the photo taken is clearer.
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <Text style = {styles.questionsAsk}>
                    Q: If I found any problems where should I give the feedback?
                </Text>
                <Text>
                    A: You may email to <Text style={{fontWeight: 'bold'}}>'lzmkelvin84892@gmail.com'</Text> or <Text style={{fontWeight: 'bold'}}>'aericsee@gmail.com'</Text>.
                </Text>
            </View>
            <View style={{ paddingTop: 20}}>
                <Feather name="alert-triangle" size={30} color="black" style={styles.alertIcons} />
                <Text style={styles.alertText}>
                    Any results retrieve is used as reference. The results return may inaccurate. Please appraoch experts if the results return is wrong.
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                <Text>
                </Text>
                <Text>
                </Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    alertIcons: {
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        left: 150,
        paddingBottom: 15,
    },
    faqIcons: {
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        left: 170,
        top: 10,
    },
    faqTitles: {
        alignItems: 'center',
        justifyContent: 'center',
        justifyContent: 'center',
        left: 130,
        fontWeight: 'bold',
        fontSize: 18,
        bottom: 20,
    },
    questionsAsk:{
        fontWeight: 'bold',
        fontSize: 15,
        fontFamily: 'sans-serif-condensed'
    },
    alertText:{
        fontWeight: 'bold'
    }
})
