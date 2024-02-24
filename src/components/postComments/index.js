import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useRef, useMemo, useEffect } from "react";
import BottomSheet, { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { width, height, totalSize } from "react-native-dimension";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import Entypo from "react-native-vector-icons/Entypo";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { appImages } from "../../constants/images";
import moment from "moment";
import {
  addComment,
  deleteComment,
  getDocumentById,
  getPostComments,
  updateDocument,
  saveNotification,
} from "../../api/firebase/db";
import { useSelector } from "react-redux";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { collections } from "../../constants/routes";
import { getRandomNumber } from "../../utils/helpingMethods";
import { sendNotify } from "../../../Notification";
import Modal from "react-native-modal";

export const PostComments = ({ isVisible, onClose, postData, onDone }) => {
  const [comment, setComment] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [postComments, setPostComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentLimit, setCommentLimit] = useState(10);

  const { userData } = useSelector((state) => state?.userData);

  const bottomSheetRef = useRef(null);

  const postUserID = postData?.user?.userID;

  // variables
  const snapPoints = useMemo(() => ["63%", "90%"], []);

  useEffect(() => {
    if (isVisible == true) {
      bottomSheetRef?.current?.snapToIndex(0);
    }
  }, [isVisible]);

  const handleClose = () => {
    bottomSheetRef.current.close();
    onClose();
  };

  const handleSubmit = async () => {
    setCommentLoading(true);
    let newComment = {
      msg: comment,
      id: getRandomNumber(),
      userName: userData?.userData?.name,
      profilePic: userData?.userData?.profilePic,
      userID: userData?.id,
      createdAt: moment().valueOf(),
    };
    await addComment(postData?.id, newComment.id, newComment).then(() => {
      setComment("");
      setCommentLoading(false);
      getComments(commentLimit);
    });
    let post = await getDocumentById(collections.userPosts, postData?.id);
    let obj = { ...post, comments: [...post?.comments, newComment.id] };
    await updateDocument(collections.userPosts, postData?.id, obj).then(() =>
      onDone()
    );
    if (postUserID !== userData?.id) {
      handleNotificaion();
    }
  };

  const handleNotificaion = async () => {
    const user = await getDocumentById(collections.users, postUserID);
    if (user?.fcmToken) {
      await sendNotify({
        token: user?.fcmToken,
        title: `Fitgress`,
        msg: `${userData?.userData?.name} commented on your post`,
      })
        .then((res) => console.log("Notify Response>>", res))
        .catch((err) => console.log("Notify Error>", err));
    }
    let data = {
      id: getRandomNumber(),
      notifyTo: user?.uid,
      notifyFrom: userData?.id,
      desc: `commented on your post`,
      createdAt: moment().valueOf(),
      postID: postData?.id,
      read: false,
      notifyType: "commentPost",
    };
    if (userData?.id !== user?.uid) {
      await saveNotification(data.id, data).then(() =>
        console.log("Notification Saved!")
      );
    }
  };

  const handleDelete = async (comment) => {
    await deleteComment(postData?.id, comment?.id).then(() => {
      getComments(commentLimit);
    });
    let post = await getDocumentById(collections.userPosts, postData?.id);
    let commentArr = post?.comments?.filter((e) => e !== comment?.id);
    let obj = { ...item, comments: commentArr };
    await updateDocument(collections.userPosts, postData?.id, obj).then(() =>
      onDone()
    );
  };

  useEffect(() => {
    getComments(commentLimit);
  }, [postData, commentLimit]);

  const getComments = async (commentLimit) => {
    // console.log("Comment Limit>>", commentLimit);
    setLoading(true);
    let data = await getPostComments(postData?.id, commentLimit);
    data = data?.sort((a, b) => moment(b?.createdAt) - moment(a?.createdAt));
    setPostComments(data);
    setLoading(false);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={handleClose}
      onBackdropPress={handleClose}
      animationIn={"slideInUp"}
      style={{ width: "100%", marginLeft: 0, marginBottom: 0 }}
    >
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onClose={handleClose}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: "#182130" }}
        handleIndicatorStyle={{
          backgroundColor: "#fff",
          marginVertical: height(1),
        }}
      >
        <View style={styles.bottomNavigationView}>
          {/* <View style={[styles.row, styles.headingView]}>
          <View style={{ width: 30 }} />
          <Text style={styles.heading}>Comments</Text>
          <TouchableOpacity onPress={handleClose}>
            <AntDesign name="close" size={totalSize(3)} color={"#fff"} />
          </TouchableOpacity>
        </View> */}
          <View style={styles.flatlistView}>
            {isLoading ? (
              <ActivityIndicator
                color={"#f9fafb"}
                size={"large"}
                style={{ alignSelf: "center", marginTop: height(5) }}
              />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={postComments}
                keyExtractor={(_, index) => index.toString()}
                onScrollEndDrag={() => {
                  setCommentLimit(commentLimit + 10);
                }}
                renderItem={({ item }) => {
                  return (
                    <View style={[styles.row, styles.commentView]}>
                      <View style={styles.rowBasic}>
                        <UserAvatar
                          src={
                            item?.profilePic !== ""
                              ? item?.profilePic
                              : appImages.dummyUrl
                          }
                          size={totalSize(5)}
                        />
                        <View style={{ marginLeft: 10 }}>
                          <Text style={styles.userName}>
                            {item?.userName}
                            <Text style={styles.commentTime}>
                              {" - "}
                              {moment(item?.createdAt).fromNow()}
                            </Text>
                          </Text>
                          <Text style={styles.msg}>{item?.msg}</Text>
                        </View>
                      </View>
                      {userData.id == item?.userID && (
                        <Menu>
                          <MenuTrigger>
                            <Entypo
                              name="dots-three-vertical"
                              size={24}
                              color="#fff"
                            />
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
                            <MenuOption onSelect={() => handleDelete(item)}>
                              <Text style={styles.menuOptionText}>Delete</Text>
                            </MenuOption>
                          </MenuOptions>
                        </Menu>
                      )}
                    </View>
                  );
                }}
                ListEmptyComponent={() => (
                  <Text style={styles.emptyMsg}>No Comment Yet!</Text>
                )}
                ListFooterComponent={() => (
                  <View style={{ height: height(5) }} />
                )}
              />
            )}
          </View>
          <View style={[styles.inputContainer, styles.row]}>
            <BottomSheetTextInput
              value={comment}
              placeholder="Add a comment...."
              placeholderTextColor={"#B0B0B0"}
              onChangeText={(val) => setComment(val)}
              style={styles.input}
              onBlur={() => bottomSheetRef?.current?.snapToIndex(0)}
            />
            <TouchableOpacity
              disabled={comment?.length > 0 ? false : true}
              onPress={() => handleSubmit()}
            >
              {commentLoading ? (
                <ActivityIndicator color={"#f9fafb"} size={"small"} />
              ) : (
                <Feather name="send" color={"#0891B3"} size={totalSize(2.5)} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomNavigationView: {
    backgroundColor: "#111828",
    width: width(100),
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
  headingView: {
    width: width(100),
    paddingHorizontal: width(5),
  },
  heading: {
    color: "#fff",
    fontSize: totalSize(2),
    textAlign: "center",
    fontWeight: "700",
  },
  flatlistView: {
    height: height(45),
    width: width(100),
  },
  inputContainer: {
    width: width(90),
    alignSelf: "center",
    borderRadius: totalSize(0.5),
    paddingHorizontal: width(2),
    backgroundColor: "#182130",
    marginBottom: height(2),
  },
  input: {
    backgroundColor: "#fff",
    fontSize: totalSize(1.5),
    color: "#fff",
    paddingVertical: height(1.5),
    backgroundColor: "#182130",
    width: "80%",
  },
  emptyMsg: {
    marginTop: height(10),
    textAlign: "center",
    color: "lightgrey",
  },
  commentView: {
    marginHorizontal: width(2),
    marginVertical: height(1),
  },
  userName: {
    fontSize: totalSize(2),
    fontWeight: "600",
    color: "#fff",
  },
  commentTime: {
    fontSize: totalSize(1.5),
    color: "#B0B0B0",
  },
  msg: {
    width: width(70),
    color: "#B0B0B0",
  },
  menuOptionText: {
    fontSize: totalSize(2),
    color: "red",
  },
});
