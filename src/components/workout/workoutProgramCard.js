import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import React from "react";
import {
  editWorkoutProgra,
  editCurrentProgram,
} from "../../api/features/workout/workoutProgramSlice";
import { useDispatch } from "react-redux";
import { navigate } from "../../navigation/rootNavigation";
import { routes } from "../../constants/routes";

const WorkoutProgramCard = ({ workoutProgram, workoutDayFunc }) => {
  const dispatch = useDispatch();

  const editButton = () => {
    console.log("running edit button");
    dispatch(editCurrentProgram({ workoutProgram }));
    navigate(routes.editSelectedProgram);
  };

  const Item = ({ item, index }) => (
    <View className="my-1 bg-gray-900">
      <TouchableOpacity
        className="h-10 rounded-lg items-center justify-center px-2"
        onPress={() => workoutDayFunc(item)}
      >
        <View className="flex-row items-center justify-between w-11/12">
          <Text className="text-white">{item.workoutDay}</Text>
          <Image
            source={require("../../constants/icons/arrow-right.png")}
            resizeMode="contain"
            style={{
              width: 18,
              height: 18,
            }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item, index }) => {
    return (
      <View>
        <Item item={item} index={index} />
      </View>
    );
  };

  return (
    <View className="flex w-11/12 rounded-2xl mt-2">

      <View className="bg-card-bg rounded-xl items-center justify-center">

        <View className="flex-row w-11/12 justify-between mt-4 items-center">
          <View className="flex-row items-center">
              <Image
                source={require("../../constants/icons/scroll.png")}
                resizeMode="contain"
                style={{
                  width: 24,
                  height: 24,
                }}
              />
            <Text className="text-white text-base font-ibmRegular pl-1">
              Current Program
            </Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => editButton()}
            >
              <View className="bg-icon-bg px-2 py-1 rounded-full">
                <Image
                  source={require("../../constants/icons/edit-2.png")}
                  resizeMode="contain"
                  style={{
                    width: 24,
                    height: 24,
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="justify-center items-center my-4 w-11/12">
          <View className="rounded py-4 bg-gray-900 w-full">
            <Text className="text-cyan-500 ml-4 mb-1 text-xs">Program Name</Text>
            <Pressable onPress={() => navigate(routes.selectProgramPage)}>

              <View className="flex-row items-center justify-between w-full space-x-5">
                <Text className="text-white ml-4">
                  {workoutProgram.programName}
                </Text>
                <Image
                  source={require("../../constants/icons/arrow-down.png")}
                  resizeMode="contain"
                  style={{
                    width: 18,
                    height: 18,
                  }}
                  className="mr-4"
                />
              </View>

            </Pressable>
          </View>
        </View>
      </View>

      <View className="bg-card-bg mt-2 rounded-xl items-center py-2">
        <View className="flex-row my-2 w-11/12 items-center">
            <Image
              source={require("../../constants/icons/calendar.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
          <Text className="text-white text-base pl-1">
            Workout Days
          </Text>
        </View>

        <View className="w-11/12 mb-1">
          <FlatList
            data={workoutProgram.workoutDays}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            className="rounded-lg"
          />
        </View>
      </View>
    </View>
  );
};

export default WorkoutProgramCard;
