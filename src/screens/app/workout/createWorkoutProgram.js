import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  BackHandler,
  Alert,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { editWorkout } from "../../../api/features/workout/workoutSlice";
import {
  updateProgramName,
  resetWorkoutProgram,
  deleteWorkoutDay,
} from "../../../api/features/workout/workoutProgramSlice";
import {
  addWorkoutProgram,
  addProgramToUserCreatedCollection,
} from "../../../api/features/workout/selectWorkoutProgramSlice";
import { goBack, navigate } from "../../../navigation/rootNavigation";
import { routes } from "../../../constants/routes";
import { Header } from "../../../components/Header";
import CreateOrEditProgramCards from "../../../components/WorkoutProgram/createOrEditProgramCards";

const CreateWorkoutProgram = ({ navigation }) => {
  const workoutProgram = useSelector((state) => state.workoutProgram);
  const { userData } = useSelector((state) => state?.userData);
  const dispatch = useDispatch();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const alertBackButton = () => {
    const confirmAndPerformAction = () => {
      dispatch(resetWorkoutProgram());
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

  const saveButton = (workoutProgram) => {
    dispatch(addProgramToUserCreatedCollection(workoutProgram));
    dispatch(resetWorkoutProgram());
    goBack();
  };

  const editWorkoutDayPage = ({ item, index }) => {
    dispatch(editWorkout(item));
    console.log(item);
    navigate(routes.editWorkoutDay, { item, index });
  };

  return (
    <SafeAreaView className="bg-gray-900 flex-1 items-center">
      <Header
        containerStyle={{ marginTop: 10 }}
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
            <Text className="text-white text-lg ml-1 font-semibold">Create Program</Text>
          </TouchableOpacity>
        }
        rightHeader={
          <TouchableOpacity onPress={() => saveButton(workoutProgram)}>
            <Text className="text-cyan-600 font-semibold text-base mr-2">Save</Text>
          </TouchableOpacity>
        }
      />
      <CreateOrEditProgramCards
        workoutProgram={workoutProgram}
        goToWorkoutDay={editWorkoutDayPage}
      />
    </SafeAreaView>
  );
};

export default CreateWorkoutProgram;
