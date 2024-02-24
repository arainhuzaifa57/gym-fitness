import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Alert
} from "react-native";
import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addExerciseSet,
  deleteExerciseSet,
  showSets,
} from "../../api/features/workout/workoutSlice";
import ExerciseCard from "./exerciseCard";
import { navigate } from "../../navigation/rootNavigation";
import { routes } from "../../constants/routes";
import ExerciseCardTemplate from "./exerciseCardTemplate";
import { deleteTemplateExerciseSet } from "../../api/features/workout/workoutTemplate";

const ExerciseCardList = ({ exercises, template, workoutHistory = {}, scrollFunc }) => {
  const dispatch = useDispatch();
  const templateExercises = useSelector((state) => state.workoutTemplate?.templateExercises);

  const alertAndDelete = (i) => {

    const confirmAndPerformAction = (i) => {
      console.log("Deleting exercise card with index:", i);
      dispatch(deleteExerciseSet(i))
      dispatch(deleteTemplateExerciseSet(i))
    };

    Alert.alert(
      "Confirm",
      "Delete this exercise?",
      [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => confirmAndPerformAction(i),
        },
      ],
      { cancelable: false }
    );
  };


  // console.log("Workout history:", workoutHistory);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, width: '100%' }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View className='mx-3'>
          <View>
            {exercises?.map((ex, i) => {
              const templateSet = templateExercises[i] ? templateExercises[i]?.sets : [{ weight: "", rep: "" }];

              // Conditional rendering based on workoutHistory
              const exerciseHistory = workoutHistory[ex.exercise] || [];
              const lastWorkoutData = exerciseHistory.length > 0
                ? exerciseHistory[exerciseHistory.length - 1]
                : null;


              return (
                <View
                  className="rounded-2xl my-2 bg-card-bg"
                  key={i}
                >
                  <View className="flex-row justify-center items-center mt-4 mx-4">
                    <View className="rounded-xl bg-gray-900 flex-grow p-4 ">
                      <Pressable
                        onPress={() =>
                          navigate(routes.selectExerciseModal, {
                            ex: { exercises },
                            i: i,
                          })
                        }
                      >
                        <View className="flex-row items-center justify-between" style={{ flexWrap: 'wrap' }}>
                          <Text className="text-white"
                            style={{ flex: 1, marginRight: 10 }}
                          >{ex.exercise}</Text>
                          <Image
                            source={require("../../constants/icons/arrow-down.png")}
                            resizeMode="contain"
                            className="ml-2"
                            style={{
                              width: 16,
                              height: 16,
                            }}
                          />
                        </View>
                      </Pressable>
                    </View>
                    <TouchableOpacity
                      onPress={() => alertAndDelete(i)}
                      className="bg-icon-bg rounded-full py-2 px-2 ml-1"
                    >
                      <Image
                        source={require("../../constants/icons/trash.png")}
                        style={{
                          width: 24,
                          height: 24,
                        }}
                      />
                    </TouchableOpacity>
                    {ex.show == true ? (
                      <TouchableOpacity
                        onPress={() => dispatch(showSets(i))}
                        className="bg-icon-bg rounded-full py-2 px-2 ml-1"
                      >
                        <Image
                          source={require("../../constants/icons/eye.png")}
                          style={{
                            width: 24,
                            height: 24,
                          }}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => dispatch(showSets(i))}
                        className="bg-icon-bg rounded-full py-2 px-2 ml-1"
                      >
                        <Image
                          source={require("../../constants/icons/eye-slash.png")}
                          style={{
                            width: 24,
                            height: 24,
                          }}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View className="w-full items-center">
                    {template === true ? <ExerciseCardTemplate show={ex.show} cardIndex={i} sets={ex.sets} /> :
                      <ExerciseCard show={ex.show} cardIndex={i} sets={ex.sets} templateSets={templateSet} lastWorkoutData={lastWorkoutData} exerciseHistory={exerciseHistory} />
                    }
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        <View className="h-60"/>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ExerciseCardList;
