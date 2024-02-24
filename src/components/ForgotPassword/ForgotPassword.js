import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import { TextInput } from "react-native-paper";
import { height, width } from "react-native-dimension";

function ForgotPassword({
  isVisible,
  toggleModal,
  cont,
  value,
  onChangeText,
  flag = true,
}) {
  return (
    <Modal isVisible={isVisible}>
      <View style={styles.mainView}>
        <View style={styles.logotxt}>
          <View style={styles.imgView}>
            <Image
              source={require("../../constants/icons/Password.png")}
              style={styles.logo}
            />
          </View>
          <Text className="text-xl text-white font-bold text-center font-ibmMedium">
            {flag ? `Forgot Password` : `Update Password`}
          </Text>
          <Text
            style={styles.emailtxt}
            className="text-l text-gray-600 font-bold text-center font-ibmMedium"
          >
            Enter your email to reset your password via link.
          </Text>
        </View>
        <View style={styles.inpCon}>
          <TextInput
            mode="flat"
            label="Email"
            style={styles.txtinp}
            activeUnderlineColor={"#07B6D5"}
            textColor={"white"}
            value={value}
            onChangeText={onChangeText}
          />
        </View>

        <View style={styles.btnMain}>
          <TouchableOpacity style={styles.cancelBtn} onPress={toggleModal}>
            <Text style={styles.txtCancel}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contBtn} onPress={() => cont()}>
            <Text style={styles.txtCont}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default ForgotPassword;

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: "#182130",
    // height: 340,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: height(2),
  },
  logotxt: {
    alignItems: "center",
  },
  imgView: {
    height: 76,
    width: 76,
    borderRadius: 40,
    backgroundColor: "rgba(7, 182, 213, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    height: 40,
    width: 32,
    resizeMode: "contain",
  },
  emailtxt: {
    marginTop: 6,
    marginBottom: 24,
  },
  inpCon: {
    borderRadius: 10,
    height: 55,
    overflow: "hidden",
    width: "100%",
    marginBottom: 15,
  },
  txtinp: {
    height: 57,
    overflow: "hidden",
    backgroundColor: "rgba(35, 46, 65, 1)",
    width: "100%",
  },
  btnMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: width(80),
  },
  txtCancel: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
  cancelBtn: {
    justifyContent: "center",
    alignItems: "center",
    height: height(5),
    width: width(38),
  },
  contBtn: {
    justifyContent: "center",
    backgroundColor: "#0891b2",
    alignItems: "center",
    height: height(5),
    width: width(38),
    borderRadius: 10,
  },
  txtCont: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
});
