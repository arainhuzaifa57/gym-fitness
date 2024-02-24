import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import IntervalTimerDurations from "../../../components/tools/intervalTimerDurations";
import { goBack } from "../../../navigation/rootNavigation";

const HITTimer = ({ navigation }) => {
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
      <View className="flex-1">
        <IntervalTimer />
      </View>
    </SafeAreaView>
  );
};

export default HITTimer;
