import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import IntervalTimerDurations from "../../../../components/tools/intervalTimerDurations";
import { useDispatch, useSelector } from "react-redux";
import {
  resetTemplate,
  updateTemplateName,
} from "../../../../api/features/tools/intervalTimerSlice";
import InputErrorComponent from "../../../../components/general/inputErrorComponent";
import { goBack, navigate } from "../../../../navigation/rootNavigation";
import { routes } from "../../../../constants/routes";
import { Header } from "../../../../components/Header";
import { updateIntervalTemplate, updateTemplateInUserCollection } from "../../../../api/features/tools/intervalTemplatesSlice";

const SelectedIntervalTemplate = ({ navigation }) => {
  const dispatch = useDispatch();
  const templateName = useSelector((state) => state.intervalTimer.template.templateName);
  const template = useSelector((state) => state.intervalTimer);
  const rounds = useSelector((state) => state.intervalTimer.template.rounds);
  const [isTemplateNameValid, setTemplateNameValid] = useState(true);
  const [isRoundsValid, setRoundsValid] = useState(true);


  const startTimer = () => {
    if (validateForm()) {
      navigate(routes.useIntervalTimerPage);
    } else {
    }
  };

  const saveFunc = ({ documentId, data }) => {

    if (validateForm()) {
      console.log('trying to save fun ' + documentId)
      dispatch(updateTemplateInUserCollection({ templateId: documentId, updatedTemplateData: data }));
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

  const resetTemplateAndGoBack = () => {
    dispatch(resetTemplate());
    goBack();
  };

  return (
    <View className="bg-gray-900 flex-1 items-center">
      <Header
        onBack={false}
        leftHeader={
          <TouchableOpacity
            className="flex-row items-center ml-2"
            onPress={resetTemplateAndGoBack}
          >
            <Image
              source={require("../../../../constants/icons/arrow-left.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
            <Text className="text-white text-lg ml-1 font-semibold">Interval Template</Text>
          </TouchableOpacity>
        }
        rightHeader={
          <TouchableOpacity onPress={() => saveFunc({ documentId: template.id, data: template.template })}>
            <Text className="text-cyan-600 font-semibold text-base mr-2">Save</Text>
          </TouchableOpacity>
        }
      />

      <View className="w-11/12 bg-card-bg px-4 rounded-xl mt-2">
        <View className="">
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
              Template Name
            </Text>
          </View>
          <TextInput
            className="bg-gray-900 py-3 rounded px-4 text-white"
            placeholderTextColor={"gray"}
            placeholder="Enter template name"
            value={templateName}
            onChangeText={(text) => dispatch(updateTemplateName(text))}
            onFocus={() => setTemplateNameValid(true)}
          />
        </View>
        <IntervalTimerDurations isRoundsValid={isRoundsValid} setIsRoundsValid={setRoundsValid} />
        <View className="items-center mb-4">
          <TouchableOpacity
            className="items-center border-2 border-cyan-600 bg-gray-900 w-1/3 h-10 rounded-xl justify-center"
            onPress={() => startTimer()}
          >
            <Text className="text-white">Start</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

export default SelectedIntervalTemplate;
