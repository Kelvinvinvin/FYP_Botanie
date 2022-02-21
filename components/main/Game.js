import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  Animated,
  StatusBar,
  Modal,
} from "react-native";
import * as firebase from "firebase";
import * as Location from "expo-location";
import Draggable from "react-native-draggable";

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.currentUser = firebase.auth().currentUser.uid;
    this._isMounted = false;
    this.localWateringProgress = 0;
    this.localPlantStage = 0;
    this.LATITUDE_FRAME = [3.130671, 3.13157];
    this.LONGITUDE_FRAME = [101.656828, 101.658304];
    this.state = {
      inventory: [],
      userBonsai: [],
      region: [],
      location: [],
      loading: false,
      checkinMessage: "",
      isCheckedIn: false,
      progress: new Animated.Value(0),
      showFirstPlantAchievementModal: false,
      showAdvancedGardenerAchievementModal: false,
      firstPlant: [],
      advancedGardener: [],
    };
  }

  // check if the user score is created
  checkUserScoreCreated = () => {
    const user_score = firebase
      .firestore()
      .collection("UserScore")
      .doc(this.currentUser);

    user_score.get().then((snapshot) => {
      if (!snapshot.exists) {
        try {
          this.createUserScore();
          console.log("New user score created!");
        } catch {
          console.log("Create new user score failed!");
        }
      }
    });
  };

  // create user score for new user
  createUserScore = () => {
    let new_user_score = firebase.firestore().collection("UserScore");
    const data = {
      totalScore: 0,
      userId: this.currentUser,
      createOn: 0,
    };
    new_user_score.doc(this.currentUser).set(data);
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
        if (!snapshot.exists) {
          try {
            this.createUserInventory();
            console.log("New user inventory created!");
          } catch {
            console.log("Create new user inventory failed!");
          }
        } else {
          try {
            const obj = snapshot.data();
            this._isMounted && this.setState({ inventory: obj });
          } catch {
            console.log("Retrieve user inventory failed!");
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // create new inventory database for new user
  createUserInventory = () => {
    let new_user_inventory = firebase.firestore().collection("UserInventory");
    const data = {
      coin: 0,
      endOfDay: 0,
      seedA: 0,
      seedB: 0,
      seedC: 0,
      watering: 0,
    };
    new_user_inventory.doc(this.currentUser).set(data);
    this._isMounted && this.setState({ inventory: data });
  };

  // retrieve current bonsai status
  retrieveBonsai = () => {
    const user_bonsai = firebase
      .firestore()
      .collection("UserBonsai")
      .doc(this.currentUser);

    user_bonsai
      .get()
      .then((snapshot) => {
        if (!snapshot.exists) {
          try {
            this.createUserBonsai();
            console.log("New user bonsai created!");
          } catch {
            console.log("Create new user bonsai failed!");
          }
        } else {
          try {
            const obj = snapshot.data();
            this._isMounted && this.setState({ userBonsai: obj });
          } catch {
            console.log("Retrieve user bonsai failed!");
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // create new bonsai database for new user
  createUserBonsai = () => {
    let new_user_bonsai = firebase.firestore().collection("UserBonsai");
    const data = {
      curPlantName: "",
      curPlantStage: 0,
      luck: 0,
      wateringProgress: 0,
    };
    new_user_bonsai.doc(this.currentUser).set(data);
    this._isMounted && this.setState({ userBonsai: data });
  };

  notifyDelete = () => {
    if (this.state.userBonsai.curPlantStage == 0) {
      Alert.alert("There is no plant to be removed.");
    } else {
      Alert.alert(
        "Confirm to proceed?",
        "When you press the 'Okay' button, the plant will be removed permanently.",
        [
          {
            text: "Okay",
            onPress: () => this.onRemoveBonsai(),
          },
          {
            text: "Cancel",
          },
        ]
      );
    }
  };

  // remove the doc in user bonsai when unplant
  onRemoveBonsai = () => {
    firebase
      .firestore()
      .collection("UserBonsai")
      .doc(this.currentUser)
      .delete()
      .then(() => {
        console.log("Remove user bonsai succeeded.");
        // reset the doc to initial
        this.createUserBonsai();
      })
      .catch((error) => {
        console.log("Remove doc in user bonsai failed: " + error.message);
      });
    Animated.timing(this.state.progress, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  // check if watering enough
  validateWatering = () => {
    if (this.state.inventory.watering == 0) {
      Alert.alert(
        "Opps",
        "The watering pot in your inventory is empty. You may get in from the Shop."
      );
    } else if (this.state.userBonsai.wateringProgress >= 150) {
      Alert.alert(
        "Opps",
        "Looks like your bonsai is fully grown. Please consider to plant a new seed."
      );
    } else {
      this.wateringBonsai();
      this._isMounted && this.updateBonsai();
      this._isMounted && this.updateInventoryAfterWatering();
    }
  };

  // update watering
  updateInventoryAfterWatering = () => {
    const user_inventory = firebase
      .firestore()
      .collection("UserInventory")
      .doc(this.currentUser);

    let waterNum = this.state.inventory.watering - 1;

    user_inventory
      .update({
        watering: waterNum,
      })
      .then(() => {
        console.log("watering decrease in 1");
      })
      .catch((error) => {
        console.log(error);
      });
    this.retrieveInventoryItem();
  };

  // watering algorithm
  wateringBonsai = () => {
    const plantLuck = this.state.userBonsai.luck;
    let wateringPoint = Math.ceil(
      (Math.floor(Math.random() * 10) + 1) * (1 + plantLuck / 100)
    );
    let newWateringProgress =
      this.state.userBonsai.wateringProgress + wateringPoint;

    if (newWateringProgress >= 150) {
      this.localWateringProgress = 150;
      this.localPlantStage = 3;
      this.checkAchievement();
    } else if (newWateringProgress >= 80) {
      this.localWateringProgress = newWateringProgress;
      this.localPlantStage = 3;
    } else if (newWateringProgress >= 30) {
      this.localWateringProgress = newWateringProgress;
      this.localPlantStage = 2;
    } else {
      this.localWateringProgress = newWateringProgress;
      this.localPlantStage = 1;
    }
    Animated.timing(this.state.progress, {
      toValue: newWateringProgress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  // update watering progress
  updateBonsai = () => {
    const user_bonsai = firebase
      .firestore()
      .collection("UserBonsai")
      .doc(this.currentUser);

    user_bonsai
      .update({
        curPlantStage: this.localPlantStage,
        wateringProgress: this.localWateringProgress,
      })
      .then(() => {
        console.log(
          "The plant has been watered today, current progress is " +
            this.localWateringProgress +
            " and the plant is in stage " +
            this.localPlantStage
        );
      })
      .catch((error) => {
        console.log(error);
      });
    this.retrieveBonsai();
  };

  //get user current location
  _getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Enable location permission not granted.");

      this.setState({
        checkinMessage: "Enable location permission not granted.",
      });
    }

    const location = await Location.getCurrentPositionAsync({});

    const region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    this.setState({
      location,
      region,
    });
    Alert.alert("Daily Check-In", this.state.checkinMessage);
  };

  // check availability for perform check in
  validateCheckin = () => {
    const date = new Date(Date.now());
    const cur_timestamp = Math.round(date.getTime() / 1000);
    const cur_lat = JSON.stringify(this.state.region.latitude);
    const cur_long = JSON.stringify(this.state.region.longitude);
    let resetTime = this.state.inventory.endOfDay;
    let successCheckIn = false;

    let checkinCoin = 0;
    if (resetTime == 0) {
      if (
        cur_lat >= this.LATITUDE_FRAME[0] &&
        cur_lat <= this.LATITUDE_FRAME[1] &&
        cur_long >= this.LONGITUDE_FRAME[0] &&
        cur_long <= this.LONGITUDE_FRAME[1]
      ) {
        this.setState({
          isCheckedIn: true,
          checkinMessage: "You have successfully checked-in.",
        });
        checkinCoin += 5;
        resetTime = cur_timestamp + 86400;
        successCheckIn = true;
      } else {
        this.setState({
          isCheckedIn: false,
          checkinMessage: "You are currently not in the UM Rimba Ilmu area.",
        });
      }
    } else {
      if (resetTime < cur_timestamp && cur_timestamp - resetTime >= 86400) {
        if (
          cur_lat >= this.LATITUDE_FRAME[0] &&
          cur_lat <= this.LATITUDE_FRAME[1] &&
          cur_long >= this.LONGITUDE_FRAME[0] &&
          cur_long <= this.LONGITUDE_FRAME[1]
        ) {
          this.setState({
            isCheckedIn: true,
            checkinMessage: "You have successfully checked-in.",
          });
          checkinCoin += 5;
          resetTime = cur_timestamp + 86400;
          successCheckIn = true;
        } else {
          this.setState({
            isCheckedIn: false,
            checkinMessage: "You are currently not in the UM Rimba Ilmu area.",
          });
        }
      } else {
        this.setState({
          isCheckedIn: false,
          checkinMessage: "You have checked-in today.",
        });
      }
    }
    if (successCheckIn == true) {
      this.onCheckinUpdate(resetTime, checkinCoin);
    }
  };

  // perform checkin update and coin award
  onCheckinUpdate = (resetTime, checkinCoin) => {
    let inventoryCoin = this.state.inventory.coin;
    let newInput = inventoryCoin + checkinCoin;

    const user_inventory = firebase
      .firestore()
      .collection("UserInventory")
      .doc(this.currentUser);

    user_inventory
      .update({
        endOfDay: resetTime,
        coin: newInput,
      })
      .then(() => {
        console.log("End of the day and coin are updated");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // check achievement DB for new user
  checkAchievementDB = () => {
    const user_achievement = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement")
      .doc("FirstPlantAchievement");

    user_achievement
      .get()
      .then((snapshot) => {
        if (!snapshot.exists) {
          try {
            this.createUserAchievement();
            console.log("New user achievement created!");
          } catch {
            console.log("Create new user achievement failed!");
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  createUserAchievement = () => {
    let new_user_achievement = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement");
    const data1 = {
      name: "Full Score Achievement",
      achievement: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      claimed: false,
    };
    const data2 = {
      name: "First Plant Achievement",
      achievement: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      claimed: false,
    };
    const data3 = {
      name: "Hundred Marks Achievement",
      achievement: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      claimed: false,
    };
    const data4 = {
      name: "Advanced Gardener Achievement",
      achievement: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      claimed: false,
    };
    const data5 = {
      name: "Lets Go Rich Achievement",
      achievement: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      claimed: false,
    };
    new_user_achievement.doc("FullScoreAchievement").set(data1);
    new_user_achievement.doc("FirstPlantAchievement").set(data2);
    new_user_achievement.doc("HundredMarksAchievement").set(data3);
    new_user_achievement.doc("AdvancedGardenerAchievement").set(data4);
    new_user_achievement.doc("LetsGoRichAchievement").set(data5);
  };

  // retrieve achievement
  retrieveAchievement = () => {
    let user_achievement = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement");

    let firstplant = user_achievement.doc("FirstPlantAchievement");
    let advancedgardener = user_achievement.doc("AdvancedGardenerAchievement");

    firstplant
      .get()
      .then((snapshot) => {
        const obj = snapshot.data();
        this._isMounted && this.setState({ firstPlant: obj });
      })
      .catch((error) => {
        console.log(error);
      });

    advancedgardener
      .get()
      .then((snapshot) => {
        const obj = snapshot.data();
        this._isMounted && this.setState({ advancedGardener: obj });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // check achievement
  checkAchievement = () => {
    if (this.state.firstPlant.achievement == false) {
      this.updateFirstPlantAchievement();
      this.setState({ showFirstPlantAchievementModal: true });
      this.retrieveAchievement();
    } else if (
      this.state.advancedGardener.achievement == false &&
      this.state.userBonsai.curPlantName == "Mango Tree"
    ) {
      this.updateAdvancedGardenerAchievement();
      this.setState({ showAdvancedGardenerAchievementModal: true });
      this.retrieveAchievement();
    }
  };

  updateFirstPlantAchievement = () => {
    const achievements = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement")
      .doc("FirstPlantAchievement");
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

  updateAdvancedGardenerAchievement = () => {
    const achievements = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement")
      .doc("AdvancedGardenerAchievement");
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
    this._isMounted && this.retrieveBonsai();
    this._isMounted && this.retrieveInventoryItem();
    this._isMounted && this.checkAchievementDB();
    this._isMounted && this.retrieveAchievement();
    this._isMounted && this.checkUserScoreCreated();
    this.timer = setInterval(() => {
      this.retrieveInventoryItem();
      this.retrieveBonsai();
      let curBar = this.state.userBonsai.wateringProgress * 1;
      this.setState({
        progress: new Animated.Value(curBar),
      });
    }, 1000);
  }

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.timer);
  }

  render() {
    const { navigation } = this.props;
    const progressAnim = this.state.progress.interpolate({
      inputRange: [0, 150],
      outputRange: ["0%", "100%"],
    });

    return (
      <ImageBackground
        source={require("../../assets/images/basic-land.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={"white"} />
          {/* coin display */}
          <View style={styles.icon_wrapper}>
            <Image
              source={require("../../assets/game-icon/coin-icon.png")}
              style={styles.head_icon}
            />
            <Text style={styles.add_btnText}>{this.state.inventory.coin}</Text>
            <TouchableOpacity
              style={styles.add_btn}
              onPress={() => navigation.navigate("Game_Inventory")}
            >
              <Image
                source={require("../../assets/game-icon/add-icon.png")}
                style={styles.add_icon}
              />
            </TouchableOpacity>
          </View>

          {/* watering count display */}
          <View style={styles.icon_wrapper}>
            <Image
              source={require("../../assets/game-icon/watering-icon.png")}
              style={styles.head_icon}
            />
            <Text style={styles.add_btnText}>
              {this.state.inventory.watering}
            </Text>
            <TouchableOpacity
              style={styles.add_btn}
              onPress={() => navigation.navigate("Game_Shop")}
            >
              <Image
                source={require("../../assets/game-icon/add-icon.png")}
                style={styles.add_icon}
              />
            </TouchableOpacity>
          </View>

          {/* quiz page navigation */}
          <TouchableOpacity
            style={styles.quiz_wrapper}
            onPress={() => navigation.navigate("Game_Quiz")}
          >
            <Image
              source={require("../../assets/game-icon/quiz-icon.png")}
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* inventory page navigation */}
          <TouchableOpacity
            style={styles.inventory_wrapper}
            onPress={() => navigation.navigate("Game_Inventory")}
          >
            <Image
              source={require("../../assets/game-icon/bag-icon.png")}
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* checkin */}
          <TouchableOpacity
            style={styles.checkin_wrapper}
            onPress={() => this._getLocation()}
            onPressIn={() => this.validateCheckin()}
          >
            <Image
              source={require("../../assets/game-icon/checkin-icon.png")}
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* shop page navigation */}
          <TouchableOpacity
            style={styles.shop_wrapper}
            onPress={() => navigation.navigate("Game_Shop")}
          >
            <Image
              source={require("../../assets/game-icon/shop-icon.png")}
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* achievement page navigation */}
          <TouchableOpacity
            style={styles.achievement_wrapper}
            onPress={() => navigation.navigate("Game_Achievement")}
          >
            <Image
              source={require("../../assets/game-icon/achievement-icon.png")}
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* bonsai area */}
          <View style={styles.bonsai_wrapper}>
            {/* picture change with stages and seed type */}
            {this.state.userBonsai.curPlantStage == 0 ? (
              <Image
                source={require("../../assets/game-icon/shovel.png")}
                style={styles.bonsai_icon0}
              />
            ) : null}
            {this.state.userBonsai.curPlantStage == 1 ? (
              <Image
                source={require("../../assets/game-icon/stage1.png")}
                style={styles.bonsai_icon1}
              />
            ) : null}
            {this.state.userBonsai.curPlantStage == 2 ? (
              <Image
                source={require("../../assets/game-icon/stage2.png")}
                style={styles.bonsai_icon2}
              />
            ) : null}
            {this.state.userBonsai.curPlantStage == 3 ? (
              <Image
                source={require("../../assets/game-icon/stage3.png")}
                style={styles.bonsai_icon3}
              />
            ) : null}

            {/* plant name */}
            {this.state.userBonsai.curPlantName != "" ? (
              <Text
                style={{ paddingTop: 10, color: "white", fontWeight: "bold" }}
              >
                {this.state.userBonsai.curPlantName}
              </Text>
            ) : null}

            {/* watering progress bar */}
            <View style={styles.progressBarWrapper}>
              <Animated.View
                style={[
                  {
                    height: 11,
                    borderRadius: 20,
                    backgroundColor: "#3498db",
                  },
                  {
                    width: progressAnim,
                  },
                ]}
              ></Animated.View>
            </View>
          </View>

          {/* watering button */}
          <TouchableOpacity
            style={[
              {
                backgroundColor:
                  this.state.userBonsai.curPlantStage == 0
                    ? "#7E7E7E"
                    : "#7DF9FF",
              },
              styles.wateringBtn,
            ]}
            disabled={this.state.userBonsai.curPlantStage == 0 ? true : false}
            onPress={() => {
              this.validateWatering();
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 12 }}>Water</Text>
          </TouchableOpacity>

          {/* trash button */}
          <View>
            <Draggable
              imageSource={require("../../assets/game-icon/recycling.png")}
              renderSize={50}
              x={10}
              y={460}
              onDragRelease={() => this.notifyDelete()}
              shouldReverse={true}
            />
          </View>

          {/* first plant achievement modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.showFirstPlantAchievementModal}
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
                  You have unlock {this.state.firstPlant.name}
                </Text>

                {/* Exit button */}
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ showFirstPlantAchievementModal: false });
                    this.checkAchievement();
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

          {/* advanced gardener achievement modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.showAdvancedGardenerAchievementModal}
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
                  You have unlock {this.state.advancedGardener.name}
                </Text>

                {/* Exit button */}
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      showAdvancedGardenerAchievementModal: false,
                    });
                    this.checkAchievement();
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
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  add_icon: {
    height: 20,
    width: 20,
  },
  icon: {
    height: 45,
    width: 45,
  },
  bonsai_icon0: {
    height: 75,
    width: 75,
    marginTop: 210,
    opacity: 0.98,
  },
  bonsai_icon1: {
    height: 60,
    width: 60,
    marginTop: 220,
    marginLeft: 10,
    marginBottom: 5,
  },
  bonsai_icon2: {
    height: 100,
    width: 100,
    marginTop: 185,
    marginLeft: 10,
  },
  bonsai_icon3: {
    height: 200,
    width: 180,
    marginLeft: 10,
    marginTop: 85,
  },
  head_icon: {
    height: 20,
    width: 20,
    marginBottom: 3,
  },
  add_btn: {
    paddingBottom: 3,
    paddingRight: 5,
    paddingLeft: 5,
    justifyContent: "flex-end",
  },
  add_btnText: {
    paddingBottom: 4,
    fontSize: 15,
    alignItems: "center",
    paddingLeft: 5,
    width: 40,
    textAlign: "right",
  },
  quiz_wrapper: {
    alignSelf: "flex-end",
    marginTop: 100,
    paddingRight: 10,
    position: "absolute",
  },
  inventory_wrapper: {
    alignSelf: "flex-end",
    marginTop: 155,
    paddingRight: 10,
    position: "absolute",
  },
  checkin_wrapper: {
    alignSelf: "flex-end",
    marginTop: 210,
    paddingRight: 10,
    position: "absolute",
  },
  shop_wrapper: {
    alignSelf: "flex-end",
    marginTop: 265,
    paddingRight: 10,
    position: "absolute",
  },
  achievement_wrapper: {
    alignSelf: "flex-end",
    marginTop: 320,
    paddingRight: 10,
    position: "absolute",
  },
  icon_wrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    borderWidth: 2,
    height: 30,
    width: 100,
    marginLeft: "70%",
    marginBottom: 5,
    borderRadius: 60,
    backgroundColor: "white",
  },
  background: {
    flexDirection: "row",
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
  },
  progressBarWrapper: {
    width: "100%",
    height: 15,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    position: "absolute",
    marginTop: 330,
    borderWidth: 2,
  },
  bonsai_wrapper: {
    marginTop: 200,
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "column",
    width: 200,
    height: 350,
  },
  wateringBtn: {
    borderWidth: 3,
    height: 40,
    width: 120,
    borderRadius: 10,
    marginTop: 550,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
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
