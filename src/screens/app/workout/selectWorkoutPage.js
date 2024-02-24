import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import WorkoutProgramCard from "../../../components/workout/workoutProgramCard";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUserCurrentprogram,
  resetCurrentProgram,
} from "../../../api/features/workout/currentProgramSlice";
import {
  editWorkout,
  setExercisesToTemplate,
  updateWorkoutDay,
} from "../../../api/features/workout/workoutSlice";
import LoadingIndicator from "../../../components/loadingIndicator";
import { navigate } from "../../../navigation/rootNavigation";
import { routes } from "../../../constants/routes";
import { Interstitial } from "react-native-ad-manager";
import { AdsID } from "../../../constants/Keys";
import { Header } from "../../../components/Header";
import { goBack } from "../../../navigation/rootNavigation";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { getWorkoutProgramCount } from "../../../api/firebase/db";
import { setExercisesTemplate } from "../../../api/features/workout/workoutTemplate";

const SelectWorkoutPage = ({ navigation }) => {
  const currentProgram = useSelector((state) => state.currentProgram);
  const currentProgramId = useSelector(
    (state) => state.userData.currentProgram
  );
  const isLoading = useSelector((state) => state.currentProgram.isLoading);
  const error = useSelector((state) => state.currentProgram.error);
  const { userData } = useSelector((state) => state?.userData);

  const [totalPrograms, setTotalPrograms] = useState(0);

  const [hasCreatedPrograms, setHasCreatedPrograms] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    // if (!userData?.userData?.subscriptionData?.subscriptionId) {
    // }
    // For Ads
    Interstitial.setAdUnitID(AdsID);
    Interstitial.setTestDevices([Interstitial.simulatorId]);
    Interstitial.requestAd().then(() => {
      Interstitial.showAd();
      StatusBar.setHidden(true);
    });
    const listener = Interstitial.addEventListener("adClosed", () => {
      StatusBar.setHidden(false);
    });
    getWorkoutCount();
    return () => {
      listener.remove();
      StatusBar.setHidden(false);
    };
  }, []);

  const getWorkoutCount = async () => {
    let count = await getWorkoutProgramCount(userData?.id);
    // console.log("Length>>", count?.length);
    setTotalPrograms(count?.length);
  };

  useEffect(() => {
    console.log("Rendered!");
    if (currentProgramId && currentProgramId !== 0) {
      console.log("fetch program!");
      dispatch(fetchUserCurrentprogram(currentProgramId));
    }
  }, [currentProgramId]);

  useEffect(() => {
    const uid = auth().currentUser.uid;
    const workoutsCollectionRef = firestore()
      .collection("users")
      .doc(uid)
      .collection("userCreatedPrograms");

    const unsubscribe = workoutsCollectionRef.onSnapshot((snapshot) => {
      if (snapshot.empty) {
        // Update state if there are no documents
        setHasCreatedPrograms(false);
      } else {
        // Update state if there are documents
        setHasCreatedPrograms(true);
        // ... existing logic for handling documents
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const workoutDayButton = (item) => {
    console.log(item);
    dispatch(updateWorkoutDay(item.workoutDay));
    dispatch(setExercisesToTemplate(item.exercises));
    dispatch(setExercisesTemplate(item.exercises));
    navigate(routes.recordWorkout);
  };

  // const goBackPress = () => {
  //   dispatch(resetCurrentProgram())
  //   goBack()
  // }

  // if (isLoading) {
  //   return <LoadingIndicator />;
  // }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#111828",
        alignItems: "center",
      }}
    >
      <StatusBar barStyle={"light-content"} />
      <Header
        containerStyle={{ marginTop: 0 }}
        onBack={false}
        leftHeader={
          <TouchableOpacity
            className="flex-row items-center ml-2"
            onPress={goBack}
          >
            <Image
              source={require("../../../constants/icons/arrow-left.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
            <Text className="text-white text-lg ml-1 font-semibold">
              Workout Program
            </Text>
          </TouchableOpacity>
        }
        rightHeader={
          <TouchableOpacity
            onPress={() => {
              // if (!userData?.userData?.subscriptionData?.subscriptionId) {
              //   if (totalPrograms < 2) {
              //     navigate(routes.createWorkoutProgram);
              //   } else {
              //     Alert.alert(
              //       "Subscribe",
              //       "Please subscribe to create more programs",
              //       [
              //         { text: "Cancel", onPress: () => console.log("") },
              //         {
              //           text: "Subscribe",
              //           onPress: () => navigate(routes.settings),
              //         },
              //       ]
              //     );
              //   }
              // } else {

              // }
              navigate(routes.createWorkoutProgram);
            }}
          >
            <Text className="text-primary font-semibold text-base">
              Create Program
            </Text>
          </TouchableOpacity>
        }
      />
      {currentProgramId && hasCreatedPrograms ? (
        <WorkoutProgramCard
          workoutProgram={currentProgram}
          workoutDayFunc={workoutDayButton}
        />
      ) : (
        <Text className="text-white mt-6">No workout program created.</Text>
      )}
    </SafeAreaView>
  );
};

export default SelectWorkoutPage;
