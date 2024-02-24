import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import Modal from "react-native-modal";
import { height, width, totalSize } from "react-native-dimension";
import { TextInput } from "react-native-paper";
import { checkUniqueName } from "../../api/firebase/db";

const AuthenticationModal = ({ visible, onConfirm }) => {
  const [username, setUserName] = useState("");
  const [isError, setError] = useState("");

  const handleSubmit = async () => {
    if (username.length > 0) {
      if ((await checkUniqueName(username)) == true) {
        setError('"Please enter some unique username!');
      } else {
        onConfirm(username?.trim());
      }
    } else {
      setError('"Please enter some username!');
    }
  };

  return (
    <Modal
      isVisible={visible}
      animationIn={"slideInUp"}
      animationOut={"slideInDown"}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <View style={styles.innerView}>
        <View style={styles.imgView}>
          <Image
            source={require("../../constants/icons/Password.png")}
            style={styles.logo}
          />
        </View>
        <Text style={styles.heading}>Enter User Name</Text>
        <View
          style={{
            ...styles.txtinpcon,
            borderWidth: isError ? 2 : 0,
          }}
        >
          <TextInput
            mode="flat"
            label="User Name"
            style={styles.txtinp}
            activeUnderlineColor={"#07B6D5"}
            textColor={"white"}
            value={username}
            onChangeText={(inputText) => {
              // setUserName(text?.trim());
              if (inputText.includes(" ")) {
                // Remove the space character from the input
                const updatedText = inputText.replace(/\s/g, "");
                setUserName(updatedText);
              } else {
                setUserName(inputText);
              }
            }}
            onChange={() => {
              setError("");
            }}
          />
        </View>
        {isError.length > 0 && <Text style={styles.errorMsg}>{isError}</Text>}

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnTxt}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default AuthenticationModal;

const styles = StyleSheet.create({
  innerView: {
    backgroundColor: "#182130",
    borderRadius: totalSize(1),
    paddingVertical: height(3),
    width: width(90),
    paddingHorizontal: width(2),
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
    backgroundColor: "#232E41",
  },
  errorMsg: {
    fontSize: totalSize(1.3),
    color: "#f43f5e",
    paddingTop: 0,
    width: width(90),
  },
  btn: {
    width: width(70),
    alignSelf: "center",
    paddingVertical: height(1),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: height(5),
    backgroundColor: "#07B6D5",
  },
  btnTxt: {
    color: "#fff",
    fontSize: totalSize(2),
    fontWeight: "600",
  },
  heading: {
    fontSize: totalSize(2.5),
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  imgView: {
    height: 76,
    width: 76,
    borderRadius: 40,
    backgroundColor: "rgba(7, 182, 213, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  logo: {
    height: 40,
    width: 32,
    resizeMode: "contain",
  },
});
