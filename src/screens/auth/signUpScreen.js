import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Linking,
} from "react-native";
import { TextInput } from "react-native-paper";
import Auth from "@react-native-firebase/auth";
import {
  createDocument,
  getDocumentById,
  updateDocument,
  checkUniqueName,
} from "../../api/firebase/db";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { KeyboardAvoidingView } from "react-native";
import { navigate } from "../../navigation/rootNavigation";
import { collections, routes } from "../../constants/routes";
import { totalSize, width, height } from "react-native-dimension";
import AuthenticationModal from "../../components/authenticationModal";
import { IOSClientKey, WebAPIKey } from "../../constants/Keys";
import { useDispatch } from "react-redux";
import { fetchUserData } from "../../api/features/user/userDataSlice";
import { appImages } from "../../constants/images";

const SignUpScreen = () => {
  const [fName, setFName] = useState("");
  const [uName, setUName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkTerms, setCheckTerms] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    GoogleSignin.configure({
      iosClientId: IOSClientKey,
      webClientId: WebAPIKey,
    });
  }, []);

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
            // handleSocialAuthentication(user, userInfo, "");
            Alert.alert("Sign Up", "User already exists!");
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
          Alert.alert("Sign Up", "User already exists!");
          // handleAppleAuthentication(user, appleAuthRequestResponse, "");
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
          dispatch(fetchUserData());
        })
        .catch((err) => Alert.alert(err));
    }
  };

  useEffect(() => {
    if (
      fName !== "" &&
      uName !== "" &&
      email !== "" &&
      password !== "" &&
      checkTerms == true
    ) {
      setError({
        field: "",
        msg: "",
      });
    }
  }, [fName, uName, email, password, checkTerms]);

  const createAccount = async () => {
    if (fName == "" || uName == "" || email == "" || password == "") {
      setError({
        field: "all",
        msg: "All fields are required!",
      });
    } else if ((await checkUniqueName(uName)) == true) {
      setError({
        field: "uName",
        msg: "Please enter some unique username!",
      });
    } else if (checkTerms == false) {
      setError({
        field: "terms",
        msg: "Please check our terms & conditions!",
      });
    } else {
      setError({
        field: "",
        msg: "",
      });
      setLoading(true);
      await Auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
          handleSignIn();
          console.log("User signed in!");
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
        });
    }
  };

  const handleSignIn = async () => {
    await Auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential;
        let data = {
          email: email,
          name: uName,
          fullName: fName,
          uid: user.user.uid,
          followers: [],
          followings: [],
          requests: [],
          profilePic: "",
          bio: "",
          profileType: "private",
        };
        // console.log("Created User Data>>", data);
        createDocument("users", data?.uid, data)
          .then(() => {
            dispatch(fetchUserData());
          })
          .catch((err) => Alert.alert(err));
      })
      .catch((error) => {
        console.log(error);
      });
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.logotxt}>
            <Text
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
            </Text>
            <Image
              source={require("../../constants/icons/exp-white.png")}
              style={styles.logoimg}
            />
          </View>
          <View style={styles.txtinpmain}>
            <View
              style={{
                ...styles.txtinpcon,
                borderWidth: fName == "" && isError.field == "all" ? 2 : 0,
              }}
            >
              <TextInput
                mode="flat"
                label="Display Name"
                style={styles.txtinp}
                activeUnderlineColor={"#07B6D5"}
                textColor={"white"}
                value={fName}
                onChangeText={(text) => setFName(text)}
                autoCapitalize="words"
              />
            </View>
            <View
              style={{
                ...styles.txtinpcon,
                borderWidth:
                  isError.field == "uName" ||
                  (uName == "" && isError.field == "all")
                    ? 2
                    : 0,
              }}
            >
              <TextInput
                mode="flat"
                label="Username"
                style={styles.txtinp}
                textColor={"white"}
                value={uName}
                onChangeText={(inputText) => {
                  if (inputText.includes(" ")) {
                    // Remove the space character from the input
                    const updatedText = inputText.replace(/\s/g, "");
                    setUName(updatedText);
                  } else {
                    setUName(inputText);
                  }
                  // setUName(text);
                }}
                activeUnderlineColor={"#07B6D5"}
              />
            </View>
            {isError.field == "uName" && (
              <Text style={styles.errorMsg}>{isError.msg}</Text>
            )}
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
                textColor={"white"}
                keyboardType="email-address"
                value={email}
                onChangeText={(text) => setEmail(text)}
                activeUnderlineColor={"#07B6D5"}
                autoCapitalize="none"
              />
            </View>
            <View
              style={[
                styles.txtinpcon,
                {
                  borderWidth: password == "" && isError.field == "all" ? 2 : 0,
                },
              ]}
            >
              <TextInput
                mode="flat"
                label="Password"
                style={styles.txtinp}
                textColor={"white"}
                value={password}
                onChangeText={(text) => setPassword(text)}
                activeUnderlineColor={"#07B6D5"}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye" : "eye-off"}
                    onPress={togglePasswordVisibility}
                  />
                }
              />
            </View>
            {isError.field == "all" && (
              <Text style={styles.errorMsg}>{isError.msg}</Text>
            )}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: height(4),
              }}
            >
              <Pressable
                onPress={() => {
                  setCheckTerms(!checkTerms);
                }}
              >
                <Image
                  source={checkTerms ? appImages.check : appImages.unCheck}
                  style={styles.icon}
                />
              </Pressable>
              <Text style={styles.termsTxt}>
                Agree to our{" "}
                <Text
                  onPress={() =>
                    Linking.openURL("https://www.fitgress.io/terms&conditions")
                  }
                  style={{ textDecorationLine: "underline" }}
                >
                  Terms & Conditions
                </Text>
              </Text>
            </View>
            {isError.field == "terms" && (
              <Text style={styles.errorMsg}>{isError.msg}</Text>
            )}
            <TouchableOpacity
              style={styles.signupbtn}
              onPress={() => createAccount()}
              disabled={isError.field !== "" ? true : false}
            >
              {isLoading ? (
                <ActivityIndicator color={"#f9fafb"} size={"small"} />
              ) : (
                <Text
                  className="text-center text-gray-700 font-ibmMedium text-xl"
                  style={{ color: "white", fontWeight: "600" }}
                >
                  SIGN UP
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.lineimgmain}>
              <Image
                source={require("../../constants/icons/Line.png")}
                style={styles.lineimg}
              />
              <Text
                className="text-xl text-gray-700 font-bold text-center py-5 font-ibmMedium"
                style={{ color: "white" }}
              >
                {" "}
                OR
              </Text>
              <Image
                source={require("../../constants/icons/Line.png")}
                style={styles.lineimg}
              />
            </View>

            <View style={styles.iconmain}>
              <TouchableOpacity style={styles.iconback} onPress={googleSignup}>
                <Image
                  source={require("../../constants/icons/google.png")}
                  style={styles.iconimg}
                />
              </TouchableOpacity>
              {Platform.OS == "ios" && (
                <TouchableOpacity
                  style={styles.iconback}
                  onPress={onAppleSignup}
                >
                  <Image
                    source={require("../../constants/icons/apple-white.png")}
                    style={styles.iconimg}
                  />
                </TouchableOpacity>
              )}
              {/* <TouchableOpacity style={styles.iconback}>
              <Image
                source={require("../../constants/icons/facebook.png")}
                style={styles.iconimg}
              />
            </TouchableOpacity> */}
            </View>

            <View style={styles.lasttxtmain}>
              <Text className="text-white font-ibmMedium">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigate(routes.login)}>
                <Text
                  className="font-ibmBold  "
                  style={{
                    marginLeft: 4,
                    color: "#0891b2",
                    fontWeight: "700",
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <AuthenticationModal
            visible={authModal}
            onConfirm={(name) => {
              isGoogleLogin
                ? handleSocialAuthentication(socialUser, socialUserInfo, name)
                : handleAppleAuthentication(socialUser, socialUserInfo, name);
            }}
          />
          <View style={{ marginVertical: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111828",
  },
  logotxt: {
    justifyContent: "center",
    paddingBottom: 12,
  },
  logoimg: {
    height: 100,
    width: 100,
    resizeMode: "contain",
    alignSelf: "center",
  },
  txtinpmain: {
    flex: 1,
    backgroundColor: "#111828",
    paddingHorizontal: 20,
    marginTop: 40,
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
  signupbtn: {
    alignSelf: "center",
    backgroundColor: "#0891b2",
    height: height(6),
    width: width(70),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  lineimg: {
    width: 120,
  },
  iconmain: {
    flexDirection: "row",
    justifyContent: Platform.OS == "ios" ? "space-between" : "center",
    width: width(50),
    alignSelf: "center",
  },
  iconback: {
    backgroundColor: "#232E41",
    height: 50,
    width: width(23),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  iconimg: {
    height: 25,
    width: 25,
    resizeMode: "contain",
  },
  lineimgmain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lasttxtmain: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: height(2),
  },
  errorMsg: {
    fontSize: totalSize(1.3),
    color: "#f43f5e",
    paddingTop: 0,
    width: width(90),
  },
  icon: {
    height: totalSize(2.5),
    width: totalSize(2.5),
    resizeMode: "contain",
  },
  termsTxt: {
    fontSize: totalSize(1.7),
    fontWeight: "500",
    fontFamily: "IBMPlexSans-Regular",
    color: "#fff",
    paddingLeft: width(2),
  },
});
