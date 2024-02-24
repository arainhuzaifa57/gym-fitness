import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import React from "react";
import moment from 'moment';


const RecordedExerciseCard = ({ sets }) => {
  return (
    <View className="w-full">
      {sets?.map((val, i) => {
        return (
          <View key={i}>
            <View className="items-center">
              <View className="flex-row w-1/2 justify-center">
                <Text className="p-4  text-white rounded-2x1 text-center">
                  {val.weight}
                </Text>
                <Text className="p-4  text-white rounded-2x1 text-center">
                  {val.rep}
                </Text>
              </View>
            </View>
            {i < sets.length - 1 && <View className="border border-gray-800 mt-2" />}
          </View>
        );
      })}
    </View>
  );
};

const RecordedWorkoutDayCards = ({ workoutDayData }) => {

  return (
    <ScrollView className="bg-gray-900 w-full flex">
      <View className="items-center">
        <View className="w-11/12">
          <View className="mt-4 justify-items-start w-11/12">
            <View className="flex-row ">
              <Image
                source={require('../../constants/icons/weight-dumbbell.png')}
                style={{
                  width: 30,
                  height: 30,
                }}
              />
              <Text className="text-white text-lg ml-1">
                Exercises
              </Text>
            </View>
          </View>
          {workoutDayData?.exercises?.map((ex, i) => {
            return (
              <View
                className="rounded-xl my-2 bg-card-bg flex w-full items-center"
                key={i}
              >
                <View className="w-2/3 items-center">
                  <View className="items-center justify-center bg-gray-900 py-2 w-full rounded-lg my-4">
                    <Text className="text-white">{ex?.exercise}</Text>
                  </View>
                  <View className="flex-row justify-evenly w-1/2 my-2">
                    <Text className="text-white">Weight</Text>
                    <Text className="text-white">Reps</Text>
                  </View>
                  <View className="border border-gray-800 w-full mt-2" />
                  <RecordedExerciseCard sets={ex?.sets} />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default RecordedWorkoutDayCards;
