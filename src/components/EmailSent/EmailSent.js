import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import Modal from "react-native-modal";

function EmailSent({ isVisible, toggleModal, emailCont }) {
  return (
    <Modal isVisible={isVisible} style={{}}>
      <View style={styles.mainCon}>
        <View style={styles.logoTxtMain}>
          <View style={styles.logo}>
            <Image
              source={require("../../constants/icons/Tick.png")}
              style={styles.logoImg}
            />
          </View>
          <Text className="text-xl text-white font-bold text-center font-ibmMedium">
            Email Sent
          </Text>
          <Text
            style={styles.resetTxt}
            className="text-l text-gray-600 font-bold text-center font-ibmMedium"
          >
            Enter your email to reset your password via link.
          </Text>
        </View>
        <View style={styles.btnMain}>
          <TouchableOpacity
            style={styles.resendBtn}
            onPress={() => emailCont()}
          >
            <Text style={styles.resentTxt}>Resend Link</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contBtn} onPress={toggleModal}>
            <Text style={styles.contTxt}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default EmailSent;

const styles = StyleSheet.create({
  mainCon: {
    backgroundColor: "#182130",
    height: 280,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoTxtMain: {
    alignItems: "center",
    paddingTop: 20,
  },
  logo: {
    height: 76,
    width: 76,
    borderRadius: 40,
    backgroundColor: "rgba(7, 182, 213, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoImg: {
    height: 40,
    width: 32,
    resizeMode: "contain",
  },
  resetTxt: {
    marginTop: 6,
    marginBottom: 24,
  },
  btnMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    // paddingHorizontal: 20,
    marginHorizontal: 60,
  },
  resendBtn: {
    justifyContent: "center",
  },
  resentTxt: {
    marginRight: 50,
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
  contBtn: {
    justifyContent: "center",
    backgroundColor: "rgba(7, 182, 213, 1)",
    alignItems: "center",
    height: 48,
    width: 150,
    borderRadius: 10,
  },
  contTxt: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
});
