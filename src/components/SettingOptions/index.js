import { StyleSheet, Text, View, Pressable, Image, Alert } from "react-native";
import React, { useRef } from "react";
import Modal from "react-native-modal";
import BottomSheet from "@gorhom/bottom-sheet";
import { width, height, totalSize } from "react-native-dimension";
import { useDispatch } from "react-redux";
import { clearUserStats } from "../../api/features/user/userDataSlice";
import { navigate } from "../../navigation/rootNavigation";
import auth from "@react-native-firebase/auth";
import { routes } from "../../constants/routes";

const SettingOptionModal = ({ onClose }) => {
  const bottomSheetRef = useRef(null);
  const dispatch = useDispatch();

  const handleSignOut = () => {
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
          onClose();
          navigate(routes.auth);
        },
      },
      { text: "No", onPress: () => onClose() },
    ]);
  };

  return (
    <Modal
      isVisible={true}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ width: "100%", marginLeft: 0, marginBottom: 0 }}
    >
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={["30%"]}
        onClose={onClose}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: "#182130" }}
        handleIndicatorStyle={{
          backgroundColor: "#fff",
          marginVertical: height(1),
          width: width(10),
        }}
      >
        <View style={styles.bottomNavigationView}>
          <Pressable
            style={styles.sheetBtn}
            onPress={() => {
              onClose();
              navigate(routes.paymentDetails);
            }}
          >
            <Image
              source={require("../../constants/icons/card.png")}
              style={{ width: 28, height: 24, marginRight: 10 }}
            />
            <Text style={{ fontSize: 18, fontWeight: "400", color: "white" }}>
              Payment Detail
            </Text>
          </Pressable>
          <Pressable
            style={styles.sheetBtn}
            onPress={() => {
              onClose();
              navigate(routes.accountPrivacy);
            }}
          >
            <Image
              source={require("../../constants/icons/unlock.png")}
              style={{ width: 28, height: 24, marginRight: 10 }}
            />
            <Text style={{ fontSize: 18, fontWeight: "400", color: "white" }}>
              Account Privacy
            </Text>
          </Pressable>
          <Pressable style={styles.sheetBtn} onPress={handleSignOut}>
            <Image
              source={require("../../constants/icons/login.png")}
              style={{ width: 28, height: 24, marginRight: 10 }}
            />
            <Text style={{ fontSize: 18, fontWeight: "400", color: "white" }}>
              Logout
            </Text>
          </Pressable>
        </View>
      </BottomSheet>
    </Modal>
  );
};

export default SettingOptionModal;

const styles = StyleSheet.create({
  bottomNavigationView: {
    backgroundColor: "#111828",
    width: width(100),
  },
  sheetBtn: {
    height: height(7),
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
});
