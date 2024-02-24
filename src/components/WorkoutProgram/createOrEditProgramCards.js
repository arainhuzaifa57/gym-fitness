import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Alert,
} from "react-native";
import React from "react";
import {
  editWorkoutProgra,
  editCurrentProgram,
  deleteWorkoutDay,
} from "../../api/features/workout/workoutProgramSlice";
import { useDispatch } from "react-redux";
import { navigate } from "../../navigation/rootNavigation";
import { routes } from "../../constants/routes";
import { updateProgramName } from "../../api/features/workout/workoutProgramSlice";
import { height, totalSize, width } from "react-native-dimension";
import { goBack } from "../../navigation/rootNavigation";


const CreateOrEditProgramCards = ({ workoutProgram, goToWorkoutDay }) => {
  const dispatch = useDispatch();

  const alertAndDeleteWorkoutDay = (index) => {
    const confirmAndPerformAction = () => {
      dispatch(deleteWorkoutDay(index));
    };

    Alert.alert(
      "Confirm",
      "Delete selected day?",
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


  const Item = ({ item, index }) => (
    <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity
        onPress={() => alertAndDeleteWorkoutDay(index)}
      >
        <View className="bg-icon-bg rounded-full p-2 mr-1">
          <Image
            source={require("../../constants/icons/trash.png")}
            resizeMode="contain"
            style={{
              width: 24,
              height: 24,
            }}
          />
        </View>
      </TouchableOpacity>
      <View className="bg-gray-900 flex-grow">
        <TouchableOpacity
          className="flex-grow py-2  items-center justify-center px-2"
          onPress={() => goToWorkoutDay({ item, index })}
        >
          <View className="flex-row items-center justify-between flex-grow ">
            <Text className="text-white flex-grow ml-2">{item.workoutDay}</Text>
            <Image
              source={require("../../constants/icons/arrow-right.png")}
              resizeMode="contain"
              style={{
                width: 16,
                height: 16,
              }}
            />
          </View>
        </TouchableOpacity>
      </View>
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
    <View className="w-11/12 rounded-2xl mt-2">
      <View className="bg-card-bg rounded-xl items-center justify-center">
        <View className="flex-row w-11/12 items-center mt-4">
          <Image
            source={require("../../constants/icons/scroll.png")}
            resizeMode="contain"
            style={{
              width: 24,
              height: 24,
            }}
          />
          <Text className="text-white text-base pl-1">
            Program Name
          </Text>
        </View>
        <View className="justify-center items-center my-4 w-11/12">
          <View className=" bg-gray-900 w-full">
            <TextInput
              className="p-4 bg-gray-900 text-white rounded-xl"
              placeholderTextColor={"gray"}
              placeholder="Enter program name"
              value={workoutProgram.programName}
              onChangeText={(text) => dispatch(updateProgramName(text))}
            />
          </View>
        </View>
      </View>
      <View className="bg-card-bg mt-2 rounded-xl items-center py-2">
        <View className="flex-row w-11/12 justify-between items-center">
          <View className="flex-row">
            <Image
              source={require("../../constants/icons/calendar-day.png")}
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
          <TouchableOpacity
            onPress={() => navigate(routes.createWorkoutDay)}
          >
            <View className="bg-icon-bg rounded-full px-2 py-2">
              <Image
                source={require("../../constants/icons/add-square.png")}
                resizeMode="contain"
                style={{
                  width: 24,
                  height: 24,
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View className="w-11/12 mt-4">
          <FlatList
            data={workoutProgram.workoutDays}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            className="grow-0 w-full"
          />
        </View>
      </View>
    </View>
  );
};

export default CreateOrEditProgramCards
