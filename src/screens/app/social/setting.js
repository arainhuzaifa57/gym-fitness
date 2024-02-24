import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { goBack, navigate } from "../../../navigation/rootNavigation";
import { Header } from "../../../components/Header";
import { width, height, totalSize } from "react-native-dimension";
import { useSelector, useDispatch } from "react-redux";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { appImages } from "../../../constants/images";
import {
  fetchUserData,
  clearUserStats,
} from "../../../api/features/user/userDataSlice";
import { collections } from "../../../constants/routes";
import { Switch, TextInput } from "react-native-paper";
import { routes, endPoints } from "../../../constants/routes";
import OctIcon from "react-native-vector-icons/Octicons";
import Entypo from "react-native-vector-icons/Entypo";
import auth from "@react-native-firebase/auth";
import {
  updateDocument,
  uploadFile,
  checkUniqueName,
  deleteAccount,
} from "../../../api/firebase/db";
import firestore from "@react-native-firebase/firestore";
import ImageOptionsModal from "../../../components/ImageOptions";
import ForgotPassword from "../../../components/ForgotPassword/ForgotPassword";
import ImagePicker from "react-native-image-crop-picker";
import moment from "moment";
import APIServiceManager from "../../../constants/API";
import { yearSubscription, monthlySubscription } from "../../../constants/Keys";

