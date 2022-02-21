import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  StatusBar,
  Image,
  Modal,
} from "react-native";
import * as firebase from "firebase";

export default class Game_Inventory extends React.Component {
  constructor(props) {
    super(props);
    this.currentUser = firebase.auth().currentUser.uid;
    this._isMounted = false;
    this.state = {
      shop: [],
      inventory: [],
      seedA: 0,
      seedB: 0,
      seedC: 0,
      userBonsai: [],
      letsGoRich: [],
      showLetsGoRichAchievementModal: false,
    };
  }

  // retrieve item price
  retrieveShopItem = () => {
    const price = firebase.firestore().collection("ShopPrice").doc("Price");
    price
      .get()
      .then((snapshot) => {
        const obj = snapshot.data();
        this._isMounted && this.setState({ shop: obj });
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

  // validate item quantity before perform sell
  validateItem = (item, name, quantity, price) => {
    if (quantity === 0) {
      Alert.alert("You have no more " + name + ".");
    } else {
      this.onSellItem(item, price);
    }
  };

  // perform sell and update DB
  onSellItem = async (item, price) => {
    console.log("Selling " + item + " with price " + price);
    let saving = this.state.inventory.coin;
    saving += price;
    const A_seed = this.state.inventory.seedA;
    const B_seed = this.state.inventory.seedB;
    const C_seed = this.state.inventory.seedC;

    const user_inventory = firebase
      .firestore()
      .collection("UserInventory")
      .doc(this.currentUser);

    user_inventory
      .update({
        coin: saving,
        seedA: item === "seedA" ? A_seed - 1 : A_seed * 1,
        seedB: item === "seedB" ? B_seed - 1 : B_seed * 1,
        seedC: item === "seedC" ? C_seed - 1 : C_seed * 1,
      })
      .then(() => {
        console.log("Sold " + item + "     Current saving: " + saving);
      })
      .catch((error) => {
        console.log(error);
      });
    this.retrieveInventoryItem();
    Alert.alert(
      "Sold successfully",
      "",
      [
        {
          text: "Ok",
          onPress: () => this.checkAchievement(),
          // style: "cancel",
        },
      ],
      {
        cancelable: true,
      }
    );
    this.checkAchievement();
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
        const obj = snapshot.data();
        this._isMounted && this.setState({ userBonsai: obj });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // plant new plant on reset
  onPlantNew = (seed) => {
    const user_bonsai = firebase
      .firestore()
      .collection("UserBonsai")
      .doc(this.currentUser);

    let plantName = "";
    let randomLuck = 0;
    if (seed == "seedA") {
      plantName = "Hibiscus Plant";
      randomLuck = Math.floor(Math.random() * 10) + 1;
    } else if (seed == "seedB") {
      plantName = "Bolsom Plant";
      randomLuck = Math.floor(Math.random() * 30) + 1;
    } else if (seed == "seedC") {
      plantName = "Mango Tree";
      randomLuck = Math.floor(Math.random() * 50) + 1;
    }

    user_bonsai
      .update({
        curPlantName: plantName,
        curPlantStage: 1,
        luck: randomLuck,
      })
      .then(() => {
        console.log("New bonsai seed planted");
      })
      .catch((error) => {
        console.log(error);
      });
    this.retrieveBonsai();
    this.updateInventory(seed);
  };

  validatePlantNew = (seed) => {
    if (this.state.inventory.seedA == 0 && seed == "seedA") {
      Alert.alert("There is no more Seed A.");
    } else if (this.state.inventory.seedB == 0 && seed == "seedB") {
      Alert.alert("There is no more Seed B.");
    } else if (this.state.inventory.seedC == 0 && seed == "seedC") {
      Alert.alert("There is no more Seed C.");
    } else {
      if (this.state.userBonsai.curPlantStage != 0) {
        Alert.alert("The bonsai space is currently full.");
      } else {
        this.onPlantNew(seed);
      }
    }
  };

  updateInventory = (seed) => {
    const user_inventory = firebase
      .firestore()
      .collection("UserInventory")
      .doc(this.currentUser);

    let cur_seedA = this.state.inventory.seedA;
    let cur_seedB = this.state.inventory.seedB;
    let cur_seedC = this.state.inventory.seedC;

    user_inventory
      .update({
        seedA: seed == "seedA" ? cur_seedA - 1 : cur_seedA * 1,
        seedB: seed == "seedB" ? cur_seedB - 1 : cur_seedB * 1,
        seedC: seed == "seedC" ? cur_seedC - 1 : cur_seedC * 1,
      })
      .then(() => {
        console.log("Inventory update");
        this.retrieveInventoryItem();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  checkAchievement = () => {
    if (
      this.state.letsGoRich.achievement == false &&
      this.state.inventory.coin >= 100
    ) {
      this.updateLetsGoRichAchievement();
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
    this._isMounted && this.retrieveShopItem();
    this._isMounted && this.retrieveInventoryItem();
    this._isMounted && this.retrieveBonsai();
    this._isMounted && this.retrieveLetsGoRichAchievement();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={"white"} />
        <Text style={styles.title}>Inventory</Text>

        <View style={styles.item_container}>
          <Text style={styles.titleSec}>Items</Text>

          <View style={styles.coinSec}>
            <Text style={{ alignSelf: "flex-end", paddingEnd: 5 }}>
              {this.state.inventory.coin}
              {this.state.inventory.coin <= 1 ? (
                <Text> coin</Text>
              ) : (
                <Text> coins</Text>
              )}
            </Text>
          </View>
          <ScrollView style={styles.listWrapper}>
            <View style={styles.list}>
              <View style={{ marginTop: 10, marginLeft: 10 }}>
                <Text>Item: Seed A</Text>
                <Text>Selling Price: {this.state.shop.seedA - 2}</Text>
                <Text>Quantity: {this.state.inventory.seedA}</Text>
              </View>
              <Image
                source={require("../../assets/game-icon/seedA.png")}
                style={styles.itemImg}
              />
              <TouchableOpacity
                style={styles.buyBtn}
                onPressIn={() =>
                  this.validateItem(
                    "seedA",
                    "Seed A",
                    this.state.inventory.seedA,
                    this.state.shop.seedA - 2
                  )
                }
              >
                <Text style={{ fontWeight: "bold" }}>Sell</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buyBtn}
                onPressIn={() => this.validatePlantNew("seedA")}
              >
                <Text style={{ fontWeight: "bold" }}>Plant</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.list}>
              <View style={{ marginTop: 10, marginLeft: 10 }}>
                <Text>Item: Seed B</Text>
                <Text>Selling Price: {this.state.shop.seedB - 2}</Text>
                <Text>Quantity: {this.state.inventory.seedB}</Text>
              </View>
              <Image
                source={require("../../assets/game-icon/seedB.png")}
                style={styles.itemImg}
              />
              <TouchableOpacity
                style={styles.buyBtn}
                onPressIn={() =>
                  this.validateItem(
                    "seedB",
                    "Seed B",
                    this.state.inventory.seedB,
                    this.state.shop.seedB - 2
                  )
                }
              >
                <Text style={{ fontWeight: "bold" }}>Sell</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buyBtn}
                onPressIn={() => this.validatePlantNew("seedB")}
              >
                <Text style={{ fontWeight: "bold" }}>Plant</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.list}>
              <View style={{ marginTop: 10, marginLeft: 10 }}>
                <Text>Item: Seed C</Text>
                <Text>Selling Price: {this.state.shop.seedC - 2}</Text>
                <Text>Quantity: {this.state.inventory.seedC}</Text>
              </View>
              <Image
                source={require("../../assets/game-icon/seedC.png")}
                style={styles.itemImg}
              />
              <TouchableOpacity
                style={styles.buyBtn}
                onPressIn={() =>
                  this.validateItem(
                    "seedC",
                    "Seed C",
                    this.state.inventory.seedC,
                    this.state.shop.seedC - 2
                  )
                }
              >
                <Text style={{ fontWeight: "bold" }}>Sell</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buyBtn}
                onPressIn={() => this.validatePlantNew("seedC")}
              >
                <Text style={{ fontWeight: "bold" }}>Plant</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  titleSec: {
    paddingTop: 5,
    alignSelf: "center",
    fontSize: 16,
    borderBottomWidth: 1,
    width: "92%",
    paddingBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  list: {
    borderWidth: 1,
    width: "92%",
    marginHorizontal: 10,
    marginBottom: 8,
    height: 170,
    borderRadius: 10,
    backgroundColor: "#FF8B3D",
  },
  coinSec: {
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: "#7DF9FF",
    marginTop: 5,
    marginBottom: 10,
    width: "92%",
    alignSelf: "center",
  },
  listWrapper: {
    height: 70,
    overflow: "scroll",
  },
  itemImg: {
    marginTop: 12,
    height: 72,
    width: 72,
    position: "absolute",
    marginLeft: 160,
    borderWidth: 1,
    backgroundColor: "white",
    borderRadius: 10,
  },
  buyBtn: {
    borderWidth: 2,
    width: 140,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: "#FDD032",
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
