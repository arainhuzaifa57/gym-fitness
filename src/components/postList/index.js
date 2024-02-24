import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
  TextInput,
  Linking,
} from "react-native";
import React, { useState } from "react";
import moment from "moment";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { width, height, totalSize } from "react-native-dimension";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import {
  updateDocument,
  getDocumentById,
  saveNotification,
  deletePost,
} from "../../api/firebase/db";
import { convertToInternationalCurrencySystem } from "../../utils/helpingMethods";
import ViewMoreText from "react-native-view-more-text";
import { collections, routes } from "../../constants/routes";
import { sendNotify } from "../../../Notification";
import { getRandomNumber } from "../../utils/helpingMethods";
import { HorizontalPost } from "../horizontalPost";
import { navigate } from "../../navigation/rootNavigation";
import Modal from "react-native-modal";
import { Header } from "../Header";
import { appImages } from "../../constants/images";
import email from "react-native-email";

export const PostList = ({
  item,
  currentUser,
  dummyUrl,
  onDone,
  setPostComments,
  liked,
  postIndex,
}) => {
  const [reportPost, setReportPost] = useState(null);
  const Options = [
    "Spam",
    "Abusive Post",
    "Hate Speech",
    "False Information",
    "Something else",
  ];
  const [selectedOption, setSelectedOption] = useState("");
  const [otherInput, setOtherInput] = useState("");
  const handleLike = (type, item) => {
    let post;
    if (type == "like") {
      post = { ...item, likes: [...item?.likes, currentUser?.id] };
    } else {
      let likeArr = item?.likes?.filter((e) => e !== currentUser?.id);
      post = { ...item, likes: likeArr };
    }
    updateDocument(collections.userPosts, item?.id, post)
      .then(() => onDone())
      .catch((err) => console.log("Error while like the post>>", err));
    if (type == "like" && currentUser?.id !== item?.user?.userID) {
      handleNotificaion(item?.user?.userID, item);
    }
  };

  const handleNotificaion = async (userID, post) => {
    const user = await getDocumentById(collections.users, userID);
    if (user?.fcmToken) {
      await sendNotify({
        token: user?.fcmToken,
        title: `Fitgress`,
        msg: `${currentUser?.userData?.name} likes your post`,
      })
        .then((res) => console.log("Notify Response>>", res))
        .catch((err) => console.log("Notify Error>", err));
    }
    let data = {
      id: getRandomNumber(),
      notifyTo: user?.uid,
      notifyFrom: currentUser?.id,
      desc: `likes your post`,
      createdAt: moment().valueOf(),
      postID: post?.id,
      read: false,
      notifyType: "likePost",
    };
    if (user?.uid !== currentUser?.id) {
      await saveNotification(data.id, data).then(() =>
        console.log("Notification Saved!")
      );
    }
  };

  const handleDelete = async (docId) => {
    Alert.alert("Delete Post", "Are you sure, You want to delete the post?", [
      { text: "Cancel", onPress: () => console.log("cancel") },
      {
        text: "Confirm",
        onPress: async () => {
          await deletePost(docId)
            .then(() => {
              onDone();
            })
            .catch(() => {
              Alert.alert("", "Something wrong, Please try again later!");
            });
        },
      },
    ]);
  };

  const renderViewMore = (onPress) => {
    return (
      <Text onPress={onPress} style={{ color: "#fff", fontWeight: "700" }}>
        ... more
      </Text>
    );
  };
  const renderViewLess = (onPress) => {
    return (
      <Text onPress={onPress} style={{ color: "#fff", fontWeight: "700" }}>
        Show less
      </Text>
    );
  };

  return (
    <>
      <View style={styles.cardMainView}>
        <View style={styles.cardInnerView}>
          <View
            style={{
              ...styles.row,
              paddingHorizontal: width(5),
              paddingVertical: height(1),
            }}
          >
            <View style={styles.rowBasic}>
              <TouchableOpacity
                onPress={() => {
                  if (currentUser?.id == item?.user?.userID) {
                    navigate(routes.profile);
                  } else {
                    navigate(routes.userProfile, {
                      userID: item?.user?.userID,
                    });
                  }
                }}
              >
                <Image
                  source={{
                    uri:
                      item?.user?.profilePic !== ""
                        ? item?.user?.profilePic
                        : dummyUrl,
                  }}
                  resizeMode="contain"
                  style={styles.profilePic}
                />
              </TouchableOpacity>
              <View style={{ paddingLeft: width(1.5) }}>
                <Text
                  style={styles.profileName}
                  onPress={() => {
                    if (currentUser?.id == item?.user?.userID) {
                      navigate(routes.profile);
                    } else {
                      navigate(routes.userProfile, {
                        userID: item?.user?.userID,
                      });
                    }
                  }}
                >
                  {item?.user?.fullName ?? "Unknown"}
                </Text>
                <View style={styles.rowBasic}>
                  <Text style={{ color: "#B0B0B0" }}>
                    {`@${item?.user?.userName}`}
                  </Text>
                  <Text style={styles.postTime}>
                    {moment(item?.createdAt).fromNow()}
                  </Text>
                </View>
              </View>
            </View>
            <Menu>
              <MenuTrigger>
                <Entypo name="dots-three-vertical" size={24} color="#fff" />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    marginTop: height(4),
                    width: width(30),
                    backgroundColor: "#232E41",
                    borderRadius: 5,
                  },
                }}
              >
                {currentUser?.id == item?.user?.userID && (
                  <MenuOption onSelect={() => handleDelete(item?.id)}>
                    <Text style={styles.menuOptionText}>Delete</Text>
                  </MenuOption>
                )}
                {currentUser?.id !== item?.user?.userID && (
                  <MenuOption onSelect={() => setReportPost(item)}>
                    <Text style={{ fontSize: totalSize(2), color: "#fff" }}>
                      Report
                    </Text>
                  </MenuOption>
                )}
              </MenuOptions>
            </Menu>
          </View>
          {item?.description && (
            <View
              style={{
                marginVertical: height(1),
                paddingHorizontal: width(5),
              }}
            >
              <ViewMoreText
                numberOfLines={2}
                renderViewMore={renderViewMore}
                renderViewLess={renderViewLess}
              >
                <Text style={styles.postDesc}>{item?.description}</Text>
              </ViewMoreText>
            </View>
          )}
          {item?.postImages?.length > 0 && (
            <HorizontalPost postData={item?.postImages} postIndex={postIndex} />
          )}
        </View>
        <View
          style={{
            ...styles.rowBasic,
            paddingHorizontal: width(5),
            paddingTop: height(2),
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            style={{ paddingRight: width(4), alignItems: "center" }}
            onPress={() => {
              handleLike(liked ? "disLike" : "like", item);
            }}
          >
            <AntDesign
              name={liked ? "heart" : "hearto"}
              color={liked ? "#EE2922" : "#fff"}
              size={totalSize(2.5)}
            />
            <Text style={styles.socialTxt}>
              {convertToInternationalCurrencySystem(item?.likes?.length)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPostComments(item)}
            style={{ paddingRight: width(4), alignItems: "center" }}
          >
            <Ionicons
              name="chatbox-outline"
              color={"#fff"}
              size={totalSize(2.5)}
            />
            <Text style={styles.socialTxt}>
              {convertToInternationalCurrencySystem(item?.comments?.length)}
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => {}} style={{ alignItems: "center" }}>
          <MaterialCommunityIcons
            name="share-outline"
            color={"#fff"}
            size={totalSize(2.5)}
          />
          <Text style={styles.socialTxt}>
            {item?.shares?.length > 0
              ? convertToInternationalCurrencySystem(item?.shares?.length)
              : 0}
          </Text>
        </TouchableOpacity> */}
        </View>
      </View>
      <Modal
        isVisible={reportPost ? true : false}
        onBackButtonPress={() => setReportPost(null)}
        animationType="slide"
        statusBarTranslucent
        style={styles.container}
      >
        <Header
          onBack={false}
          leftHeader={
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => {
                setReportPost(null);
              }}
            >
              <Image
                source={require("../../constants/icons/arrow-left.png")}
                resizeMode="contain"
                style={{
                  width: 24,
                  height: 24,
                }}
              />
              <Text style={styles.heading}>{"Report Post"}</Text>
            </TouchableOpacity>
          }
          containerStyle={{
            backgroundColor: "rgba(17, 24, 40, 1)",
            paddingTop: height(5),
            marginTop: 0,
          }}
        />
        {Options?.map((item, index) => {
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: height(4),
                marginHorizontal: width(4),
              }}
            >
              <Pressable
                onPress={() => {
                  setSelectedOption(item);
                }}
              >
                <Image
                  source={
                    selectedOption == item ? appImages.check : appImages.unCheck
                  }
                  style={styles.icon}
                />
              </Pressable>
              <Text style={styles.termsTxt}>{item}</Text>
            </View>
          );
        })}
        {selectedOption == "Something else" && (
          <TextInput
            style={styles.reportInput}
            placeholder="Write your issue..."
            placeholderTextColor={"lightgrey"}
            multiline
            value={otherInput}
            onChangeText={(val) => setOtherInput(val)}
          />
        )}
        <TouchableOpacity
          style={styles.modalBtn}
          onPress={() => {
            if (selectedOption.length > 0) {
              const to = ["ryan.le@fitgress.io"]; // string or array of email addresses
              email(to, {
                subject: `Report on ${
                  selectedOption !== "Something else" && selectedOption
                } Post`,
                body: `Dear Fitgress Team,

                I hope this email finds you well. I am writing to bring to your attention a matter that requires prompt attention and appropriate action. I have identified a user post on your platform that raises concerns due to its inappropriate content.
                
                User Information:
              
                Username: ${reportPost?.user?.userName}
                Full Name: ${reportPost?.user?.fullName}
  
                Description of the Inappropriate Post:
                ${
                  selectedOption !== "Something else"
                    ? reportPost?.description
                    : otherInput
                }
                
                Request for Action:
                I kindly request that you investigate this matter further and take appropriate action as deemed necessary according to your platform's guidelines and policies. If additional information is needed, please do not hesitate to contact me.
                
                Contact Information:
  
                UserName:${currentUser?.userData?.name}
                Full Name: ${currentUser?.userData?.fullName}
                User Email: ${currentUser?.userData?.email}
                
                I appreciate your prompt attention to this matter and your commitment to maintaining a safe and respectful online environment for us.
                
                Thank you for your cooperation.`,
                checkCanOpen: false, // Call Linking.canOpenURL prior to Linking.openURL
              }).catch(console.error);
            } else {
              Alert.alert(
                "Report Post",
                "Please select any option to continue"
              );
            }
          }}
        >
          <Text
            className="text-center text-gray-700 font-ibmMedium text-xl"
            style={{ color: "white", fontWeight: "600" }}
          >
            Submit
          </Text>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardMainView: {
    marginVertical: height(1),
  },
  cardInnerView: {
    backgroundColor: "#182130",
    paddingTop: height(1),
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowBasic: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuOptionText: {
    fontSize: totalSize(2),
    color: "red",
  },
  profilePic: {
    height: totalSize(4),
    width: totalSize(4),
    borderRadius: totalSize(3),
  },
  profileName: {
    color: "#fff",
    fontSize: totalSize(1.8),
    fontWeight: "700",
  },
  postDesc: {
    color: "#fff",
    fontSize: totalSize(1.7),
    fontWeight: "500",
  },
  socialTxt: {
    color: "#fff",
    fontSize: totalSize(1.5),
    paddingVertical: height(1),
    fontWeight: "600",
  },
  postTime: {
    color: "lightgrey",
    fontSize: totalSize(1.2),
    paddingLeft: width(2),
  },
  //Report Post
  container: {
    flex: 1,
    backgroundColor: "rgba(24, 33, 48, 1)",
    marginHorizontal: 0,
    justifyContent: "flex-start",
  },
  heading: {
    color: "#fff",
    fontSize: totalSize(2),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "500",
    marginLeft: width(2),
  },
  modalBtn: {
    alignSelf: "center",
    backgroundColor: "#0891b2",
    height: height(5),
    width: width(90),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: height(5),
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
  reportInput: {
    height: height(10),
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#B0B0B0",
    paddingHorizontal: totalSize(1),
    paddingVertical: height(1),
    width: width(90),
    marginTop: height(2),
    alignSelf: "center",
    borderRadius: totalSize(1),
    color: "#fff",
  },
});
