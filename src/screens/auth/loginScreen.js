import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  BackHandler,
} from "react-native";
import React, { useState, useEffect } from "react";
import Auth from "@react-native-firebase/auth";
import {
  createDocument,
  getDocumentById,
  updateDocument,
} from "../../api/firebase/db";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { TextInput } from "react-native-paper";
import { navigate } from "../../navigation/rootNavigation";
import { collections, routes } from "../../constants/routes";
import ForgotPassword from "../../components/ForgotPassword/ForgotPassword";
import EmailSent from "../../components/EmailSent/EmailSent";
import { height, totalSize, width } from "react-native-dimension";
import AuthenticationModal from "../../components/authenticationModal";
import { IOSClientKey, WebAPIKey } from "../../constants/Keys";
import { useDispatch } from "react-redux";
import { fetchUserData } from "../../api/features/user/userDataSlice";

import { styled } from "nativewind";

const StyledText = styled(Text);
const StyledView = styled(View);

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [emailSentModal, setEmailSentModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState({
    field: "",
    msg: "",
  });
  const [authModal, setAuthModal] = useState(false);
  const [socialUser, setSocialUser] = useState(null);
  const [socialUserInfo, setSocialUserInfo] = useState(null);
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to exit?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        { text: "YES", onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: IOSClientKey,
      webClientId: WebAPIKey,
    });
  }, []);

  const handleSignIn = async () => {
    if (email == "" && password == "") {
      setError({
        field: "all",
        msg: "All fields are required!",
      });
    } else if (email == "") {
      setError({
        field: "email",
        msg: "Please enter your email!",
      });
    } else if (password == "") {
      setError({
        field: "pwd",
        msg: "Please enter your password!",
      });
    } else {
      setLoading(true);
      await Auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          dispatch(fetchUserData());
          setEmail("");
          setPassword("");
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          if (error.code === "auth/email-already-in-use") {
            setError({
              field: "email",
              msg: "That email address is already in use!",
            });
          }

          if (error.code === "auth/invalid-email") {
            setError({
              field: "email",
              msg: "That email address is invalid!",
            });
          }
          if (error.code === "auth/internal-error") {
            setError({
              field: "",
              msg: "Please check your email & passowrd again!",
            });
          }
          console.log(error);
        });
    }
  };

  const googleSignup = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const userInfo = await GoogleSignin.signIn();
      const googleCredential = Auth.GoogleAuthProvider.credential(
        userInfo.idToken
      );
      setSocialUserInfo(userInfo);
      Auth()
        .signInWithCredential(googleCredential)
        .then((user) => {
          if (user.additionalUserInfo.isNewUser) {
            setIsGoogleLogin(true);
            setSocialUser(user);
            setAuthModal(true);
          } else {
            setIsGoogleLogin(false);
            handleSocialAuthentication(user, userInfo, "");
          }
        })
        .catch((err) => Alert.alert("", err));
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  const handleSocialAuthentication = async (user, userInfo, username) => {
    // console.log("User>>", user, "UserInfo>>", userInfo);
    if (user.additionalUserInfo.isNewUser) {
      let data = {
        email: userInfo?.user.email,
        name: username,
        fullName: userInfo?.user.name,
        uid: user.user.uid,
        followers: [],
        followings: [],
        requests: [],
        profilePic: userInfo?.user.photo,
        bio: "",
        profileType: "private",
      };
      createDocument("users", data?.uid, data)
        .then(() => {
          setAuthModal(false);
          // console.log("From Create  User");
          dispatch(fetchUserData());
        })
        .catch((err) => Alert.alert(err));
    } else {
      let oldUser = await getDocumentById(collections.users, user.user.uid);
      // console.log("Its OldUser>>", oldUser);
      let data = {
        email: userInfo?.user.email,
        name: oldUser?.name,
        fullName: userInfo?.user.name,
        uid: user.user.uid,
        followers: oldUser?.followers ?? [],
        followings: oldUser?.followings ?? [],
        requests: oldUser?.requests ?? [],
        profilePic: userInfo?.user.photo,
        bio: oldUser?.bio ?? "",
        profileType: oldUser?.profileType ?? "private",
      };
      updateDocument("users", user.user.uid, data)
        .then(() => {
          // console.log("From Old User");
          dispatch(fetchUserData());
        })
        .catch((err) => Alert.alert(err));
    }
  };

  async function onAppleSignup() {
    // Start the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      // As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
      // See: https://github.com/invertase/react-native-apple-authentication#faqs
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error("Apple Sign-In failed - no identify token returned");
    }
    setSocialUserInfo(appleAuthRequestResponse);
    console.log("Apple Response>>", appleAuthRequestResponse);
    // Create a Firebase credential from the response
    const { identityToken, nonce, user } = appleAuthRequestResponse;
    const appleCredential = Auth.AppleAuthProvider.credential(
      identityToken,
      nonce
    );

    // Sign the user in with the credential
    Auth()
      .signInWithCredential(appleCredential)
      .then((user) => {
        if (user.additionalUserInfo.isNewUser) {
          setSocialUser(user);
          setAuthModal(true);
        } else {
          handleAppleAuthentication(user, appleAuthRequestResponse, "");
        }
      })
      .catch((err) => Alert.alert("", err));
  }

  const handleAppleAuthentication = async (
    user,
    appleAuthRequestResponse,
    username
  ) => {
    const { familyName, givenName } = appleAuthRequestResponse?.fullName;
    if (user.additionalUserInfo.isNewUser) {
      let data = {
        email: user?.user?.email,
        name: username,
        fullName: `${givenName} ${familyName}`,
        uid: user.user.uid,
        followers: [],
        followings: [],
        requests: [],
        profilePic: "",
        bio: "",
        profileType: "private",
      };
      createDocument("users", data?.uid, data)
        .then(() => {
          setAuthModal(false);
          dispatch(fetchUserData());
          // console.log("From Create  User");
        })
        .catch((err) => Alert.alert(err));
    } else {
      let oldUser = await getDocumentById(collections.users, user.user.uid);
      // console.log("Its OldUser>>", oldUser);
      let data = {
        ...oldUser,
        profileType: oldUser?.profileType ?? "private",
      };
      updateDocument("users", user.user.uid, data)
        .then(() => {
          // console.log("From Old User");
          dispatch(fetchUserData());
        })
        .catch((err) => Alert.alert(err));
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setForgotPassword("");
  };

  const emailSentModalF = () => {
    setEmailSentModal(!emailSentModal);
    setForgotPassword("");
  };

  const Continue = async () => {
    if (forgotPassword !== "") {
      await Auth()
        .sendPasswordResetEmail(forgotPassword)
        .then((userCredential) => {
          setModalVisible(!isModalVisible);
          setTimeout(() => {
            setEmailSentModal(true);
          }, 2000);
        })
        .catch((error) => {
          console.log(error);
          Alert.alert("The email is invalid");
        });
    } else {
      Alert.alert("Please fill the field before continue");
    }
  };

  const emailCont = async () => {
    await Auth()
      .sendPasswordResetEmail(forgotPassword)
      .then((userCredential) => {
        Alert.alert("Link has been resend to you email address");
      })
      .catch((error) => {
        console.log(error);
        Alert.alert(error);
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (email !== "" && password !== "") {
      setError({
        field: "",
        msg: "",
      });
    }
  }, [email, password]);

  return (
    <StyledView className="flex-1 bg-gray-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        <StyledView className="flex mt-20">
          <StyledView className="flex justify-center pb-12">
            <StyledText
              className="text-4xl flex-2 text-center font-ibmRegular text-white pb-5 pt-8"
              // style={{
              //   fontFamily: "IBMPlexSans-Regular",
              //   fontSize: totalSize(3.5),
              //   color: "#d1d5db",
              //   fontWeight: "600",
              //   textAlign: "center",
              //   paddingBottom: height(1),
              //   paddingTop: height(4),
              // }}
            >
              F I T G R E S S
            </StyledText>
            <Image
              source={require("../../constants/icons/exp-white.png")}
              style={styles.logoimg}
            />
          </StyledView>
        </StyledView>

        <View style={styles.txtinpmain}>
          <KeyboardAvoidingView
            behavior={Platform.OS == "ios" ? "padding" : "height"}
          >
            <View className="form space-y-2">
              <View
                style={{
                  ...styles.txtinpcon,
                  borderWidth: email == "" && isError.field == "all" ? 2 : 0,
                }}
              >
                <TextInput
                  mode="flat"
                  label="Email"
                  style={styles.txtinp}
                  activeUnderlineColor={"#07B6D5"}
                  textColor={"white"}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                />
              </View>
              {isError.field == "email" && (
                <Text style={styles.errorMsg}>{isError.msg}</Text>
              )}
              <View
                style={{
                  ...styles.txtinpcon,
                  borderWidth: password == "" && isError.field == "all" ? 2 : 0,
                }}
              >
                <TextInput
                  mode="flat"
                  label="Password"
                  style={styles.txtinp}
                  activeUnderlineColor={"#07B6D5"}
                  textColor={"white"}
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  secureTextEntry={!showPassword}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye" : "eye-off"}
                      onPress={togglePasswordVisibility}
                    />
                  }
                />
              </View>
              {(isError.field == "pwd" || isError.field == "all") && (
                <Text style={styles.errorMsg}>{isError.msg}</Text>
              )}
              {isError.field == "" && isError.msg !== "" && (
                <Text style={styles.errorMsg}>{isError.msg}</Text>
              )}
              <TouchableOpacity
                onPress={toggleModal}
                style={{ alignSelf: "flex-end", marginBottom: height(5) }}
              >
                <Text
                  className="text-white font-ibmRegular"
                  style={{ textDecorationLine: "underline", color: "#0891b2" }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
              <View className="items-center">
                <TouchableOpacity
                  style={styles.loginback}
                  onPress={() => handleSignIn()}
                >
                  {isLoading ? (
                    <ActivityIndicator color={"#f9fafb"} size={"small"} />
                  ) : (
                    <Text
                      className="text-center text-gray-700 font-ibmMedium text-xl"
                      style={styles.logintxt}
                    >
                      LOGIN
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
          <View style={styles.lineimgmain}>
            <Image
              source={require("../../constants/icons/Line.png")}
              style={styles.lineimg}
            />
            <Text
              className="text-xl text-gray-700 font-bold text-center py-5 font-ibmMedium"
              style={styles.logintxt}
            >
              {" "}
              OR
            </Text>
            <Image
              source={require("../../constants/icons/Line.png")}
              style={styles.lineimg}
            />
          </View>
          <View style={styles.iconsmain}>
            <TouchableOpacity style={styles.btnback} onPress={googleSignup}>
              <Image
                source={require("../../constants/icons/google.png")}
                style={styles.img}
              />
            </TouchableOpacity>
            {Platform.OS == "ios" && (
              <TouchableOpacity style={styles.btnback} onPress={onAppleSignup}>
                <Image
                  source={require("../../constants/icons/apple-white.png")}
                  style={styles.img}
                />
              </TouchableOpacity>
            )}
            {/* <TouchableOpacity style={styles.btnback}>
            <Image
              source={require("../../constants/icons/facebook.png")}
              style={styles.img}
            />
          </TouchableOpacity> */}
          </View>
        </View>
        <View className="flex-row justify-center" style={styles.signUpLine}>
          <Text className="text-white font-ibmMedium">
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => navigate(routes.signUp)}>
            <Text
              style={{
                // textDecorationLine: "underline",
                marginLeft: 4,
                color: "#0891b2",
                fontWeight: "700",
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ForgotPassword
        isVisible={isModalVisible}
        toggleModal={toggleModal}
        cont={Continue}
        value={forgotPassword}
        onChangeText={(text) => setForgotPassword(text)}
      />
      <EmailSent
        isVisible={emailSentModal}
        toggleModal={emailSentModalF}
        emailCont={emailCont}
      />
      <AuthenticationModal
        visible={authModal}
        onConfirm={(name) => {
          isGoogleLogin
            ? handleSocialAuthentication(socialUser, socialUserInfo, name)
            : handleAppleAuthentication(socialUser, socialUserInfo, name);
        }}
      />
    </StyledView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  logoimg: {
    height: 100,
    width: 100,
    resizeMode: "contain",
    alignSelf: "center",
  },
  txtinpmain: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    // flex: 1,
    paddingHorizontal: 20,
  },
  txtinpcon: {
    borderRadius: 10,
    height: 55,
    overflow: "hidden",
    marginTop: 15,
    borderColor: "#f43f5e",
  },
  txtinp: {
    height: 57,
    overflow: "hidden",
    backgroundColor: "#182130",
  },
  loginback: {
    alignSelf: "center",
    backgroundColor: "#0891b2",
    height: height(6),
    width: width(70),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logintxt: {
    color: "white",
    fontWeight: "600",
  },
  lineimgmain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lineimg: {
    width: 120,
  },
  iconsmain: {
    flexDirection: "row",
    justifyContent: Platform.OS == "ios" ? "space-between" : "center",
    width: width(50),
    alignSelf: "center",
  },
  btnback: {
    backgroundColor: "#232E41",
    height: 50,
    width: width(23),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  img: {
    height: 25,
    width: 25,
    resizeMode: "contain",
  },
  errorMsg: {
    fontSize: totalSize(1.3),
    color: "#f43f5e",
    paddingTop: 0,
    width: width(90),
  },
  signUpLine: {
    // position: "absolute",
    // bottom: Platform.OS == "ios" ? height(3) : height(2),
    // alignSelf: "center",
    marginTop: height(15),
    bottom: height(3),
  },
});
