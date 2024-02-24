import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUserData,
  saveAllUsers,
} from "../../../api/features/user/userDataSlice";
import WorkoutCalendar from "../../../components/calender/workoutCalender";
import QuotesComponent from "../../../components/quotes/quotesComponent";
import ToolsBar from "../../../components/tools/toolsBar";
import LoadingIndicator from "../../../components/loadingIndicator";
import { navigate } from "../../../navigation/rootNavigation";
import { collections, routes } from "../../../constants/routes";
import { NotificationHandler, getNotifyToken } from "../../../../Notification";
import { updateDocument, getAllUser } from "../../../api/firebase/db";
import { height, width, totalSize } from "react-native-dimension";
import SettingOptionModal from "../../../components/SettingOptions";
import { Header } from "../../../components/Header";

export default function Home({ navigation }) {
  const { userData } = useSelector((state) => state?.userData);
  const isLoading = useSelector((state) => state.userData.isLoading);
  const error = useSelector((state) => state.userData.error);
  const dispatch = useDispatch();

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    StatusBar.setHidden(false);
    async function fetchData() {
      dispatch(fetchUserData());
      let users = await getAllUser(userData?.id);
      if (users?.length > 0) {
        // console.log(users?.length);
        dispatch(saveAllUsers(users));
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function getFCMToken() {
      let token = await getNotifyToken();
      console.log("FCM Token", token);
      let data = {
        ...userData?.userData,
        fcmToken: token,
      };
      await updateDocument(collections.users, userData?.id, data).then(() => {
        console.log("Update FCMToken Successfully!!");
      });
    }
    if (userData !== null) {
      getFCMToken();
    }
  }, [userData]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View className="flex-1 bg-gray-900">
      <NotificationHandler />
      <Header
        onBack={false}
        leftHeader={
          <Text className="text-4xl flex-2 font-ibmRegular text-white">
            F I T G R E S S
          </Text>
        }
        rightHeader={
          <TouchableOpacity
            style={{
              backgroundColor: "#182130",
              height: totalSize(4),
              width: totalSize(4),
              justifyContent: "center",
              alignItems: "center",
              borderRadius: totalSize(2),
              // marginRight: totalSize(2),
            }}
            onPress={() => navigate(routes.settings)}
          >
            <Image
              source={require("../../../constants/icons/setting.png")}
              style={{
                width: totalSize(2.4),
                height: totalSize(2.4),
              }}
            />
          </TouchableOpacity>
        }
        containerStyle={{ paddingHorizontal: width(4) }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-2">
          <View className="flex-row items-center ml-4">
            <Image
              source={require("../../../constants/icons/exp-white.png")}
              resizeMode="contain"
              style={{
                height: 20,
                width: 20,
              }}
            />
            <Text className="text-white text-lg ml-1">Motivation</Text>
          </View>
          <QuotesComponent />
        </View>
        <View className="">
          <View className="flex-row items-center ml-4 mb-2">
            <Image
              source={require("../../../constants/icons/box.png")}
              resizeMode="contain"
              style={{
                height: 20,
                width: 20,
              }}
            />
            <Text className="text-white text-lg ml-1">Tools</Text>
          </View>
          <View className="items-center">
            <ToolsBar
              weightPress={() => navigate(routes.weightTracker)}
              macroCalculatorPress={() => navigate(routes.macroCalculator)}
            />
          </View>
        </View>
        <View className="items-center bg-card-bg rounded-2xl mx-4 w-11/12 mt-4">
          <WorkoutCalendar />
        </View>
        <View className="p-6" />
      </ScrollView>
      <TouchableOpacity
        className="bg-gray-900 border-2 border-cyan-600 w-28 h-10 rounded-2xl flex justify-center items-center"
        onPress={() => navigate(routes.selectWorkoutPage)}
        style={{ position: "absolute", bottom: height(2), right: width(3) }}
      >
        <View className="flex-row items-center">
          <Image
            source={require("../../../constants/icons/edit-2-white.png")}
            resizeMode="contain"
            style={{
              width: 20,
              height: 20,
            }}
          />
          <Text className="text-white ml-1">Workout</Text>
        </View>
      </TouchableOpacity>
      {showSettings && (
        <SettingOptionModal onClose={() => setShowSettings(!showSettings)} />
      )}
    </View>
  );
}
