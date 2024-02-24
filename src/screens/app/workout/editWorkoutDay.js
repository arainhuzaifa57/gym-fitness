import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateWorkoutDay,
  resetInitialState,
  addExerciseSet
} from "../../../api/features/workout/workoutSlice";
import {
  addWorkoutDay,
  updateWorkoutDayName,
  edittedWorkoutDay,
} from "../../../api/features/workout/workoutProgramSlice";
import ExerciseCardList from "../../../components/workout/exerciseCardList";
import { goBack } from "../../../navigation/rootNavigation";
import { Header } from "../../../components/Header";

const EditWorkoutDay = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { item, index } = route.params;
  const workoutDay = useSelector((state) => state.workout);


  const alertBackButton = () => {
    const confirmAndPerformAction = () => {
      dispatch(resetInitialState());
      goBack();
    };

    Alert.alert(
      "Confirm",
      "Your changes will not be saved. Do you want to go back? ",
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

  const saveButton = () => {
    dispatch(edittedWorkoutDay({ workoutDay, index }));
    dispatch(resetInitialState());
    goBack();
  };

  return (
    <View className="bg-gray-900 flex-1 items-center">
      <View className="mt-3">
        <Header
          onBack={false}
          leftHeader={
            <TouchableOpacity
              className="flex-row items-center ml-2"
              onPress={alertBackButton}
            >
              <Image
                source={require("../../../constants/icons/arrow-left.png")}
                resizeMode="contain"
                style={{
                  width: 24,
                  height: 24,
                }}
              />
              <Text className="text-white text-lg ml-1 font-semibold">Edit Workout Day</Text>
            </TouchableOpacity>
          }
          rightHeader={
            <TouchableOpacity onPress={() => saveButton()}>
              <Text className="text-cyan-500 font-semibold text-base mr-2">Save</Text>
            </TouchableOpacity>
          }
        />
      </View>
      <View className="w-11/12 items-center bg-card-bg rounded-2xl py-4 mt-6">
        <View className="justify-items-start w-11/12">
          <View className="flex-row mb-2">
            <Image
              source={require("../../../constants/icons/calendar-day.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
            <Text className="text-white font-ibmRegular text-lg ml-1">
              Workout Day
            </Text>
          </View>
        </View>
        <TextInput
          className="p-4 bg-gray-900 text-white w-11/12 rounded-2xl"
          placeholderTextColor={"gray"}
          placeholder="Enter Workout Day Name"
          value={workoutDay.workoutDay}
          onChangeText={(text) => dispatch(updateWorkoutDay(text))}
        />
      </View>
      <View className="mt-4 w-11/12 flex-row items-center justify-between">
        <View className="flex-row">
          <Image
            source={require("../../../constants/icons/weight-dumbbell.png")}
            resizeMode="contain"
            style={{
              width: 30,
              height: 30,
            }}
          />
          <Text className="text-white font-ibmRegular text-lg ml-1">
            Exercises
          </Text>
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
      <ExerciseCardList exercises={workoutDay.exercises} template={true} />
    </View>
  );
};

export default EditWorkoutDay;
