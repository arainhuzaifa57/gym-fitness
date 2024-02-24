import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { goBack, navigate } from "../../../navigation/rootNavigation";
import { routes } from "../../../constants/routes";

const SelectProgram = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      title: "",
      headerLeft: () => (
        <TouchableOpacity onPress={() => goBack()}>
          <Image
            source={require("../../../constants/icons/arrow-left.png")}
            resizeMode="contain"
            style={{
              width: 25,
              height: 25,
            }}
          />
        </TouchableOpacity>
      ),
    });
  }, []);

  return (
    <SafeAreaView className="bg-gray-900 flex-1">
      <View className="flex-1 items-center">
        <TouchableOpacity
          className="items-center bg-gray-800 w-1/2 h-10 rounded-xl justify-center border-gray-800 my-2"
          onPress={() => navigate(routes.createWorkoutProgram)}
        >
          <Text className="text-white">Create Workout Program</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SelectProgram;
