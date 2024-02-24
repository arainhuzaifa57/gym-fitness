import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteSelectedTemplate,
  fetchUserIntervalTemplates,
} from "../../../../api/features/tools/intervalTemplatesSlice";
import {
  replaceTemplateState,
  updateDocId,
} from "../../../../api/features/tools/intervalTimerSlice";
import { goBack, navigate } from "../../../../navigation/rootNavigation";
import { routes } from "../../../../constants/routes";
import { Interstitial } from "react-native-ad-manager";
import { AdsID } from "../../../../constants/Keys";
import { Header } from "../../../../components/Header";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { getTemplatesCount } from "../../../../api/firebase/db";
import { useFocusEffect } from "@react-navigation/native";

const SelectIntervalWorkout = () => {
  const dispatch = useDispatch();
  const intervalTemplates = useSelector((state) => state.intervalTemplates);
  const isLoading = useSelector((state) => state.intervalTemplates.isLoading);
  const error = useSelector((state) => state.intervalTemplates.error);
  const { userData } = useSelector((state) => state?.userData);

  const [hasCreatedTemplates, setCreatedTemplates] = useState(false);
  const [totalTemplates, setTotalTemplates] = useState(0);

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
    dispatch(fetchUserIntervalTemplates());
    const listener = Interstitial.addEventListener("adClosed", () => {
      StatusBar.setHidden(false);
    });
    return () => {
      listener.remove();
      StatusBar.setHidden(false);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      getTemplate();
    }, [])
  );
  const getTemplate = async () => {
    let count = await getTemplatesCount(userData?.id);
    // console.log("Length>>", count?.length);
    setTotalTemplates(count?.length);
  };

  // useEffect(() => {
  //   const uid = auth().currentUser.uid;
  //   const userCreatedIntervalTemplateRef = firestore().collection('users').doc(uid).collection('userCreatedIntervalTemplate');

  //   const unsubscribe = userCreatedIntervalTemplateRef.onSnapshot(snapshot => {
  //     if (snapshot.empty) {
  //       // Update state if there are no documents
  //       setCreatedTemplates(false);
  //     } else {
  //       // Update state if there are documents
  //       console.log('there are user created templates')
  //       setCreatedTemplates(true);
  //       // ... existing logic for handling documents
  //     }
  //   });

  //   // Clean up the listener when the component unmounts
  //   return () => unsubscribe();
  // }, []);

  // useEffect(() => {
  //   const uid = auth().currentUser.uid;
  //   const userCreatedIntervalTemplateRef = firestore().collection('users').doc(uid).collection('userCreatedIntervalTemplate');

  //   const unsubscribe = userCreatedIntervalTemplateRef.onSnapshot(snapshot => {
  //     if (snapshot.empty) {
  //       // Update state if there are no documents
  //       setCreatedTemplates(false);
  //     } else {
  //       // Update state if there are documents
  //       console.log('there are user created templates')
  //       setCreatedTemplates(true);
  //       // ... existing logic for handling documents
  //     }
  //   });

  //   // Clean up the listener when the component unmounts
  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    const uid = auth().currentUser.uid;
    const userCreatedIntervalTemplateRef = firestore()
      .collection("users")
      .doc(uid)
      .collection("userCreatedIntervalTemplate");

    const unsubscribe = userCreatedIntervalTemplateRef.onSnapshot(
      (snapshot) => {
        if (snapshot.empty) {
          // Update state if there are no documents
          setCreatedTemplates(false);
        } else {
          // Map snapshot documents to an array of objects
          const templates = snapshot.docs.map((doc) => ({
            id: doc.id,
            template: doc.data(),
          }));

          // Update state with the current collection data
          setCreatedTemplates(templates);
        }
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const goToSelectedTemplate = (item) => {
    dispatch(replaceTemplateState(item));
    navigate(routes.selectedIntervalTemplate);
  };

  const deleteTemplate = ({ item, index }) => {
    dispatch(deleteSelectedTemplate({ item, index }));
  };

  const Item = ({ item, index }) => (
    <View className="flex-row items-center mx-2 my-1">
      <TouchableOpacity
        onPress={() => deleteTemplate({ item, index })}
        className="bg-icon-bg py-2 px-2 rounded-full"
      >
        <Image
          source={require("../../../../constants/icons/trash.png")}
          style={{
            width: 24,
            height: 24,
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-900 py-3 rounded-lg flex-grow mx-2"
        onPress={() => goToSelectedTemplate(item)}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-white ml-6">{item.template?.templateName}</Text>
          <Image
            source={require("../../../../constants/icons/arrow-right.png")}
            resizeMode="contain"
            className="mr-6"
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
    return <Item item={item} index={index} />;
  };

  // if (isLoading) {
  //   return <LoadingIndicator />;
  // }

  // if (error) {
  //   return <Text>{error}</Text>;
  // }

  if (hasCreatedTemplates.length === 0) {
    <Text>No templates saved. Create a template by clicking above!</Text>;
  }

  return (
    <View className="bg-gray-900 flex-1 items-center">
      <StatusBar barStyle={"light-content"} />
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
            <Text className="text-white text-lg ml-1 font-semibold">
              Interval Timer
            </Text>
          </TouchableOpacity>
        }
        rightHeader={
          <TouchableOpacity
            onPress={() => {
              // if (!userData?.userData?.subscriptionData?.subscriptionId) {
              //   if (totalTemplates < 3) {
              //     navigate(routes.createIntervalTimer);
              //   } else {
              //     Alert.alert(
              //       "Subscribe",
              //       "Please subscribe to create more templates",
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
              navigate(routes.createIntervalTimer);
            }}
          >
            <Text className="text-cyan-600 font-semibold text-base">
              Create Template
            </Text>
          </TouchableOpacity>
        }
      />
      {hasCreatedTemplates ? (
        <View className="w-11/12">
          <View className="bg-card-bg mt-2 rounded-lg">
            <View className="items-center flex-row mt-4 ml-4">
              <Image
                source={require("../../../../constants/icons/hour-glass-blue.png")}
                resizeMode="contain"
                style={{
                  width: 24,
                  height: 24,
                }}
              />
              <Text className="text-white text-lg ml-1">Templates</Text>
            </View>
            <View className="">
              <View className="mb-4 mt-4">
                <FlatList
                  data={hasCreatedTemplates}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View className="items-center mt-4">
          <Text className="text-white text-base">
            No interval template created.
          </Text>
        </View>
      )}
    </View>
  );
};

export default SelectIntervalWorkout;
