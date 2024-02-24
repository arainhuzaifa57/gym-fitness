import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  edittedWorkoutProgram,
  updateWorkoutProgram,
} from "../../../api/features/workout/selectWorkoutProgramSlice";
import { resetWorkoutProgram } from "../../../api/features/workout/workoutProgramSlice";
import { setCurrentProgram } from "../../../api/features/user/userDataSlice";
import { setStateToEditedProgram } from "../../../api/features/workout/currentProgramSlice";
import { editWorkout } from "../../../api/features/workout/workoutSlice";
import { goBack } from "../../../navigation/rootNavigation";
import { Header } from "../../../components/Header";
import CreateOrEditProgramCards from "../../../components/WorkoutProgram/createOrEditProgramCards";
import { navigate } from "../../../navigation/rootNavigation";
import { routes } from "../../../constants/routes";

const EditSelectedProgram = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedWorkoutProgram = useSelector((state) => state.workoutProgram);
  const programId = useSelector((state) => state.userData.currentProgram);

  useEffect(() => {
    navigation.setOptions({
      title: "",
      headerShown: false,
    });
  }, [selectedWorkoutProgram]);

  const resetAndGoBack = () => {
    dispatch(resetWorkoutProgram());
    goBack();
  };

  const saveButton = () => {
    console.log("running save button");
    dispatch(
      updateWorkoutProgram({
        workoutProgram: selectedWorkoutProgram,
        programId: programId,
      })
    );
    dispatch(setStateToEditedProgram(selectedWorkoutProgram));
    dispatch(resetWorkoutProgram());
    goBack();
  };

  const editWorkoutDayPage = ({ item, index }) => {
    dispatch(editWorkout(item));
    console.log(item);
    navigate(routes.editWorkoutDay, { item, index });
  };


  return (
    <View className="bg-gray-900 flex-1 items-center">
      <Header
       onBack={false}
       leftHeader={
         <TouchableOpacity
           className="flex-row items-center ml-2"
           onPress={resetAndGoBack}
         >
           <Image
             source={require("../../../constants/icons/arrow-left.png")}
             resizeMode="contain"
             style={{
               width: 24,
               height: 24,
             }}
           />
           <Text className="text-white text-lg ml-1 font-semibold">Edit Progam</Text>
         </TouchableOpacity>
       }
        rightHeader={
          <TouchableOpacity onPress={() => saveButton()}>
            <Text className="text-cyan-500 font-semibold text-base">Save</Text>
          </TouchableOpacity>
        }
      />
      {/* <WorkoutProgramComponent saveFunc={saveButton} /> */}
      <CreateOrEditProgramCards workoutProgram={selectedWorkoutProgram} goToWorkoutDay={editWorkoutDayPage}/>
    </View>
  );
};

export default EditSelectedProgram;
