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

const SelectGoalModal = () => {
  const dispatch = useDispatch();

  const goals = [
    { label: 'Maintain Weight: No weight change', value: 'maintain' },
    { label: 'Mild Weight Loss: Lose 0.5 lbs/week', value: 'mildLoss' },
    { label: 'Weight Loss: Lose 1 lb/week', value: 'loss' },
    { label: 'Extreme Weight Loss: Lose 2 lbs/week', value: 'extremeLoss' },
    { label: 'Mild Weight Gain: Gain 0.5 lbs/week', value: 'mildGain' },
    { label: 'Weight Gain: Gain 1 lb/week', value: 'gain' },
    { label: 'Extreme Weight Gain: Gain 2 lbs/week', value: 'extremeGain' }
  ];

  const updateActivity = (selection) => {
    dispatch(updateMacrosField({ field: 'goal', value: selection }));
    goBack();
  };

  const Item = ({ item, index }) => (
      <View className="flex-row my-2 mx-4">
        <TouchableOpacity
          className="bg-card-bg flex-grow p-4 rounded-lg"
          onPress={() => updateActivity(item)}
        >
          <View className="flex-row justify-between">
            <Text className="text-white">
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
  );

  const renderItem = ({ item, index }) => {
    return (
        <Item item={item} index={index} />
    );
  };

  return (
    <View className="bg-transparent flex-1 justify-end flex-col">
      <View className="bg-gray-900 mt-2 rounded-2xl w-full h-3/4">

        <View className="bg-card-bg py-3 items-center rounded-t-2xl">
          <View className="border-2 rounded-lg w-12 border-gray-400" />
        </View>

        <View className="flex-row mt-2 ml-4 items-center">
        <Image
            source={require("../../../../constants/icons/flag.png")}
            style={{
              width: 24,
              height: 24,
            }}
          />
          <Text className="text-white text-lg ml-1">
            Select your goal
          </Text>
        </View>

        <View className="items-center">
          <View className="w-full mt-2">
            <FlatList
              data={goals}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>

      </View>
    </View>
  );
};

export default SelectGoalModal;
