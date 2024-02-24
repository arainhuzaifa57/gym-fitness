import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  Image,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Platform,
  Alert,
  Keyboard,
  FlatList,
} from "react-native";
import CalenderModal from "../../../components/CalendarModal/CalendarModal";
import { TextInput } from "react-native-paper";
import moment from "moment";
import { totalSize, width, height } from "react-native-dimension";
import ImagePicker from "react-native-image-crop-picker";
import ImageOptionsModal from "../../../components/ImageOptions";
import {
  addUserWeight,
  uploadUserWeightFiles,
  updateUserWeight,
} from "../../../api/firebase/db";
import {
  getRandomNumber,
  handleWeightConverter,
} from "../../../utils/helpingMethods";
import { useSelector } from "react-redux";
import { goBack } from "../../../navigation/rootNavigation";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Header } from "../../../components/Header";

const AddWeight = ({ route }) => {
  const param = route.params;
  // console.log("Edit profile Params>>", param);
  const [calendar, setCalender] = useState(false);
  const [date, setDate] = useState(new Date());
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("lbs");
  const [isLoading, setLoading] = useState(false);
  const [weightImages, setWeightImages] = useState([]);
  const [optionModal, setOptionModal] = useState(false);

  const { userData } = useSelector((state) => state?.userData);

  useEffect(() => {
    if (param !== undefined) {
      let editableWeight = param?.weight;
      setDate(editableWeight?.createdAt);
      setWeight(editableWeight?.weight);
      setUnit(editableWeight?.weightUnit);
      let images = [];
      editableWeight?.weightImages?.map((i) => {
        let fileName = i?.postUrl?.split("/")?.pop();
        let data = {
          name: fileName,
          url: i?.postUrl,
          type: i?.fileType,
        };
        images?.push(data);
      });
      setWeightImages(images);
    }
  }, [param]);

  const handleWeight = (unit) => {
    setUnit(unit);
    let W = handleWeightConverter(weight.length > 0 ? weight : 0.0, unit);
    setWeight(W);
  };

  const handleDateSelection = (data) => {
    if (data && data?.dateString) {
      setDate(data?.dateString);
    }
    // Close the modal
    setCalender(false);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.openPicker({
      mediaType: "photo",
      cropping: true,
      height: height(50),
      width: width(100),
      compressImageQuality: 1,
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
    setWeightImages([data, ...weightImages]);
  };

  const handleCameraPick = async () => {
    const result = await ImagePicker.openCamera({
      mediaType: "photo",
      cropping: true,
      height: height(50),
      width: width(100),
      useFrontCamera: true,
      compressImageQuality: 1,
    });
    let data = {
      name: result?.filename,
      url:
        Platform.OS === "android"
          ? result.path
          : result.path.replace("file://", ""),
      type: result?.mime,
    };
    // console.log("File>>", data);
    setWeightImages([data, ...weightImages]);
  };

  const uploadWeightImages = async () => {
    if (weight == "") {
      Alert.alert("Please enter your weight first!");
      return;
    }
    setLoading(true);
    let images = [];
    let firebaseImages = [];
    weightImages?.map((i) => {
      if (i?.url?.includes("firebase")) {
        firebaseImages.push({
          postUrl: i?.url,
          fileType: i?.type,
        });
      } else {
        images.push(i);
      }
    });
    // console.log("Firebase Images>>", firebaseImages);
    // console.log("New Images>>", images);
    if (images?.length == 0) {
      if (param !== undefined) {
        updateWeight(firebaseImages);
      } else {
        saveUserWeight([]);
      }
    } else {
      await uploadUserWeightFiles(images)
        .then((response) => {
          if (param !== undefined) {
            let allImages = [...firebaseImages, ...response];
            updateWeight(allImages);
          } else {
            saveUserWeight(response);
          }
        })
        .catch((err) => {
          console.log("UploadImage Error>>", err);
          setLoading(false);
        });
    }
  };

  const updateWeight = async (imagearray) => {
    let editableWeight = param?.weight;
    let W = "";
    if (unit == "lbs") {
      W = weight;
    } else {
      W = handleWeightConverter(weight, "lbs");
    }
    let data = {
      weightImages: imagearray,
      weight: W,
      weightUnit: unit,
      createdAt: moment(date).format("YYYY-MM-DD"),
      id: editableWeight?.id,
      userID: userData?.id,
    };
    console.log("Update Weight Data>>", data);
    await updateUserWeight(userData?.id, data?.id, data)
      .then(() => {
        // Alert.alert("Weight sucessfully updated!");
        setLoading(false);
        goBack();
      })
      .catch((err) => {
        setLoading(false);
        Alert.alert(err);
      });
  };

  const saveUserWeight = async (imagearray) => {
    let W = "";
    if (unit == "lbs") {
      W = weight;
    } else {
      W = handleWeightConverter(weight, "lbs");
    }
    let data = {
      weightImages: imagearray,
      weight: W,
      weightUnit: unit,
      createdAt: moment(date).format("YYYY-MM-DD"),
      id: getRandomNumber(),
      userID: userData?.id,
    };
    // console.log("add Weight Data>>", data);
    await addUserWeight(userData?.id, data?.id, data)
      .then(() => {
        // Alert.alert("Weight sucessfully added!");
        setLoading(false);
        goBack();
      })
      .catch((err) => {
        setLoading(false);
        Alert.alert(err);
      });
  };

  const removeImage = async (item) => {
    let filt = weightImages?.filter((i) => {
      return i?.url !== item?.url;
    });
    setWeightImages(filt);
  };

  return (
    <View style={{ backgroundColor: "#111828", flex: 1 }}>
      <Header
        onBack={false}
        leftHeader={
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => goBack()}
          >
            <Image
              source={require("../../../constants/icons/arrow-left.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
            <Text style={style.heading}>
              {param !== undefined ? "Edit Weight" : "Add Weight"}
            </Text>
          </TouchableOpacity>
        }
        rightHeader={
          <TouchableOpacity
            onPress={() => {
              uploadWeightImages();
            }}
          >
            {isLoading ? (
              <ActivityIndicator color={"#f9fafb"} size={"small"} />
            ) : (
              <Text
                style={{
                  color: "#0891b2",
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                {param !== undefined ? "Update" : `Save`}
              </Text>
            )}
          </TouchableOpacity>
        }
      />
      <View
        style={{
          flexDirection: "row",
          marginTop: 10,
          justifyContent: "space-between",
          paddingHorizontal: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => setCalender(true)}
          style={{ width: "47%" }}
        >
          <View
            style={{
              borderRadius: 10,
              height: 57,
              overflow: "hidden",
              marginBottom: 15,
            }}
          >
            <TextInput
              mode="flat"
              label="Date"
              style={{
                backgroundColor: "#172033",
              }}
              activeUnderlineColor={"#07B6D5"}
              textColor={"white"}
              editable={false}
              value={moment(date).format("MM/DD/YYYY")}
              right={
                <TextInput.Icon
                  icon={"calendar-blank-outline"}
                  iconColor="white"
                  onPress={() => setCalender(true)}
                />
              }
            />
          </View>
        </TouchableOpacity>
        <View
          style={{
            borderRadius: 10,
            height: 55,
            overflow: "hidden",
            marginBottom: 15,
            width: "47%",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#172033",
          }}
        >
          <TextInput
            mode="flat"
            label="Weight"
            style={{
              backgroundColor: "#172033",
              width: width(27),
            }}
            activeUnderlineColor={"rgba(164, 164, 164, 1)"}
            textColor={"white"}
            value={weight}
            onChangeText={(text) => setWeight(text)}
            keyboardType="decimal-pad"
            onBlur={() => Keyboard.dismiss()}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable
              style={{
                ...style.weightBtn,
                backgroundColor: unit == "kg" ? "#232E41" : "transparent",
              }}
              onPress={() => {
                if (unit !== "kg") {
                  handleWeight("kg");
                }
              }}
            >
              <Text style={{ color: "#fff" }}>kg</Text>
            </Pressable>
            <Pressable
              style={{
                ...style.weightBtn,
                backgroundColor: unit == "lbs" ? "#232E41" : "transparent",
              }}
              onPress={() => {
                if (unit !== "lbs") {
                  handleWeight("lbs");
                }
              }}
            >
              <Text style={{ color: "#fff" }}>lbs</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <FlatList
        data={weightImages}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        ListHeaderComponent={() => (
          <TouchableOpacity
            onPress={() => setOptionModal(true)}
            style={style.imageBtn}
          >
            <Image
              source={require("../../../constants/icons/Add-Image.png")}
              style={{ height: 32, width: 32 }}
            />
            <Text
              style={{
                color: "#fff",
                paddingTop: 5,
                fontWeight: "600",
                fontSize: totalSize(1.7),
              }}
            >
              Add Images
            </Text>
          </TouchableOpacity>
        )}
        renderItem={({ item, index }) => (
          <View>
            <Image
              source={{ uri: item?.url }}
              style={{
                height: height(25),
                width: width(40),
                borderRadius: 10,
                marginLeft: width(2),
              }}
            />
            <TouchableOpacity
              style={style.closeBtn}
              onPress={() => removeImage(item)}
            >
              <AntDesign name="close" color={"#fff"} size={totalSize(2)} />
            </TouchableOpacity>
          </View>
        )}
        style={{ marginHorizontal: width(3) }}
      />
      {/* <TouchableOpacity style={style.Btn} onPress={() => uploadWeightImages()}>
        {isLoading ? (
          <ActivityIndicator color={"#f9fafb"} size={"small"} />
        ) : (
          <Text
            className="text-center text-gray-700 font-ibmBold text-xl"
            style={{ color: "white" }}
          >
            Save
          </Text>
        )}
      </TouchableOpacity> */}
      {optionModal && (
        <ImageOptionsModal
          isVisible={true}
          onClose={() => setOptionModal(false)}
          onCamera={handleCameraPick}
          onGallery={handleImagePick}
          cameraText={"Add Image"}
          backColor={"#182130"}
          innerColor={"#111828"}
        />
      )}
      <CalenderModal
        visible={calendar}
        onSwipeComplete={() => setCalender(false)}
        Data={handleDateSelection}
        onBackdropPress
      />
    </View>
  );
};

export default AddWeight;

const style = StyleSheet.create({
  heading: {
    color: "white",
    fontSize: totalSize(2),
    fontWeight: "500",
    marginLeft: width(2),
    fontFamily: "IBMPlexSans-Regular",
  },
  weightBtn: {
    height: totalSize(3),
    width: totalSize(3),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: totalSize(3),
  },
  Btn: {
    width: width(90),
    height: height(6),
    backgroundColor: "#07B6D5",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    position: "absolute",
    bottom: height(3),
  },
  imageBtn: {
    height: height(25),
    width: width(40),
    backgroundColor: "#172033",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#A4A4A4",
  },
  closeBtn: {
    position: "absolute",
    top: 2,
    right: 5,
    height: totalSize(3),
    width: totalSize(3),
    borderRadius: totalSize(3),
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});
