import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  StatusBar,
  Modal,
} from "react-native";
import * as firebase from "firebase";

export default class Game_Shop extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.currentUser = firebase.auth().currentUser.uid;
    this.state = {
      achievements: [],
      inventory: [],
      letsGoRich: [],
      showLetsGoRichAchievementModal: false,
    };
  }

  // retrieve user achievement DB
  retrieveAchievement = () => {
    const achievements = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement");
    achievements
      .get()
      .then((snapshots) => {
        const obj = [];
        snapshots.forEach((doc) => {
          const ach = doc.data();
          obj.push({
            achievement: ach,
          });
        });
        this._isMounted && this.setState({ achievements: obj });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // retrieve inventory items
  retrieveInventoryItem = () => {
    const user_inventory = firebase
      .firestore()
      .collection("UserInventory")
      .doc(this.currentUser);

    user_inventory
      .get()
      .then((snapshot) => {
        const obj = snapshot.data();
        this._isMounted && this.setState({ inventory: obj });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  onClaimPressed = (name) => {
    const newSaving = this.state.inventory.coin + 10;
    const user_inventory = firebase
      .firestore()
      .collection("UserInventory")
      .doc(this.currentUser);

    user_inventory
      .update({
        coin: newSaving,
      })
      .catch((error) => {
        console.log(error);
      });
    this.retrieveInventoryItem();
    this.updateUserAchievement(name);
  };

  updateUserAchievement = (name) => {
    const achType = name;
    let user_achievement = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement");

    if (achType == "Advanced Gardener Achievement") {
      user_achievement = user_achievement.doc("AdvancedGardenerAchievement");
    } else if (achType == "First Plant Achievement") {
      user_achievement = user_achievement.doc("FirstPlantAchievement");
    } else if (achType == "Full Score Achievement") {
      user_achievement = user_achievement.doc("FullScoreAchievement");
    } else if (achType == "Hundred Marks Achievement") {
      user_achievement = user_achievement.doc("HundredMarksAchievement");
    } else if (achType == "Lets Go Rich Achievement") {
      user_achievement = user_achievement.doc("LetsGoRichAchievement");
    }

    user_achievement
      .update({
        claimed: true,
      })
      .then(() => {
        console.log("Reward " + name + " claimed successfully.");
      })
      .catch((error) => {
        console.log(error);
      });
    this.retrieveAchievement();
    this.checkAchievement();
  };

  checkAchievement = () => {
    if (
      this.state.letsGoRich.achievement == false &&
      this.state.inventory.coin >= 100
    ) {
      this.updateLetsGoRichAchievement();
      this.retrieveAchievement();
      this.setState({ showLetsGoRichAchievementModal: true });
      this.retrieveLetsGoRichAchievement();
    }
  };

  retrieveLetsGoRichAchievement = () => {
    const LGRachievements = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement")
      .doc("LetsGoRichAchievement");
    LGRachievements.get()
      .then((snapshots) => {
        const ach = snapshots.data();
        this._isMounted && this.setState({ letsGoRich: ach });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  updateLetsGoRichAchievement = () => {
    const achievements = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement")
      .doc("LetsGoRichAchievement");
    achievements
      .update({
        achievement: true,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        console.log("Achievement DB updated.");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.retrieveAchievement();
    this._isMounted && this.retrieveInventoryItem();
    this._isMounted && this.retrieveLetsGoRichAchievement();
    this.timer = setInterval(()=>{
      this.checkAchievement();
    },1000);
  }

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.timer);
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={"white"} />
        <Text style={styles.title}>Achievement</Text>

        <View style={styles.item_container}>
          <FlatList
            data={this.state.achievements}
            keyExtractor={(elem) => elem.achievement.name}
            renderItem={(elem) => (
              <View
                style={[
                  {
                    opacity:
                      elem.item.achievement.achievement == true ? 1 : 0.4,
                  },
                  styles.achievementSlot,
                ]}
              >
                <Text style={styles.achievementTitle}>
                  {elem.item.achievement.name}
                </Text>
                <Text>Reward : 10 coins</Text>
                <Text>Achievement Date:</Text>
                {elem.item.achievement.achievement == false ? (
                  <Text style={{ width: 180 }}> -</Text>
                ) : (
                  <Text style={{ width: 180 }}>
                    {elem.item.achievement.timestamp.toDate().toUTCString()}
                  </Text>
                )}
                <Image
                  source={require("../../assets/game-icon/badge.png")}
                  style={[
                    {
                      backgroundColor:
                        elem.item.achievement.achievement == true
                          ? "#D4AF37"
                          : "#7E7E7E",
                    },
                    styles.icon,
                  ]}
                />
                <TouchableOpacity
                  style={[
                    {
                      backgroundColor:
                        elem.item.achievement.achievement &&
                        !elem.item.achievement.claimed
                          ? "#FED000"
                          : "#7E7E7E",
                    },
                    styles.rewardBtn,
                  ]}
                  disabled={
                    !(
                      elem.item.achievement.achievement &&
                      !elem.item.achievement.claimed
                    )
                  }
                  onPress={() =>
                    this.onClaimPressed(elem.item.achievement.name)
                  }
                >
                  {elem.item.achievement.claimed ? (
                    <Text>Claimed</Text>
                  ) : (
                    <Text>Claim</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("GameScreen")}
        >
          <Text>Return</Text>
        </TouchableOpacity>

        {/* lets go rich achievement modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.showLetsGoRichAchievementModal}
        >
          <View style={styles.modalWrapper}>
            <View style={styles.modalBox}>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Achievement Unlock !
              </Text>
              <Text style={{ paddingBottom: 10 }}>
                You have unlock {this.state.letsGoRich.name}
              </Text>

              {/* Exit Quiz button */}
              <TouchableOpacity
                onPress={() => {
                  this.setState({ showLetsGoRichAchievementModal: false });
                }}
                style={styles.exitButton}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 18,
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#6de3c0",
  },
  item_container: {
    borderWidth: 2,
    marginTop: 25,
    width: "80%",
    alignSelf: "center",
    height: "75%",
    borderRadius: 30,
    backgroundColor: "white",
    overflow: "scroll",
    padding: 10,
    paddingBottom: 15,
  },
  title: {
    alignSelf: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: -10,
  },
  btn: {
    textAlign: "center",
    marginTop: 40,
    borderWidth: 2.5,
    borderRadius: 30,
    width: "30%",
    alignSelf: "center",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "pink",
  },
  achievementSlot: {
    borderWidth: 2,
    borderRadius: 15,
    marginBottom: 10,
    height: 140,
    padding: 10,
    marginRight: 4,
  },
  achievementTitle: {
    fontSize: 20,
    width: 180,
    fontWeight: "bold",
  },
  icon: {
    height: 60,
    width: 60,
    marginLeft: 192,
    marginTop: 10,
    position: "absolute",
    borderRadius: 15,
  },
  rewardBtn: {
    borderRadius: 10,
    borderWidth: 2,
    position: "absolute",
    width: 60,
    marginLeft: 192,
    marginTop: 80,
    alignItems: "center",
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: "#252c4a",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    backgroundColor: "#FFFFFF",
    width: "90%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  exitButton: {
    backgroundColor: "#3498db",
    padding: 20,
    width: "100%",
    borderRadius: 20,
  },
});
