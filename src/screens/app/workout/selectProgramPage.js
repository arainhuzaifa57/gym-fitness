import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteCurrentProgram,
  fetchUserCreatedPrograms,
} from "../../../api/features/user/userCreatedPrograms";
import { updateCurrentProgram } from "../../../api/features/user/userDataSlice";
import { goBack } from "../../../navigation/rootNavigation";

const SelectProgramPage = ({ }) => {
  const dispatch = useDispatch();
  const userCreatedPrograms = useSelector(
    (state) => state.userCreatedPrograms.workoutPrograms
  );

  useEffect(() => {
    dispatch(fetchUserCreatedPrograms());
  }, []);

  const updateProgramId = (item) => {
    console.log("updating current program id " + item);
    dispatch(updateCurrentProgram(item));
    goBack();
  };

  const deleteProgram = (item) => {
    const confirmAndPerformAction = () => {
      dispatch(deleteCurrentProgram(item));
      goBack();
    };

    Alert.alert(
      "Confirm",
      "Delete selected program?",
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
    <View>
      <View className="flex-row items-center my-1">
        <TouchableOpacity
          className="bg-icon-bg py-2 px-2 rounded-full"
          onPress={() => deleteProgram(item.id)}>
          <Image
            source={require("../../../constants/icons/trash.png")}
            resizeMode="contain"
            style={{
              width: 25,
              height: 25,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-grow rounded-lg bg-gray-900 py-3 ml-2"
          onPress={() => updateProgramId(item.id)}
        >
          <View className="flex-row justify-between">
            <Text className="text-white ml-4">
              {item.workoutProgram.programName}
            </Text>
            <Image
              source={require("../../../constants/icons/arrow-right.png")}
              resizeMode="contain"
              className="mr-4"
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
    <View className="items-center bg-transparent flex-1 justify-end flex-col">
      <View className="bg-card-bg mt-2 rounded-2xl w-full h-1/2">
        <View className="bg-gray-900 py-3 items-center rounded-t-2xl">
          <View className="border-2 rounded-lg w-12 border-gray-400" />
        </View>
        <View className="mx-4">
          <View className="flex-row mt-2 ml-2">
            <View className="flex-row items-center">
              <Image
                source={require("../../../constants/icons/note-2.png")}
                resizeMode="contain"
                style={{
                  width: 25,
                  height: 25,
                }}
              />
              <Text className="text-white ml-1  text-lg">
                Workout Programs
              </Text>
            </View>
            {/* <TouchableOpacity 
            className="bg-icon-bg py-2 px-2 rounded-full"
            onPress={() => goBack()}>
              <Image
                source={require("../../../constants/icons/close-circle.png")}
                resizeMode="contain"
                style={{
                  width: 25,
                  height: 25,
                }}
              />
            </TouchableOpacity> */}
          </View>
          <FlatList
            data={userCreatedPrograms}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            className="mt-4"
          />
        </View>
      </View>
    </View>
  );
};

export default SelectProgramPage;
