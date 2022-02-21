import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Animated,
  Modal,
  StatusBar,
} from "react-native";
import * as firebase from "firebase";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default class Game_StartQuiz extends React.Component {
  constructor(props) {
    super(props);
    this.currentUser = firebase.auth().currentUser.uid;
    this.MAX_QUESTIONS = 25;
    this._isMounted = false;
    this.allQuestions = [];
    this.correctOption = null;
    this.state = {
      Q1: [],
      Q2: [],
      Q3: [],
      currentQuestionIndex: 0,
      currentOptionSelected: null,
      isOptionsDisabled: false,
      score: 0,
      showNextButton: false,
      showScoreModal: false,
      progress: new Animated.Value(0),
      inventory: [],
      userScore: [],
      fullScore: [],
      hundredMarks: [],
      showFullScoreAchievementModal: false,
      showHundredMarksAchievementModal: false,
    };
  }

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

  retrieveUserScore = () => {
    const user_score = firebase
      .firestore()
      .collection("UserScore")
      .doc(this.currentUser);

    user_score
      .get()
      .then((snapshot) => {
        const obj = snapshot.data();
        this._isMounted && this.setState({ userScore: obj });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  updateScoreAndCoin = () => {
    const user_score = firebase
      .firestore()
      .collection("UserScore")
      .doc(this.currentUser);

    const user_inventory = firebase
      .firestore()
      .collection("UserInventory")
      .doc(this.currentUser);

    const saving = this.state.inventory.coin;
    const point = this.state.userScore.totalScore;
    const reward = this.state.score;
    const totalSaving = saving + reward;
    const totalPoint = point + reward;

    if (this.state.score > 0) {
      user_score
        .update({
          totalScore: totalPoint,
        })
        .catch((error) => {
          console.log(error);
        });
      user_inventory
        .update({
          coin: totalSaving,
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  handleNext = () => {
    if (this.state.currentQuestionIndex == this.allQuestions.length - 1) {
      // Last Question
      // Show Score Modal
      this.checkAchievement();
    } else {
      this.setState({
        currentOptionSelected: null,
        currentQuestionIndex: this.state.currentQuestionIndex + 1,
        isOptionsDisabled: false,
        showNextButton: false,
      });
      this.correctOption = null;
    }
    Animated.timing(this.state.progress, {
      toValue: this.state.currentQuestionIndex + 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  validateAnswer = (selectedOption) => {
    this.correctOption =
      this.allQuestions[this.state.currentQuestionIndex].correct_answer;
    this.setState({
      currentOptionSelected: selectedOption,
      isOptionsDisabled: true,
    });
    if (selectedOption == this.correctOption) {
      // Set Score
      this.setState({ score: this.state.score + 1 });
    }
    // Show Next Button
    this.setState({ showNextButton: true });
  };

  // reset before exit
  exitQuiz = () => {
    this.updateScoreAndCoin();
    this.setState({
      showScoreModal: false,
      showNextButton: false,
      currentQuestionIndex: 0,
      score: 0,
      currentOptionSelected: null,
      isOptionsDisabled: false,
    });
    this.correctOption = null;
    Animated.timing(this.state.progress, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  // get single question
  retrieveQuestion = (questionNum, id) => {
    const questionId = id;
    const questionBank = firebase
      .firestore()
      .collection("QuestionBank")
      .doc(questionId);

    if (questionNum == "Q1") {
      questionBank
        .get()
        .then((snapshot) => {
          const obj = snapshot.data();
          this._isMounted && this.setState({ Q1: obj });
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (questionNum == "Q2") {
      questionBank
        .get()
        .then((snapshot) => {
          const obj = snapshot.data();
          this._isMounted && this.setState({ Q2: obj });
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (questionNum == "Q3") {
      questionBank
        .get()
        .then((snapshot) => {
          const obj = snapshot.data();
          this._isMounted && this.setState({ Q3: obj });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("The randomized ID is wrong.");
    }
  };

  // retrieve full score achievement
  retrieveFullScoreAchievement = () => {
    const FSachievements = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement")
      .doc("FullScoreAchievement");
    FSachievements.get()
      .then((snapshots) => {
        const ach = snapshots.data();
        this._isMounted && this.setState({ fullScore: ach });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // check full score achievement
  checkAchievement = () => {
    if (this.state.fullScore.achievement == false && this.state.score == 3) {
      this.updateFullScoreAchievement();
      this.setState({ showFullScoreAchievementModal: true });
      this.retrieveFullScoreAchievement();
    } else if (
      this.state.hundredMarks.achievement == false &&
      this.state.userScore.totalScore >= 100
    ) {
      this.updateHundredMarksAchievement();
      this.setState({ showHundredMarksAchievementModal: true });
      this.retrieveHundredMarksAchievement();
    } else {
      this.setState({ showScoreModal: true });
    }
  };

  updateFullScoreAchievement = () => {
    const achievements = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement")
      .doc("FullScoreAchievement");
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
    this._isMounted && this.retrieveRandomQuestions();
    this._isMounted && this.retrieveInventoryItem();
    this._isMounted && this.retrieveUserScore();
    this._isMounted && this.retrieveFullScoreAchievement();
    this._isMounted && this.retrieveHundredMarksAchievement();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  retrieveRandomQuestions = () => {
    var random = Math.floor(Math.random() * this.MAX_QUESTIONS) + 1;
    if (random >= this.MAX_QUESTIONS - 1) {
      var id1 = "Q" + random;
      var id2 = "Q" + (random - 1);
      var id3 = "Q" + (random - 2);
    } else {
      var id1 = "Q" + random;
      var id2 = "Q" + (random + 1);
      var id3 = "Q" + (random + 2);
    }
    this.retrieveQuestion("Q1", id1);
    this.retrieveQuestion("Q2", id2);
    this.retrieveQuestion("Q3", id3);
  };

  updateHundredMarksAchievement = () => {
    const achievements = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement")
      .doc("HundredMarksAchievement");
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
    this.retrieveHundredMarksAchievement();
  };

  retrieveHundredMarksAchievement = () => {
    const HMachievements = firebase
      .firestore()
      .collection("UserAchievement")
      .doc(this.currentUser)
      .collection("Achievement")
      .doc("HundredMarksAchievement");
    HMachievements.get()
      .then((snapshots) => {
        const ach = snapshots.data();
        this._isMounted && this.setState({ hundredMarks: ach });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { navigation } = this.props;
    const data = [
      {
        question: this.state.Q1.desc,
        options: [
          this.state.Q1.opt1,
          this.state.Q1.opt2,
          this.state.Q1.opt3,
          this.state.Q1.opt4,
        ],
        correct_answer: this.state.Q1.ansStr,
      },
      {
        question: this.state.Q2.desc,
        options: [
          this.state.Q2.opt1,
          this.state.Q2.opt2,
          this.state.Q2.opt3,
          this.state.Q2.opt4,
        ],
        correct_answer: this.state.Q2.ansStr,
      },
      {
        question: this.state.Q3.desc,
        options: [
          this.state.Q3.opt1,
          this.state.Q3.opt2,
          this.state.Q3.opt3,
          this.state.Q3.opt4,
        ],
        correct_answer: this.state.Q3.ansStr,
      },
    ];
    const progressAnim = this.state.progress.interpolate({
      inputRange: [0, this.allQuestions.length],
      outputRange: ["0%", "100%"],
    });
    this.allQuestions = data;

    return (
      <ImageBackground
        source={require("../../assets/images/intro-background.jpg")}
        style={styles.background}
      >
        <StatusBar barStyle="dark-content" backgroundColor={"white"} />
        <View style={styles.container}>
          <View style={styles.quiz_container}>
            {/* progress bar */}
            <View style={styles.progressBarWrapper}>
              <Animated.View
                style={[
                  {
                    height: 20,
                    borderRadius: 20,
                    backgroundColor: "#3498db",
                  },
                  {
                    width: progressAnim,
                  },
                ]}
              ></Animated.View>
            </View>

            {/* question number and description */}
            <View
              style={{
                marginVertical: 20,
              }}
            >
              <View style={styles.questionNumberWrapper}>
                <Text style={styles.targetQuestion}>
                  {this.state.currentQuestionIndex + 1}
                </Text>
                <Text style={styles.totalQuestion}>
                  / {this.allQuestions.length}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  color: "#171717",
                }}
              >
                {this.allQuestions[this.state.currentQuestionIndex].question}
              </Text>
            </View>

            {/* options */}
            <View>
              <TouchableOpacity
                onPress={() =>
                  this.validateAnswer(
                    this.allQuestions[this.state.currentQuestionIndex]
                      .options[0]
                  )
                }
                disabled={this.state.isOptionsDisabled}
                key={
                  this.allQuestions[this.state.currentQuestionIndex].options[0]
                }
                style={[
                  styles.option,
                  {
                    borderColor:
                      this.allQuestions[this.state.currentQuestionIndex]
                        .options[0] == this.correctOption
                        ? "#00C851"
                        : this.allQuestions[this.state.currentQuestionIndex]
                            .options[0] == this.state.currentOptionSelected
                        ? "#ff4444"
                        : "#1E90FF" + "40",
                    backgroundColor:
                      this.allQuestions[this.state.currentQuestionIndex]
                        .options[0] == this.correctOption
                        ? "#00C851" + "20"
                        : this.allQuestions[this.state.currentQuestionIndex]
                            .options[0] == this.state.currentOptionSelected
                        ? "#ff4444" + "20"
                        : "#1E90FF" + "20",
                  },
                ]}
              >
                <Text style={{ fontSize: 18, width: 220 }}>
                  {
                    this.allQuestions[this.state.currentQuestionIndex]
                      .options[0]
                  }
                </Text>

                {/* Show Check Or Cross Icon based on correct answer*/}
                {this.allQuestions[this.state.currentQuestionIndex]
                  .options[0] == this.correctOption ? (
                  <View style={styles.answerCorrect}>
                    <MaterialCommunityIcons
                      name="check"
                      style={{
                        fontSize: 20,
                      }}
                    />
                  </View>
                ) : this.allQuestions[this.state.currentQuestionIndex]
                    .options[0] == this.state.currentOptionSelected ? (
                  <View style={styles.answerWrong}>
                    <MaterialCommunityIcons
                      name="close"
                      style={{
                        fontSize: 20,
                      }}
                    />
                  </View>
                ) : null}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  this.validateAnswer(
                    this.allQuestions[this.state.currentQuestionIndex]
                      .options[1]
                  )
                }
                disabled={this.state.isOptionsDisabled}
                key={
                  this.allQuestions[this.state.currentQuestionIndex].options[1]
                }
                style={[
                  styles.option,
                  {
                    borderColor:
                      this.allQuestions[this.state.currentQuestionIndex]
                        .options[1] == this.correctOption
                        ? "#00C851"
                        : this.allQuestions[this.state.currentQuestionIndex]
                            .options[1] == this.state.currentOptionSelected
                        ? "#ff4444"
                        : "#1E90FF" + "40",
                    backgroundColor:
                      this.allQuestions[this.state.currentQuestionIndex]
                        .options[1] == this.correctOption
                        ? "#00C851" + "20"
                        : this.allQuestions[this.state.currentQuestionIndex]
                            .options[1] == this.state.currentOptionSelected
                        ? "#ff4444" + "20"
                        : "#1E90FF" + "20",
                  },
                ]}
              >
                <Text style={{ fontSize: 18, width: 220 }}>
                  {
                    this.allQuestions[this.state.currentQuestionIndex]
                      .options[1]
                  }
                </Text>

                {/* Show Check Or Cross Icon based on correct answer*/}
                {this.allQuestions[this.state.currentQuestionIndex]
                  .options[1] == this.correctOption ? (
                  <View style={styles.answerCorrect}>
                    <MaterialCommunityIcons
                      name="check"
                      style={{
                        fontSize: 20,
                      }}
                    />
                  </View>
                ) : this.allQuestions[this.state.currentQuestionIndex]
                    .options[1] == this.state.currentOptionSelected ? (
                  <View style={styles.answerWrong}>
                    <MaterialCommunityIcons
                      name="close"
                      style={{
                        fontSize: 20,
                      }}
                    />
                  </View>
                ) : null}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  this.validateAnswer(
                    this.allQuestions[this.state.currentQuestionIndex]
                      .options[2]
                  )
                }
                disabled={this.state.isOptionsDisabled}
                key={
                  this.allQuestions[this.state.currentQuestionIndex].options[2]
                }
                style={[
                  styles.option,
                  {
                    borderColor:
                      this.allQuestions[this.state.currentQuestionIndex]
                        .options[2] == this.correctOption
                        ? "#00C851"
                        : this.allQuestions[this.state.currentQuestionIndex]
                            .options[2] == this.state.currentOptionSelected
                        ? "#ff4444"
                        : "#1E90FF" + "40",
                    backgroundColor:
                      this.allQuestions[this.state.currentQuestionIndex]
                        .options[2] == this.correctOption
                        ? "#00C851" + "20"
                        : this.allQuestions[this.state.currentQuestionIndex]
                            .options[2] == this.state.currentOptionSelected
                        ? "#ff4444" + "20"
                        : "#1E90FF" + "20",
                  },
                ]}
              >
                <Text style={{ fontSize: 18, width: 220 }}>
                  {
                    this.allQuestions[this.state.currentQuestionIndex]
                      .options[2]
                  }
                </Text>

                {/* Show Check Or Cross Icon based on correct answer*/}
                {this.allQuestions[this.state.currentQuestionIndex]
                  .options[2] == this.correctOption ? (
                  <View style={styles.answerCorrect}>
                    <MaterialCommunityIcons
                      name="check"
                      style={{
                        fontSize: 20,
                      }}
                    />
                  </View>
                ) : this.allQuestions[this.state.currentQuestionIndex]
                    .options[2] == this.state.currentOptionSelected ? (
                  <View style={styles.answerWrong}>
                    <MaterialCommunityIcons
                      name="close"
                      style={{
                        fontSize: 20,
                      }}
                    />
                  </View>
                ) : null}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  this.validateAnswer(
                    this.allQuestions[this.state.currentQuestionIndex]
                      .options[3]
                  )
                }
                disabled={this.state.isOptionsDisabled}
                key={
                  this.allQuestions[this.state.currentQuestionIndex].options[3]
                }
                style={[
                  styles.option,
                  {
                    borderColor:
                      this.allQuestions[this.state.currentQuestionIndex]
                        .options[3] == this.correctOption
                        ? "#00C851"
                        : this.allQuestions[this.state.currentQuestionIndex]
                            .options[3] == this.state.currentOptionSelected
                        ? "#ff4444"
                        : "#1E90FF" + "40",
                    backgroundColor:
                      this.allQuestions[this.state.currentQuestionIndex]
                        .options[3] == this.correctOption
                        ? "#00C851" + "20"
                        : this.allQuestions[this.state.currentQuestionIndex]
                            .options[3] == this.state.currentOptionSelected
                        ? "#ff4444" + "20"
                        : "#1E90FF" + "20",
                  },
                ]}
              >
                <Text style={{ fontSize: 18, width: 220 }}>
                  {
                    this.allQuestions[this.state.currentQuestionIndex]
                      .options[3]
                  }
                </Text>

                {/* Show Check Or Cross Icon based on correct answer*/}
                {this.allQuestions[this.state.currentQuestionIndex]
                  .options[3] == this.correctOption ? (
                  <View style={styles.answerCorrect}>
                    <MaterialCommunityIcons
                      name="check"
                      style={{
                        fontSize: 20,
                      }}
                    />
                  </View>
                ) : this.allQuestions[this.state.currentQuestionIndex]
                    .options[3] == this.state.currentOptionSelected ? (
                  <View style={styles.answerWrong}>
                    <MaterialCommunityIcons
                      name="close"
                      style={{
                        fontSize: 20,
                      }}
                    />
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>

            {/* next button */}
            {this.state.showNextButton == true ? (
              <TouchableOpacity
                onPress={() => this.handleNext()}
                style={styles.nextButton}
              >
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: "center",
                  }}
                >
                  Next
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* model for finish quiz */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.showScoreModal}
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
                    {this.state.score == 3
                      ? "Congratulations!"
                      : "Try Harder Next Time"}
                  </Text>
                  <Text>
                    You have earned {this.state.score}
                    {this.state.score <= 1 ? (
                      <Text> coin</Text>
                    ) : (
                      <Text> coins</Text>
                    )}
                  </Text>

                  <View style={styles.resultBox}>
                    <Text
                      style={{
                        fontSize: 30,
                        color: this.state.score == 3 ? "#00C851" : "#ff4444",
                      }}
                    >
                      {this.state.score}
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                      }}
                    >
                      / {this.allQuestions.length}
                    </Text>
                  </View>

                  {/* Exit Quiz button */}
                  <TouchableOpacity
                    onPress={() => {
                      this.exitQuiz();
                      navigation.navigate("Game_Quiz");
                    }}
                    style={styles.exitButton}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 18,
                      }}
                    >
                      Exit Quiz
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* full marks achievement modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.showFullScoreAchievementModal}
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
                    You have unlock {this.state.fullScore.name}
                  </Text>

                  {/* Exit Quiz button */}
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ showFullScoreAchievementModal: false });
                      this.setState({ showScoreModal: true });
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

            {/* hundred marks achievement modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.showHundredMarksAchievementModal}
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
                    You have unlock {this.state.hundredMarks.name}
                  </Text>

                  {/* Exit Quiz button */}
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        showHundredMarksAchievementModal: false,
                      });
                      this.setState({ showScoreModal: true });
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
  quiz_container: {
    borderWidth: 2,
    marginTop: 25,
    width: "85%",
    alignSelf: "center",
    height: "90%",
    borderRadius: 30,
    backgroundColor: "white",
    overflow: "scroll",
    padding: 10,
    paddingBottom: 15,
    opacity: 0.95,
  },
  background: {
    flexDirection: "row",
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
  },
  progressBarWrapper: {
    marginTop: 15,
    width: "100%",
    height: 20,
    borderRadius: 20,
    backgroundColor: "#00000020",
  },
  questionNumberWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  targetQuestion: {
    fontSize: 20,
    opacity: 0.6,
    marginRight: 2,
  },
  totalQuestion: {
    fontSize: 18,
    opacity: 0.6,
  },
  option: {
    borderWidth: 3,
    height: 60,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  answerCorrect: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: "#00C851",
    justifyContent: "center",
    alignItems: "center",
  },
  answerWrong: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 5,
    alignSelf: "center",
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
  resultBox: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginVertical: 20,
  },
});
