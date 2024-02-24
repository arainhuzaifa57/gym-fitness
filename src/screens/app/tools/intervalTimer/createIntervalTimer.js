import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import React, { useState } from "react";
import IntervalTimerDurations from "../../../../components/tools/intervalTimerDurations";
import { useDispatch, useSelector } from "react-redux";
import {
  addTemplateToUserCollection,
  resetTemplate,
  updateCreatedAt,
  updateTemplateName,
} from "../../../../api/features/tools/intervalTimerSlice";
import { goBack, navigate } from "../../../../navigation/rootNavigation";
import { height, width } from "react-native-dimension";
import { Header } from "../../../../components/Header";
import { routes } from "../../../../constants/routes";
import { TextInput } from "react-native-paper";


const CreateIntervalTimer = () => {
  const dispatch = useDispatch();
  const templateName = useSelector((state) => state.intervalTimer?.template?.templateName);
  const rounds = useSelector((state) => state.intervalTimer?.template?.rounds);
  const template = useSelector((state) => state.intervalTimer?.template);
  const [isTemplateNameValid, setTemplateNameValid] = useState(true);
  const [isRoundsValid, setRoundsValid] = useState(true);

  const saveFunc = () => {
    if (validateForm()) {
      dispatch(addTemplateToUserCollection(template));
      dispatch(resetTemplate());
      goBack();
    } else {
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!templateName.trim()) {
      setTemplateNameValid(false);
      isValid = false;
    } else {
      setTemplateNameValid(true);
    }

    if (!rounds.trim()) {
      setRoundsValid(false);
      isValid = false;
    } else {
      setRoundsValid(true);
    }

    return isValid;
  };

  return (
    <View className="bg-gray-900 flex-1 items-center">
      <Header
        onBack={false}
        leftHeader={
          <TouchableOpacity
            className="flex-row items-center ml-2"
            onPress={goBack}
          >
            <Image
              source={require("../../../../constants/icons/arrow-left.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
            <Text className="text-white text-lg ml-1 font-semibold">Create Template</Text>
          </TouchableOpacity>
        }
        rightHeader={
          <TouchableOpacity onPress={() => saveFunc()}>
            <Text className="text-cyan-600 font-semibold text-base mr-2">Save</Text>
          </TouchableOpacity>
        }
      />
      <View className="w-11/12 bg-card-bg rounded-lg mt-2 px-4">
        <View className="my-4 flex-row items-center">
          <Image
            source={require("../../../../constants/icons/hour-glass-blue.png")}
            resizeMode="contain"
            style={{
              width: 24,
              height: 24,
            }}
          />
          <Text className="text-white text-lg ml-1">
            Template
          </Text>
        </View>
        <View
        className={isTemplateNameValid ? null : "border-2 border-rose-500 rounded-lg"}
        >
          <TextInput
            label={"Template Name"}
            mode="flat"
            textColor="white"
            activeUnderlineColor={"#07B6D5"}
            className="bg-gray-900 rounded-lg"
            value={templateName}
            onChangeText={(text) => dispatch(updateTemplateName(text))}
            onFocus={() => setTemplateNameValid(true)}
          />
        </View>
        <IntervalTimerDurations isRoundsValid={isRoundsValid} setIsRoundsValid={setRoundsValid} />
        <View className="items-center">
        </View>
      </View>
    </View>
  );
};

export default CreateIntervalTimer;
