import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Touchable,
} from "react-native";
import React from "react";
import { navigate } from "../../navigation/rootNavigation";
import { routes } from "../../constants/routes";

const ToolsBar = ({ weightPress, macroCalculatorPress }) => {
  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      className="flex-row"
      contentContainerStyle={{ paddingHorizontal: 10 }}
    >
      <TouchableOpacity onPress={weightPress}>
        <View className="bg-card-bg rounded-2xl mx-1 p-2 items-center w-32">
          <Image
            source={require("../../constants/icons/weight.png")}
            resizeMode="contain"
            style={{
              width: 35,
              height: 35,
            }}
            className="mb-1"
          />
          <Text className="text-white">Weight Journal</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigate(routes.selectIntervalWorkout)}>
        <View className="bg-card-bg rounded-2xl mx-1 p-2 items-center w-32">
          <Image
            source={require("../../constants/icons/clock.png")}
            resizeMode="contain"
            style={{
              width: 35,
              height: 35,
            }}
            className="mb-1"
          />
          <Text className="text-white">Interval Timer</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={macroCalculatorPress}>
        <View className="bg-card-bg rounded-2xl mx-1 p-2 items-center w-32">
          <Image
            source={require("../../constants/icons/calculator.png")}
            resizeMode="contain"
            style={{
              width: 35,
              height: 35,
            }}
            className="mb-1"
          />
          <Text className="text-white">Macro Calculator</Text>
        </View>
      </TouchableOpacity>
      {/* <View className="bg-gray-800 rounded-2xl mx-1 p-2 items-center w-32">
        <Image
          source={require("../../constants/icons/calculator-white.png")}
          resizeMode="contain"
          style={{
            width: 40,
            height: 40,
          }}
          className="mb-1"
        />
        <Text className="text-white">Maco Tracker</Text>
      </View> */}
    </ScrollView>
  );
};

export default ToolsBar;
