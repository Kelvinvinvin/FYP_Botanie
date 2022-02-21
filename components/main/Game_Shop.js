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
} from "react-native";
import * as firebase from "firebase";

export default class Game_Shop extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.currentUser = firebase.auth().currentUser.uid;
    this.state = {
      shop: [],
      inventory: [],
    };
  }

  //retrieve item price
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

  //retrieve inventory items
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

  // check if coin enough for new purchase
  validateCoin = (item, price) => {
    const coinCount = this.state.inventory.coin;
    if (coinCount < price) {
      Alert.alert("Your coin is not enough.");
    } else {
      this.onBuyItem(item, price);
    }
  };

  // perform purchase
  onBuyItem = async (item, price) => {
    console.log("Buying " + item + " with price " + price);
    let saving = this.state.inventory.coin;
    saving -= price;
    const A_seed = this.state.inventory.seedA;
    const B_seed = this.state.inventory.seedB;
    const C_seed = this.state.inventory.seedC;
    const water = this.state.inventory.watering;

    const user_inventory = firebase
      .firestore()
      .collection("UserInventory")
      .doc(this.currentUser);

    user_inventory
      .update({
        coin: saving,
        seedA: item === "seedA" ? A_seed + 1 : A_seed * 1,
        seedB: item === "seedB" ? B_seed + 1 : B_seed * 1,
        seedC: item === "seedC" ? C_seed + 1 : C_seed * 1,
        watering: item === "watering" ? water + 1 : water * 1,
      })
      .then(() => {
        console.log("Bought " + item + "\nCurrent saving: " + saving);
      })
      .catch((error) => {
        console.log(error);
      });
    this.retrieveInventoryItem();
    Alert.alert("Purchased successfully");
  };

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.retrieveShopItem(); //isMounted is put to prevent memory loss during update
    this._isMounted && this.retrieveInventoryItem();
  }

  componentWillUnmount() {
    this._isMounted = false; //isMounted is put to prevent memory loss during update
  }

  render() {
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={"white"} />
        <Text style={styles.title}>Shop</Text>

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
                <Text>Price: {this.state.shop.seedA}</Text>
              </View>
              <Image
                source={require("../../assets/game-icon/seedA.png")}
                style={styles.itemImg}
              />
              <TouchableOpacity
                style={styles.buyBtn}
                onPressIn={() =>
                  this.validateCoin("seedA", this.state.shop.seedA)
                }
              >
                <Text style={{ fontWeight: "bold" }}>Buy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.list}>
              <View style={{ marginTop: 10, marginLeft: 10 }}>
                <Text>Item: Seed B</Text>
                <Text>Price: {this.state.shop.seedB}</Text>
              </View>
              <Image
                source={require("../../assets/game-icon/seedB.png")}
                style={styles.itemImg}
              />
              <TouchableOpacity
                style={styles.buyBtn}
                onPressIn={() =>
                  this.validateCoin("seedB", this.state.shop.seedB)
                }
              >
                <Text style={{ fontWeight: "bold" }}>Buy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.list}>
              <View style={{ marginTop: 10, marginLeft: 10 }}>
                <Text>Item: Seed C</Text>
                <Text>Price: {this.state.shop.seedC}</Text>
              </View>
              <Image
                source={require("../../assets/game-icon/seedC.png")}
                style={styles.itemImg}
              />
              <TouchableOpacity
                style={styles.buyBtn}
                onPressIn={() =>
                  this.validateCoin("seedC", this.state.shop.seedC)
                }
              >
                <Text style={{ fontWeight: "bold" }}>Buy</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.list}>
              <View style={{ marginTop: 10, marginLeft: 10 }}>
                <Text>Item: Watering Pot</Text>
                <Text>Price: {this.state.shop.watering}</Text>
              </View>
              <Image
                source={require("../../assets/game-icon/watering-icon.png")}
                style={styles.itemImg}
              />
              <TouchableOpacity
                style={styles.buyBtn}
                onPressIn={() =>
                  this.validateCoin("watering", this.state.shop.watering)
                }
              >
                <Text style={{ fontWeight: "bold" }}>Buy</Text>
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
    height: 100,
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
    marginTop: 1,
    backgroundColor: "#FDD032",
  },
});
