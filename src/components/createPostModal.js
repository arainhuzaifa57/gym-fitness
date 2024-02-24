import React, { useState } from "react";
import {
  TextInput,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  ScrollView,
  View,
  Alert,
} from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { createPost, uploadPostFiles } from "../api/firebase/db";
import { width, height, totalSize } from "react-native-dimension";
import { useSelector } from "react-redux";
import { getRandomNumber } from "../utils/helpingMethods";
import VideoPlayer from "react-native-video-player";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { appImages } from "../constants/images";
import ImageOptionsModal from "./ImageOptions";
import moment from "moment";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Header } from "./Header";

const CreatePost = ({ isVisible, onClose, onDone }) => {
  const [description, setDescription] = useState("");
  const [postImageFile, setPostImageFile] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [imagePicker, setImagePicker] = useState(false);
  const { userData } = useSelector((state) => state?.userData);

  const handleImagePick = async () => {
    setImagePicker(false);
    let result = await ImagePicker.openPicker({
      mediaType: "any",
      compressImageQuality: 1,
    });
    // console.log("Gallery Result: " + result);
    if (result.mime == "image/jpeg") {
      const cropResult = await ImagePicker.openCropper({
        path: result?.path,
        width: width(100),
        height: height(47),
        maxFiles: 1,
        showCropFrame: false,
      });
      let data = {
        name: cropResult?.filename,
        url:
          Platform.OS === "android"
            ? cropResult.path
            : cropResult.path.replace("file://", ""),
        type: cropResult?.mime,
        height: cropResult?.height,
        width: cropResult?.width,
      };
      // console.log("File>>", data);
      setPostImageFile([...postImageFile, data]);
    } else {
      let data = {
        name: result?.filename,
        url:
          Platform.OS === "android"
            ? result.path
            : result.path.replace("file://", ""),
        type: result?.mime,
        height: result?.height,
        width: result?.width,
      };
      // console.log("File>>", data);
      setPostImageFile([...postImageFile, data]);
    }
  };

  const handleCameraPick = async () => {
    setImagePicker(false);
    let result = await ImagePicker.openCamera({
      mediaType: "any",
      useFrontCamera: true,
      compressImageQuality: 1,
    });
    // console.log("Capture Image>>", result);
    if (result.mime == "image/jpeg") {
      const cropResult = await ImagePicker.openCropper({
        path: result?.path,
        width: width(100),
        height: height(47),
        maxFiles: 1,
        showCropFrame: false,
      });
      let data = {
        name: cropResult?.filename,
        url:
          Platform.OS === "android"
            ? cropResult.path
            : cropResult.path.replace("file://", ""),
        type: cropResult?.mime,
        height: cropResult?.height,
        width: cropResult?.width,
      };
      // console.log("File>>", data);
      setPostImageFile([...postImageFile, data]);
    } else {
      let data = {
        name: result?.filename,
        url:
          Platform.OS === "android"
            ? result.path
            : result.path.replace("file://", ""),
        type: result?.mime,
        height: result?.height,
        width: result?.width,
      };
      // console.log("File>>", data);
      setPostImageFile([...postImageFile, data]);
    }
  };

  const handlePost = async () => {
    setLoading(true);
    // Implement the logic to upload the post with the specified fields.
    if (postImageFile?.length > 0) {
      console.log(postImageFile);
      await uploadPostFiles(postImageFile)
        .then(async (urls) => {
          uploadPost(urls);
        })
        .catch((err) => {
          console.log("UploadImage Error>>", err);
          setLoading(false);
        });
    } else {
      uploadPost([]);
    }
  };

  const uploadPost = async (images) => {
    let post = {
      createdAt: moment().valueOf(),
      description: description.toString(),
      postImages: images,
      id: getRandomNumber(),
      likes: [],
      comments: [],
      user: {
        fullName: userData?.userData?.fullName,
        userName: userData?.userData?.name,
        profilePic: userData?.userData?.profilePic,
        userID: userData?.id,
      },
    };
    // console.log("User Data>>", data);
    await createPost(post?.id, post)
      .then(() => {
        // alert("Post sucessfully uploaded!");
        onDone();
        setLoading(false);
        onClose();
        // setTimeout(() => {
        // }, 1000);
      })
      .catch((err) => {
        setLoading(false);
        Alert.alert(err);
      });
    // Reset the input fields.
    setDescription("");
    setPostImageFile([]);
    setLoading(false);
  };

  const removeImage = async (item) => {
    let filt = postImageFile?.filter((i) => {
      return i?.url !== item?.url;
    });
    setPostImageFile(filt);
  };

  return (
    <Modal
      visible={isVisible}
      statusBarTranslucent
      style={styles.container}
      animationType="slide"
    >
      <Header
        onBack={false}
        leftHeader={
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => {
              setPostImageFile([]);
              setDescription("");
              onClose();
            }}
          >
            <Image
              source={require("../constants/icons/arrow-left.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
            <Text style={styles.heading}>{"Create Post"}</Text>
          </TouchableOpacity>
        }
        rightHeader={
          <TouchableOpacity
            onPress={() => {
              if (description?.length == 0 && postImageFile?.length == 0) {
                Alert.alert("Please add description or post image");
              } else {
                handlePost();
              }
            }}
            style={{ alignItems: "center" }}
          >
            {isLoading ? (
              <ActivityIndicator color={"#f9fafb"} size={"small"} />
            ) : (
              <Text
                style={{
                  color: "rgba(7, 182, 213, 1)",
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                Add Post
              </Text>
            )}
          </TouchableOpacity>
        }
        containerStyle={{
          backgroundColor: "rgba(17, 24, 40, 1)",
          // height: 90,
          paddingTop: height(7),
          marginTop: 0,
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View
          style={{
            paddingHorizontal: 20,
            marginTop: 34,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <UserAvatar
            size={totalSize(7)}
            src={
              userData?.userData?.profilePic !== ""
                ? userData?.userData?.profilePic
                : appImages?.dummyUrl
            }
          />
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "600",
              marginLeft: 15,
            }}
          >
            {userData?.userData.name}
          </Text>
        </View>
        <View style={{ flexDirection: "row", paddingHorizontal: 20 }}>
          <TextInput
            style={{
              height: height(10),
              flex: 1,
              color: "white",
              fontSize: description == "" ? totalSize(2) : totalSize(1.5),
            }}
            placeholder={`Enter post description`}
            placeholderTextColor="rgba(164, 164, 164, 1)"
            value={description}
            onChangeText={(text) => setDescription(text)}
            multiline
          />
          <TouchableOpacity onPress={() => setImagePicker(true)}>
            <Image
              source={require("../constants/icons/Add-Icon.png")}
              style={{ height: 32, width: 32 }}
            />
          </TouchableOpacity>
        </View>
        {postImageFile?.map((item, index) => (
          <View key={index} style={{ marginVertical: 10 }}>
            {item?.type == "video/mp4" ? (
              <VideoPlayer
                video={{ uri: item?.url }}
                videoWidth={width(100)}
                videoHeight={height(30)}
                autoplay={false}
                resizeMode={"cover"}
                disableFullscreen={true}
              />
            ) : (
              <Image
                source={{ uri: item?.url }}
                style={{ height: item?.height, width: item?.width }}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => removeImage(item)}
            >
              <AntDesign name="close" color={"#fff"} size={totalSize(2)} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ marginVertical: height(2) }} />
      </ScrollView>
      {imagePicker && (
        <ImageOptionsModal
          isVisible={imagePicker}
          onClose={() => setImagePicker(false)}
          onCamera={handleCameraPick}
          onGallery={handleImagePick}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(24, 33, 48, 1)",
  },
  heading: {
    color: "#fff",
    fontSize: totalSize(2),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "500",
    marginLeft: width(2),
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  input: {
    backgroundColor: "lightgrey",
    borderRadius: 8,
    paddingHorizontal: width(2),
    marginBottom: 16,
    marginTop: height(5),
    marginHorizontal: width(5),
    paddingVertical: height(2),
    height: height(10),
    fontSize: totalSize(1.7),
    textAlignVertical: "top",
  },
  imageButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    padding: "5%",
    alignItems: "center",
    marginTop: height(5),
    backgroundColor: "gray",
    marginHorizontal: width(5),
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeBtn: {
    position: "absolute",
    top: height(3),
    right: 5,
    height: totalSize(3),
    width: totalSize(3),
    borderRadius: totalSize(3),
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CreatePost;
