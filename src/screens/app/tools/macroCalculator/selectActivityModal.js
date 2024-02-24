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
import { goBack } from "../../../../navigation/rootNavigation";
import { updateMacrosField } from "../../../../api/features/tools/macroCalculator/calculateMacrosSlice";

const SelectActivityModal = () => {
  const dispatch = useDispatch();

  const activities = [
    { label: 'Sedentary (Little or no exercise)', value: 'sedentary' },
    { label: 'Light (Light exercise/sports 1-3 days a week)', value: 'light' },
    { label: 'Moderate (Moderate exercise/sports 3-5 days a week)', value: 'moderate' },
    { label: 'Active (Exercise/sports 4-5 days per week)', value: 'active' },
    { label: 'Very Active (Hard exercise/sports 6-7 days per week)', value: 'veryActive' },
    { label: 'Extra Active (Very hard exercise/sports & physical job or training twice a day)', value: 'extraActive' }
  ];

  const updateActivity = (selection) => {
    dispatch(updateMacrosField({ field: 'activity', value: selection }));
    goBack();
  };

  const Item = ({ item, index }) => (
    <View className="my-2 w-full">
      <View className="flex-row">
        <TouchableOpacity
          className="bg-card-bg flex-grow p-4 rounded-lg"
          onPress={() => updateActivity(item)}
        >
          <View className="flex-row justify-between">
            <Text
              className="text-white">
              {item.label}
            </Text>
            <Image
              source={require("../../../../constants/icons/arrow-right.png")}
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
      <View className="bg-gray-900 mt-2 rounded-2xl w-full h-3/4">
        <View className="bg-card-bg py-3 items-center rounded-t-2xl">
          <View className="border-2 rounded-lg w-12 border-gray-400" />
        </View>
        <View className="flex-row items-center ml-4 mt-2">
          <Image
            source={require("../../../../constants/icons/heart-tick.png")}
            style={{
              width: 24,
              height: 24,
            }}
          />
          <Text className="text-white text-lg ml-1">
            Select your activity level
          </Text>
        </View>

        <View className="items-center">
          <View className="items-center mt-2">
            <FlatList
              data={activities}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              className="rounded-lg mx-3"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default SelectActivityModal;
