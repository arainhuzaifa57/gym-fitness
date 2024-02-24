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
    addExerciseSet,
} from "../../api/features/workout/workoutSlice";
import { addWorkoutDay } from "../../api/features/workout/workoutProgramSlice";
import ExerciseCardList from "../workout/exerciseCardList";
import { goBack } from "../../navigation/rootNavigation";
import { Header } from "../Header";


const CreateOrEditWorkoutDayCards = () => {
    const dispatch = useDispatch();
    const workoutDay = useSelector((state) => state.workout);

    return (
        <View>
            <View className="w-11/12 items-center bg-card-bg rounded-2xl py-4 mt-4">
                <View className="justify-items-start w-11/12">
                    <View className="flex-row mb-2">
                        <Image
                            source={require("../../constants/icons/calendar-day.png")}
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
                    placeholder="Enter workout day name"
                    value={workoutDay.workoutDay}
                    onChangeText={(text) => dispatch(updateWorkoutDay(text))}
                />
            </View>
            <View className="mt-4 w-11/12 flex-row items-center justify-between">
                <View className="flex-row">
                    <Image
                        source={require("../../constants/icons/weight-dumbbell.png")}
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
                            source={require("../../constants/icons/add-square.png")}
                            resizeMode="contain"
                            style={{
                                width: 24,
                                height: 24,
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <ExerciseCardList exercises={workoutDay.exercises} dispatch={dispatch} />
        </View>
    );
}

export default CreateOrEditWorkoutDayCards