const API = new APIServiceManager();
const Setting = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state?.userData);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("year");
  const [profileLoading, setProfileLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [email, setEmail] = useState("");
  const [userDetail, setUserDetail] = useState({
    userName: "",
    fullName: "",
    bio: "",
    profile: "",
  });
  const [imagePicker, setImagePicker] = useState(false);
  const [isError, setError] = useState("");
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] =
    useState(null);
  const [updateSubscription, setUpdateSubscription] = useState(false);
  const [updateSubscriptionLoading, setUpdateSubscriptionLoading] =
    useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setUserDetail({
      userName: userData?.userData?.name,
      fullName: userData?.userData?.fullName,
      bio: userData?.userData?.bio ?? "",
      profile: userData?.userData?.profilePic,
    });
    setIsSwitchOn(userData?.userData?.profileType == "private" ? true : false);
    console.log(userData?.userData?.subscriptionData);
    if (userData?.userData?.subscriptionData?.plan) {
      setSelectedSubscriptionPlan(userData?.userData?.subscriptionData);
      setSelectedPlan(userData?.userData?.subscriptionData?.plan);
    }
  }, [userData]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setEmail("");
  };

  const Continue = async () => {
    await auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert("Alert!", "Password reset email send to your given mail");
        toggleModal();
      })
      .catch((err) => Alert.alert(err));
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.openPicker({
      mediaType: "photo",
      cropping: true,
      height: height(50),
      width: width(100),
      compressImageQuality: 0.6,
      cropperCircleOverlay: true,
    });
    //console.log(result?.assets[0]);
    let data = {
      name: result?.filename,
      url:
        Platform.OS === "android"
          ? result.path
          : result.path.replace("file://", ""),
      type: result?.mime,
    };
    // console.log("File>>", data);
    setProfileImageFile(data);
  };

  const handleCameraImage = async () => {
    const result = await ImagePicker.openCamera({
      mediaType: "photo",
      useFrontCamera: true,
      cropping: true,
      height: height(50),
      width: width(100),
      compressImageQuality: 0.6,
      cropperCircleOverlay: true,
    });
    //console.log(result?.assets[0]);
    let data = {
      name: result?.filename,
      url:
        Platform.OS === "android"
          ? result.path
          : result.path.replace("file://", ""),
      type: result?.mime,
    };
    // console.log("File>>", data);
    setProfileImageFile(data);
  };

  const updateProfile = async () => {
    if (userDetail?.userName?.length > 0) {
      if (userDetail?.userName !== userData?.userData?.name) {
        if ((await checkUniqueName(userDetail?.userName)) == true) {
          setError("User already exists!");
          return;
        }
      }
      setProfileLoading(true);
      if (profileImageFile) {
        await uploadFile(profileImageFile)
          .then(async (url) => {
            let data = {
              ...userData?.userData,
              bio: userDetail.bio,
              profilePic: url,
              fullName: userDetail.fullName,
              name: userDetail?.userName,
            };
            await updateDocument(collections.users, userData?.id, data)
              .then(() => {
                masUpdatePosts(data);
                dispatch(fetchUserData());
              })
              .catch((err) => {
                Alert.alert(err);
              });
          })
          .catch((err) => {
            Alert.alert(err);
          });
      } else {
        let data = {
          ...userData?.userData,
          bio: userDetail.bio,
          profilePic: userDetail?.profile,
          fullName: userDetail.fullName,
          name: userDetail?.userName,
        };
        // console.log("User Data>>", data);
        await updateDocument(collections.users, userData?.id, data)
          .then(() => {
            masUpdatePosts(data);
            dispatch(fetchUserData());
          })
          .catch((err) => {
            Alert.alert(err);
          });
      }
      setProfileLoading(false);
    } else {
      setError("Please enter a username!");
    }
  };

  async function masUpdatePosts(data) {
    // Get all users
    const postsQuerySnapshot = await firestore()
      .collection(collections.userPosts)
      .where("user.userID", "==", userData?.id)
      .get();

    // Create a new batch instance
    const batch = firestore().batch();

    postsQuerySnapshot.forEach((documentSnapshot) => {
      batch.update(documentSnapshot.ref, {
        ...documentSnapshot.data(),
        user: {
          fullName: data?.fullName,
          userName: data?.name,
          profilePic: data?.profilePic,
          userID: userData?.id,
        },
      });
    });

    return batch.commit();
  }

  const handleProfilePrivacy = async (value) => {
    setIsSwitchOn(value);
    let data = {
      ...userData?.userData,
      profileType: value ? "private" : "public",
    };
    // console.log("User Data>>", data);
    await updateDocument(collections.users, userData?.id, data)
      .then(() => {
        dispatch(fetchUserData());
        console.log("Profile Successfully updated!");
      })
      .catch((err) => {
        setIsSwitchOn(!isSwitchOn);
        Alert.alert("", err);
      });
  };

  const handleSignOut = () => {
    setSelectedTab(2);
    Alert.alert("Sign Out", "Do you want to exit?", [
      {
        text: "Yes",
        onPress: () => {
          auth()
            .signOut()
            .then(() => {
              console.log("User signed out!");
            });
          dispatch(clearUserStats());
        },
      },
      { text: "No", onPress: () => setSelectedTab(0) },
    ]);
  };

  const cancelSubscription = async () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      subscriptionId: userData?.userData?.subscriptionData?.subscriptionId,
    });

    var requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://fitgress-backend.vercel.app/cancel-subscription",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        // console.log(result);
        removeDataonFirebase({
          customerID: userData?.userData?.subscriptionData?.customerID,
          paymentMethod: userData?.userData?.subscriptionData?.paymentMethod,
        });
      })
      .catch((error) => console.log("Cancel Subscription error", error));
  };

  const removeDataonFirebase = async (obj) => {
    await updateDocument(collections.users, userData?.id, {
      ...userData?.userData,
      subscriptionData: obj,
    }).then(() => {
      setUpdateSubscription(false);
      setSelectedSubscriptionPlan(null);
      dispatch(fetchUserData());
    });
  };

  const updateSubscriptionPlan = async () => {
    setUpdateSubscriptionLoading(true);
    let subscribeData = {
      subscriptionId: userData?.userData?.subscriptionData?.subscriptionId,
      priceId: selectedPlan == "year" ? yearSubscription : monthlySubscription,
    };

    console.log("Update>>", subscribeData);
    await API.request(
      "post",
      endPoints.updateSubscription,
      JSON.stringify(subscribeData)
    )
      .then((res) => {
        let response = res?.data;
        removeDataonFirebase({
          subscriptionId: response?.id,
          customerID: userData?.userData?.subscriptionData?.customerID,
          paymentMethod: userData?.userData?.subscriptionData?.paymentMethod,
          plan: selectedPlan,
          subscribedAt: moment().valueOf(),
        });
      })
      .catch((err) => {
        console.log("Update Subscribe Error>>", err);
      });
    setUpdateSubscriptionLoading(false);
  };

  const createSubscription = async (customerID) => {
    setUpdateSubscriptionLoading(true);
    let subscribeData = {
      customerId: customerID,
      priceId: selectedPlan == "year" ? yearSubscription : monthlySubscription,
    };
    await API.request(
      "post",
      endPoints.createSubscription,
      JSON.stringify(subscribeData)
    )
      .then((res) => {
        let response = res?.data;
        removeDataonFirebase({
          ...response,
          customerID: customerID,
          paymentMethod: userData?.userData?.subscriptionData?.paymentMethod,
          plan: selectedPlan,
          subscribedAt: moment().valueOf(),
        });
      })
      .catch((err) => {
        console.log("Create Subscribe Error>>", err);
        setUpdateSubscriptionLoading(false);
      });
    setUpdateSubscriptionLoading(false);
  };

  return (
    <View className="flex-1 bg-gray-900">
      <Header
        onBack={false}
        leftHeader={
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={goBack}
          >
            <Image
              source={require("../../../constants/icons/arrow-left.png")}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
              }}
            />
            <Text style={styles.heading}>Settings</Text>
          </TouchableOpacity>
        }
        containerStyle={{ marginBottom: height(0) }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        keyboardVerticalOffset={40}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: width(5), marginBottom: height(10) }}
          // contentContainerStyle={{ marginBottom: height(10) }}
        >
          <View style={styles.topTabs}>
            <TouchableOpacity
              style={{
                ...styles.tabBtn,
                backgroundColor: selectedTab == 0 ? "#0891b2" : "transparent",
              }}
              onPress={() => setSelectedTab(0)}
            >
              <Text
                style={{
                  ...styles.tabBtnTxt,
                  color: selectedTab == 0 ? "#fff" : "#5B5E66",
                  fontWeight: selectedTab == 0 ? "700" : "500",
                }}
              >
                Profile
              </Text>
            </TouchableOpacity>
            <View style={styles.line} />
            {/* <TouchableOpacity
              style={{
                ...styles.tabBtn,
                backgroundColor: selectedTab == 1 ? "#0891b2" : "transparent",
              }}
              onPress={() => setSelectedTab(1)}
            >
              <Text
                style={{
                  ...styles.tabBtnTxt,
                  color: selectedTab == 1 ? "#fff" : "#5B5E66",
                  fontWeight: selectedTab == 1 ? "700" : "500",
                }}
              >
                Subscription
              </Text>
            </TouchableOpacity>
            <View style={styles.line} /> */}
            <TouchableOpacity
              style={{
                ...styles.tabBtn,
                backgroundColor: selectedTab == 2 ? "#0891b2" : "transparent",
              }}
              onPress={handleSignOut}
            >
              <Text
                style={{
                  ...styles.tabBtnTxt,
                  color: selectedTab == 2 ? "#fff" : "#5B5E66",
                  fontWeight: selectedTab == 2 ? "700" : "500",
                }}
              >
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: height(4),
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <UserAvatar
                  size={totalSize(11)}
                  src={
                    profileImageFile
                      ? profileImageFile?.url
                      : userDetail?.profile !== ""
                      ? userDetail?.profile
                      : appImages.dummyUrl
                  }
                />
                <Pressable
                  style={styles.cameraBtn}
                  onPress={() => setImagePicker(true)}
                >
                  <Entypo name="camera" size={totalSize(1.5)} color={"#fff"} />
                </Pressable>
              </View>
              <View style={{}}>
                <View
                  style={{
                    borderRadius: totalSize(1),
                    height: height(7),
                    overflow: "hidden",
                    width: width(60),
                  }}
                >
                  <TextInput
                    mode="flat"
                    label="User Name"
                    style={{
                      height: height(7),
                      overflow: "hidden",
                      backgroundColor: "#182130",
                    }}
                    activeUnderlineColor={"#07B6D5"}
                    textColor={"white"}
                    value={userDetail.userName}
                    onChangeText={(inputText) => {
                      // setUserDetail((prevState) => ({
                      //   ...prevState,
                      //   userName: text?.trim(),
                      // }));
                      if (inputText.includes(" ")) {
                        // Remove the space character from the input
                        const updatedText = inputText.replace(/\s/g, "");
                        // setUserName(updatedText);
                        setUserDetail((prevState) => ({
                          ...prevState,
                          userName: updatedText?.trim(),
                        }));
                      } else {
                        // setUserName(inputText);
                        setUserDetail((prevState) => ({
                          ...prevState,
                          userName: inputText,
                        }));
                      }
                    }}
                    onChange={() => setError("")}
                    error={isError.length > 0 ? true : false}
                    onEndEditing={async () => {
                      if (userDetail?.userName?.length > 0) {
                        if (userDetail.userName !== userData?.userData?.name) {
                          if (
                            (await checkUniqueName(userDetail?.userName)) ==
                            true
                          ) {
                            setError("Please enter a unique name!");
                          }
                        }
                      } else {
                        setError("Please enter a user name");
                      }
                    }}
                  />
                </View>
                {isError && (
                  <Text
                    style={{
                      fontSize: totalSize(1.3),
                      color: "#f43f5e",
                      width: width(60),
                    }}
                  >
                    {isError}
                  </Text>
                )}
              </View>
            </View>
            <View
              style={{
                borderRadius: totalSize(1),
                height: height(7),
                overflow: "hidden",
                marginBottom: 20,
                flex: 1,
              }}
            >
              <TextInput
                mode="flat"
                label="Full Name"
                style={{
                  height: height(7),
                  overflow: "hidden",
                  backgroundColor: "#182130",
                }}
                activeUnderlineColor={"#07B6D5"}
                textColor={"white"}
                value={userDetail.fullName}
                onChangeText={(text) => {
                  setUserDetail((prevState) => ({
                    ...prevState,
                    fullName: text,
                  }));
                }}
              />
            </View>
            <View
              style={{
                borderRadius: totalSize(1),
                height: height(10),
                overflow: "hidden",
                flex: 1,
              }}
            >
              <TextInput
                mode="flat"
                label="Bio"
                style={{
                  height: height(10),
                  overflow: "hidden",
                  backgroundColor: "#182130",
                  textAlignVertical: "top",
                  paddingBottom: 10,
                }}
                activeUnderlineColor={"#07B6D5"}
                textColor={"white"}
                multiline={true}
                value={userDetail.bio}
                onChangeText={(text) => {
                  setUserDetail((prevState) => ({
                    ...prevState,
                    bio: text,
                  }));
                }}
              />
            </View>
            <View style={styles.profileView}>
              <Text style={styles.heading1}>Account Privacy</Text>
              <Switch
                value={isSwitchOn}
                onValueChange={(val) => handleProfilePrivacy(val)}
                color="#0891b2"
              />
            </View>
            <Text style={styles.desc}>
              When your account is public, your profile and posts can be seen by
              anyone.
            </Text>
            <Text style={styles.desc}>
              When your account is private, only the followers that you approve
              can see your profile and posts.
            </Text>
            <View style={{ marginBottom: 20, marginHorizontal: width(5) }}>
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => updateProfile()}
              >
                {profileLoading ? (
                  <ActivityIndicator color={"#f9fafb"} size={"small"} />
                ) : (
                  <Text
                    className="text-center text-gray-700 font-ibmMedium text-xl"
                    style={{ color: "white", fontWeight: "600" }}
                  >
                    Update Profile
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={toggleModal}
            >
              <Text
                style={{ color: "#0891b2", fontSize: 18, fontWeight: "600" }}
              >
                {" "}
                Update Password
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                Alert.alert(
                  "Delete Account",
                  "Are you sure? You want to delete your account.",
                  [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Cancel Delete Account!"),
                    },
                    {
                      text: "Confirm",
                      // style: "destructive",
                      onPress: async () => {
                        setDeleteLoading(true);
                        let result = await deleteAccount(userData?.id);
                        console.log("Final Result>>>", result);
                        if (result) {
                          auth()
                            .currentUser.delete()
                            .then(() => {
                              setDeleteLoading(false);
                              dispatch(clearUserStats());
                            });
                        }
                      },
                    },
                  ]
                );
              }}
            >
              {deleteLoading ? (
                <ActivityIndicator color={"#f9fafb"} size={"small"} />
              ) : (
                <Text
                  className="text-center text-gray-700 font-ibmMedium text-xl"
                  style={{ color: "white" }}
                >
                  Delete Account
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {/* {selectedTab == 1 && (
            <View>
              {selectedSubscriptionPlan == null || updateSubscription ? (
                <View>
                  <Image
                    source={require("../../../constants/icons/Illustration.png")}
                    style={styles.img}
                  />
                  <Text style={styles.heading2}>Go Premium</Text>
                  <Text style={styles.description}>
                    Train without distraction to become the Best Version of you
                  </Text>
                  <View style={{ ...styles.rowBasic, marginTop: height(2) }}>
                    <OctIcon name="check" size={totalSize(2)} color="#0891b2" />
                    <Text style={styles.pointTxt}>No Ads</Text>
                  </View>
                  <View style={{ ...styles.rowBasic, marginTop: height(1) }}>
                    <OctIcon name="check" size={totalSize(2)} color="#0891b2" />
                    <Text style={styles.pointTxt}>
                      Unlimited Workout Programs
                    </Text>
                  </View>
                  <View
                    style={{
                      ...styles.card,
                      borderColor:
                        selectedPlan == "year" ? "#0891b2" : "#182130",
                    }}
                  >
                    <View style={styles.rowBasic}>
                      <Pressable onPress={() => setSelectedPlan("year")}>
                        <Image
                          source={
                            selectedPlan == "year"
                              ? appImages.check
                              : appImages.unCheck
                          }
                          style={styles.icon}
                        />
                      </Pressable>
                      <View style={{ marginLeft: width(3) }}>
                        <Text style={styles.planMainTxt}>Yearly Plan</Text>
                        <Text style={styles.planmonthTxt}>$6.49 / mon</Text>
                        <Text style={styles.planyearTxt}>
                          $77.88 / year. Billed Yearly
                        </Text>
                      </View>
                    </View>
                    {selectedPlan == "year" && (
                      <View style={styles.label}>
                        <Text style={styles.labelTxt}>1-Week Free</Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      ...styles.card,
                      borderColor:
                        selectedPlan == "month" ? "#0891b2" : "#182130",
                    }}
                  >
                    <View style={styles.rowBasic}>
                      <Pressable onPress={() => setSelectedPlan("month")}>
                        <Image
                          source={
                            selectedPlan == "month"
                              ? appImages.check
                              : appImages.unCheck
                          }
                          style={styles.icon}
                        />
                      </Pressable>
                      <View style={{ marginLeft: width(3) }}>
                        <Text style={styles.planMainTxt}>Monthly Plan</Text>
                        <Text style={styles.planmonthTxt}>$9.99 / mon</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() => {
                      if (
                        userData?.userData?.subscriptionData?.subscriptionId
                      ) {
                        updateSubscriptionPlan();
                      } else if (
                        userData?.userData?.subscriptionData?.customerID
                      ) {
                        createSubscription(
                          userData?.userData?.subscriptionData?.customerID
                        );
                      } else {
                        navigate(routes.paymentDetails, { plan: selectedPlan });
                      }
                    }}
                  >
                    {updateSubscriptionLoading ? (
                      <ActivityIndicator color={"#f9fafb"} size={"small"} />
                    ) : (
                      <Text
                        className="text-center text-gray-700 font-ibmMedium text-xl"
                        style={{
                          ...styles.btnTxt,
                          fontWeight: userData?.userData?.subscriptionData
                            ?.subscriptionId
                            ? "700"
                            : "500",
                        }}
                      >
                        {userData?.userData?.subscriptionData?.subscriptionId
                          ? "Update Subscription"
                          : "Subscribe Now"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.subscribeCard}>
                    <Text style={styles.cardMainHeading}>
                      Your Subscription Plan
                    </Text>
                    <View style={styles.row}>
                      <Text style={styles.cardHeading}>Subscription</Text>
                      <Text style={styles.cardValue}>
                        {selectedSubscriptionPlan?.plan == "year"
                          ? "Year"
                          : "Month"}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.cardHeading}>Price</Text>
                      <Text style={styles.cardValue}>
                        {selectedSubscriptionPlan?.plan == "year"
                          ? "$77.88"
                          : "$9.99"}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.cardHeading}>Next Billing Date</Text>
                      <Text style={styles.cardValue}>
                        {selectedSubscriptionPlan?.plan == "year"
                          ? moment(selectedSubscriptionPlan?.subscribedAt)
                              .add(1, "years")
                              .format("ll")
                          : moment(selectedSubscriptionPlan?.subscribedAt)
                              .add(1, "months")
                              .format("ll")}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginBottom: 20,
                      marginHorizontal: width(5),
                      marginTop: height(30),
                    }}
                  >
                    <TouchableOpacity
                      style={styles.profileBtn}
                      onPress={() => setUpdateSubscription(true)}
                    >
                      <Text
                        className="text-center text-gray-700 font-ibmMedium text-xl"
                        style={{ color: "white", fontWeight: "700" }}
                      >
                        Change Subscription Plan
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={{ alignItems: "center" }}
                    onPress={() => {
                      Alert.alert(
                        "Cancel Subscription",
                        "Are you sure, You want to cancel this subscription?",
                        [
                          { text: "Cancel", onPress: () => console.log("") },
                          {
                            text: "Confirm",
                            onPress: () => cancelSubscription(),
                          },
                        ]
                      );
                    }}
                  >
                    <Text
                      style={{
                        color: "#C72525",
                        fontSize: totalSize(2),
                        fontWeight: "600",
                      }}
                    >
                      Cancel Subscription
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )} */}
        </ScrollView>
      </KeyboardAvoidingView>
      {imagePicker && (
        <ImageOptionsModal
          isVisible={imagePicker}
          onClose={() => setImagePicker(false)}
          onCamera={handleCameraImage}
          onGallery={handleImagePick}
          cameraText={"Add Image"}
          backColor={"#182130"}
          innerColor={"#111828"}
        />
      )}
      <ForgotPassword
        isVisible={isModalVisible}
        toggleModal={toggleModal}
        cont={Continue}
        value={email}
        onChangeText={(text) => setEmail(text)}
        flag={false}
      />
    </View>
  );
};

