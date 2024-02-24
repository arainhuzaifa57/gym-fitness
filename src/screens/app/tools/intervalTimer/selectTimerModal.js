import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useSelector, useDispatch } from "react-redux";
import {
  setMinutesValue,
  setSecondsValue,
} from "../../../../api/features/tools/intervalTimerSlice";
import { goBack } from "../../../../navigation/rootNavigation";

const SelectTimerModal = ({ route }) => {
  const dispatch = useDispatch();
  const { field } = route.params;
  const intervalData = useSelector((state) => state.intervalTimer.template);
  let dataField;

  // switch to get field type
  switch (field) {
    case "warmUpDuration":
      dataField = intervalData.warmUpDuration;
      break;
    case "activeDuration":
      dataField = intervalData.activeDuration;
      break;
    case "restDuration":
      dataField = intervalData.restDuration;
      break;
    case "coolDownDuration":
      dataField = intervalData.coolDownDuration;
      break;
  }

  return (
    <View className="items-center bg-transparent flex-1 justify-end flex-col">
      <View className="bg-gray-900 mt-2 rounded-2xl w-full h-1/3">
        <View className="items-end">
          <TouchableOpacity
            className=" w-12 mx-4 mt-2"
            onPress={() => goBack()}
          >
            <Text className="text-cyan-600 font-semibold text-lg">Done</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-center items-center">
          <View className="w-1/3">
            <Text className="text-white text-center">Minutes</Text>
            <Picker
              style={styles.picker}
              selectedValue={dataField.minutes}
              itemStyle={styles.pickerItem}
              onValueChange={(itemValue) =>
                dispatch(setMinutesValue({ field, value: itemValue }))
              }
            >
              {Array.from({ length: 60 }).map((_, index) => (
                <Picker.Item key={index} label={`${index}`} value={index} />
              ))}
            </Picker>
          </View>

          <View className="w-1/3">
            <Text className="text-white text-center">Seconds</Text>
            <Picker
              style={styles.picker}
              selectedValue={dataField.seconds}
              itemStyle={styles.pickerItem}
              onValueChange={(itemValue) =>
                dispatch(setSecondsValue({ field, value: itemValue }))
              }
            >
              {Array.from({ length: 60 }).map((_, index) => (
                <Picker.Item key={index} label={`${index}`} value={index} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    flex: 1,
    height: 150,
  },
  pickerItem: {
    color: "white",
  },
});

export default SelectTimerModal;
