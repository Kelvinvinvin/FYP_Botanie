import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  StatusBar,
} from "react-native";
import * as firebase from "firebase";

export default class Game_Quiz extends React.Component {
  constructor(props) {
    super(props);
    this.currentUser = firebase.auth().currentUser.uid;
    this._isMounted = false;
    this.isButtonPressed = false;
    this.state = {
      userScorelist: [],
      personalScore: [],
    };
  }

  // retrive the user score list
  retrieveScore = () => {
    const user_score = firebase.firestore().collection("UserScore");

    user_score
      .orderBy("totalScore", "desc")
      .limit(20)
      .get()
      .then((snapshots) => {
        const obj = [];
        snapshots.forEach((doc) => {
          const score = doc.data();
          obj.push({
            scores: score,
          });
        });
        this._isMounted && this.setState({ userScorelist: obj });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // retrieve personal score DB to checked on daily quiz
  retrieveTime = () => {
    const user_score = firebase
      .firestore()
      .collection("UserScore")
      .doc(this.currentUser);
    user_score
      .get()
      .then((snapshot) => {
        const obj = snapshot.data();
        this._isMounted && this.setState({ personalScore: obj });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  checkDayPassed = () => {
    const date = new Date(Date.now());
    const cur_timestamp = Math.round(date.getTime() / 1000);
    const lastPlayed = this.state.personalScore.createOn;
    if (lastPlayed == 0) {
      this.isButtonPressed = false;
    } else {
      if (cur_timestamp - lastPlayed >= 86400) {
        this.isButtonPressed = false;
      } else {
        this.isButtonPressed = true;
      }
    }
    this.retrieveTime();
  };

  onStartClicked = () => {
    const date = new Date(Date.now());
    const cur_timestamp = Math.round(date.getTime() / 1000);
    const user_score = firebase
      .firestore()
      .collection("UserScore")
      .doc(this.currentUser);
    user_score
      .update({
        createOn: cur_timestamp,
      })
      .catch((error) => {
        console.log(error);
      });
  };

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.retrieveScore();
    this._isMounted && this.retrieveTime();
    this.timer = setInterval(() => {
      this.retrieveTime();
      this.retrieveScore();
      this.checkDayPassed();
    }, 1000);
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
        <Text style={styles.title}>Quiz</Text>

        <View style={styles.quizSec}>
          <Text style={styles.titleSec}>Quiz of the day</Text>
          <Text style={styles.quizDesc}>
            You have one chance everyday to answer the quiz and win some coins.
            Start your quiz now!
          </Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("Game_StartQuiz")}
            onPressIn={() => this.onStartClicked()}
            onPressOut={() => (this.isButtonPressed = true)}
            disabled={this.isButtonPressed}
          >
            <Text>Start Now</Text>
          </TouchableOpacity>
          {this.isButtonPressed ? (
            <Text style={styles.errMes}>* You have played the quiz today</Text>
          ) : null}
        </View>

        <View style={styles.leaderboardSec}>
          <Text style={styles.titleSec}>Leaderboard</Text>
          <View style={styles.firstRow}>
            <Text style={styles.tableHeading}>Username</Text>
            <Text style={styles.tableHeading}>Scores</Text>
          </View>
          <FlatList
            data={this.state.userScorelist}
            keyExtractor={(elem) => elem.scores.userId}
            renderItem={(elem) => (
              <View style={styles.list}>
                <Text style={styles.rowsUser}>{elem.item.scores.userId}</Text>
                <Text style={styles.rowsScore}>
                  {elem.item.scores.totalScore}
                </Text>
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
  quizSec: {
    backgroundColor: "white",
    borderWidth: 2,
    height: "30%",
    width: "80%",
    alignSelf: "center",
    marginTop: 25,
    borderRadius: 30,
  },
  leaderboardSec: {
    backgroundColor: "white",
    borderWidth: 2,
    height: "45%",
    width: "80%",
    alignSelf: "center",
    marginTop: 25,
    borderRadius: 30,
    paddingRight: 20,
    paddingLeft: 10,
  },
  title: {
    alignSelf: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: -10,
  },
  titleSec: {
    paddingTop: 10,
    alignSelf: "center",
    fontSize: 16,
    borderBottomWidth: 2,
    width: "85%",
    paddingBottom: 5,
    textAlign: "center",
    fontWeight: "bold",
  },
  quizDesc: {
    width: "85%",
    alignSelf: "center",
    paddingTop: 10,
    textAlign: "justify",
    marginBottom: 25,
  },
  btn: {
    textAlign: "center",
    marginTop: 20,
    borderWidth: 2.5,
    borderRadius: 30,
    width: "30%",
    alignSelf: "center",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "pink",
  },
  list: {
    fontSize: 20,
    flexDirection: "row",
    borderBottomWidth: 1,
    width: "85%",
    alignSelf: "center",
    borderColor: "silver",
  },
  rowsUser: {
    marginTop: 5,
    marginLeft: 10,
    width: 120,
    paddingBottom: 4,
  },
  rowsScore: {
    marginTop: 5,
    marginLeft: 10,
    width: 60,
    textAlign: "right",
  },
  tableHeading: {
    marginTop: 5,
    marginHorizontal: 35,
  },
  firstRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    width: "85%",
    alignSelf: "center",
  },
  errMes: {
    paddingTop: 3,
    color: "#ff4444",
    fontSize: 8,
    alignSelf: "center",
  },
  exitButton: {
    marginTop: 5,
    backgroundColor: "#3498db",
    padding: 20,
    width: "100%",
    borderRadius: 20,
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
});