export default Setting;

const styles = StyleSheet.create({
  heading: {
    paddingLeft: width(2),
    color: "#fff",
    fontSize: totalSize(2),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "500",
  },
  rowBasic: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  displayName: {
    color: "#fff",
    fontFamily: "IBMPlexSans-Regular",
    fontSize: totalSize(2),
    fontWeight: "700",
  },
  userName: {
    color: "#B0B0B0",
    fontFamily: "IBMPlexSans-Regular",
    fontSize: totalSize(1.5),
    fontWeight: "600",
  },
  topTabs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    width: width(90),
    alignSelf: "center",
    marginVertical: height(2),
    borderWidth: 1,
    borderColor: "#5B5E66",
    borderRadius: 10,
    paddingVertical: 2,
  },
  tabBtn: {
    width: width(42),
    paddingVertical: height(1),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  tabBtnTxt: {
    fontFamily: "IBMPlexSans-Regular",
    fontSize: totalSize(1.5),
    fontWeight: "500",
  },
  line: {
    height: height(3),
    width: width(0.5),
    backgroundColor: "#5B5E66",
  },
  profileView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: height(2),
  },
  heading1: {
    color: "#fff",
    fontWeight: "700",
    fontSize: totalSize(2),
  },
  desc: {
    color: "#B0B0B0",
    fontSize: totalSize(1.1),
    fontFamily: "IBMPlexSans-Regular",
    marginTop: height(2),
  },
  heading2: {
    color: "#fff",
    fontWeight: "700",
    fontSize: totalSize(3),
    textAlign: "center",
  },
  description: {
    color: "#B0B0B0",
    fontSize: totalSize(1.5),
    fontFamily: "IBMPlexSans-Regular",
    textAlign: "center",
    marginHorizontal: width(10),
    marginVertical: height(1),
  },
  pointTxt: {
    color: "#fff",
    fontSize: totalSize(1.5),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "600",
    paddingLeft: width(3),
  },
  card: {
    width: width(90),
    paddingHorizontal: width(2),
    borderWidth: 2,
    backgroundColor: "#182130",
    marginTop: height(2),
    borderRadius: totalSize(1),
    height: height(12),
    justifyContent: "center",
  },
  icon: {
    height: totalSize(3),
    width: totalSize(3),
    resizeMode: "contain",
  },
  planMainTxt: {
    color: "#fff",
    fontSize: totalSize(2),
    fontWeight: "700",
  },
  planmonthTxt: {
    color: "#0891b2",
    fontSize: totalSize(2),
    paddingTop: height(0.5),
    fontWeight: "400",
  },
  planyearTxt: {
    color: "#B0B0B0",
    fontSize: totalSize(1.5),
    paddingTop: height(1),
  },
  label: {
    backgroundColor: "#0891b2",
    borderTopRightRadius: totalSize(0.5),
    borderBottomLeftRadius: totalSize(1.5),
    paddingHorizontal: width(5),
    paddingVertical: height(0.5),
    position: "absolute",
    top: 0,
    right: 0,
  },
  labelTxt: {
    color: "#fff",
    fontSize: totalSize(1.5),
    fontWeight: "700",
  },
  btn: {
    backgroundColor: "#0891b2",
    borderRadius: 10,
    paddingVertical: height(1.2),
    width: width(90),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: height(10),
  },
  btnTxt: {
    color: "#fff",
    // fontSize: totalSize(1.8),
    fontWeight: "500",
  },
  cameraBtn: {
    position: "absolute",
    bottom: height(0),
    right: width(0),
    backgroundColor: "#0891b2",
    height: totalSize(3),
    width: totalSize(3),
    borderRadius: totalSize(3),
    justifyContent: "center",
    alignItems: "center",
  },
  profileBtn: {
    alignSelf: "center",
    backgroundColor: "#0891b2",
    borderRadius: 10,
    justifyContent: "center",
    width: width(90),
    height: height(6),
    alignItems: "center",
    marginTop: height(10),
  },
  deleteBtn: {
    alignSelf: "center",
    backgroundColor: "#C51935",
    borderRadius: 10,
    justifyContent: "center",
    width: width(90),
    height: height(6),
    alignItems: "center",
    marginTop: height(3),
    marginBottom: height(10),
  },
  img: {
    height: height(12),
    width: width(50),
    alignSelf: "center",
    resizeMode: "contain",
  },
  subscribeCard: {
    width: width(90),
    padding: totalSize(1),
    backgroundColor: "#182130",
    marginTop: height(2),
    borderRadius: totalSize(1),
  },
  cardMainHeading: {
    color: "#fff",
    fontSize: totalSize(1.9),
    fontWeight: "700",
    paddingBottom: height(1),
  },
  cardHeading: {
    color: "#B0B0B0",
    fontSize: totalSize(1.7),
    marginTop: height(1),
  },
  cardValue: {
    color: "#0891b2",
    fontSize: totalSize(1.7),
    marginTop: height(1),
    fontWeight: "600",
  },
});
