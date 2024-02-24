import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import CounterdownTimer from "../../../components/stopclock/countdownTimer";
import { useSelector, useDispatch } from "react-redux";
import {
  resetInitialState,
  addRecordedWorkout,
  addExerciseSet
} from "../../../api/features/workout/workoutSlice";
import ExerciseCardList from "../../../components/workout/exerciseCardList";
import { goBack } from "../../../navigation/rootNavigation";
import { Header } from "../../../components/Header";
import { fetchMonthlyWorkoutHistory } from "../../../api/firebase/db";
import auth from "@react-native-firebase/auth";
import moment from "moment";


const RecordWorkout = () => {
  const exercises = useSelector((state) => state.workout?.exercises);
  const workoutDay = useSelector((state) => state.workout);
  const [workoutHistory, setWorkoutHistory] = useState({});
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const dispatch = useDispatch();
  
  useEffect(() => {
    setWorkoutStartTime(moment());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = moment();
      const duration = moment.duration(now.diff(workoutStartTime));
      setElapsedTime(duration.asSeconds()); // Update elapsed time in seconds
    }, 1000);

    return () => clearInterval(timer); // Clear the interval on component unmount
  }, [workoutStartTime]);

  const formatElapsedTime = (seconds) => {
    const duration = moment.duration(seconds, 'seconds');
    const hours = Math.floor(duration.asHours());
    const mins = duration.minutes();
    const secs = duration.seconds();
    let formattedTime = '';

    if (hours > 0) {
      formattedTime += `${hours}:`;
    }

    formattedTime += `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    return formattedTime;
  };

  useEffect(() => {
    const userId = auth().currentUser.uid;
    fetchMonthlyWorkoutHistory(userId).then(data => {
      console.log("Setting workout history:", data);
      setWorkoutHistory(data);
    });
  }, []);

  const alertAndSave = () => {

    const confirmAndPerformAction = () => {
      console.log("saving to recorded workout to firestore");
      dispatch(addRecordedWorkout({workoutDay: workoutDay, duration: elapsedTime}));
      dispatch(resetInitialState());
      goBack();
    };

    Alert.alert(
      "Confirm",
      "All done with your workout? ",
      [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: confirmAndPerformAction,
        },
      ],
      { cancelable: false }
    );
  };

  const backButton = () => {
    const confirmAndPerformAction = () => {
      console.log("running back button");
      dispatch(resetInitialState());
      goBack();
    };

    Alert.alert(
      "Confirm",
      "Your current data will get deleted. Do you want to go back? ",
      [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: confirmAndPerformAction,
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView className="bg-gray-900 flex-1 items-center">
      <View className="mt-1 mb-1">
        <Header
          containerStyle={{ marginTop: 0 }}
          onBack={false}
          leftHeader={
            <TouchableOpacity
              className="flex-row items-center ml-2"
              onPress={backButton}
            >
              <Image
                source={require("../../../constants/icons/arrow-left.png")}
                resizeMode="contain"
                style={{
                  width: 24,
                  height: 24,
                }}
              />
              <Text className="text-white font-semibold text-lg ml-1">{workoutDay?.workoutDay}</Text>
            </TouchableOpacity>
          }
          rightHeader={
            <TouchableOpacity onPress={() => alertAndSave()}>
              <Text className="text-cyan-600 font-semibold text-base mr-2">Save</Text>
            </TouchableOpacity>
          }
        />
      </View>

      <View className="w-11/12">
        <CounterdownTimer />
      </View>

      <View className="my-2 w-11/12 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={require("../../../constants/icons/weight-dumbbell.png")}
            style={{
              width: 30,
              height: 30,
            }}
          />
            <Text className="text-white text-lg ml-1 mb-1">
              Exercises
            </Text>
        </View>
        <View className="items-center flex-row">
        <Image
              source={require("../../../constants/icons/stopwatch-blue.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
            <Text className="text-white ml-1">{formatElapsedTime(elapsedTime)}</Text>
        </View>
        
        <View className="bg-icon-bg py-2 px-2 rounded-full">
          <TouchableOpacity
            onPress={() => dispatch(addExerciseSet())}
          >
            <Image
              source={require("../../../constants/icons/add-square.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ExerciseCardList exercises={exercises} template={false} workoutHistory={workoutHistory} />
    </SafeAreaView>
  );
};

export default RecordWorkout;
