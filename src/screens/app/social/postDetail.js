import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Header } from "../../../components/Header";
import { goBack } from "../../../navigation/rootNavigation";
import { width, height, totalSize } from "react-native-dimension";
import { useSelector } from "react-redux";
import { PostList } from "../../../components/postList";
import {
  getPostComments,
  getSinglePost,
  deleteComment,
  getDocumentById,
  updateDocument,
  addComment,
  deletePost,
} from "../../../api/firebase/db";
import moment from "moment";
import { collections } from "../../../constants/routes";
import { getRandomNumber } from "../../../utils/helpingMethods";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import Feather from "react-native-vector-icons/Feather";
import Entypo from "react-native-vector-icons/Entypo";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { appImages } from "../../../constants/images";

const PostDetail = ({ route }) => {
  const { postID } = route.params;
  //   console.log("Params>>", postID);
  const { userData } = useSelector((state) => state?.userData);

  const [postData, setPostData] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [commentLimit, setCommentLimit] = useState(10);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const textInputRef = useRef();

  useEffect(() => {
    if (postID) {
      getPost();
      getComments(commentLimit);
    }
  }, [postID]);

  const getPost = async () => {
    setLoading(true);
    let post = await getSinglePost(postID).catch(() => {
      setPostData(null);
    });
    // console.log(post);
    if (post) {
      setPostData(post);
    }
    setLoading(false);
  };

  const getComments = async (limit) => {
    let comments = await getPostComments(postID, limit);
    comments = comments?.sort(
      (a, b) => moment(b?.createdAt) - moment(a?.createdAt)
    );
    setPostComments(comments);
    setCommentLimit(limit);
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
    await addComment(postID, newComment.id, newComment).then(() => {
      setComment("");
      setCommentLoading(false);
      getComments(commentLimit + 5);
    });
    let post = await getDocumentById(collections.userPosts, postID);
    let obj = { ...post, comments: [...post?.comments, newComment.id] };
    await updateDocument(collections.userPosts, postID, obj).then(() =>
      getPost()
    );
  };

  const handlePostDelete = async () => {
    Alert.alert("Delete Post", "Are you sure, You want to delete the post?", [
      { text: "Cancel", onPress: () => console.log("cancel") },
      {
        text: "Confirm",
        onPress: async () => {
          await deletePost(postID)
            .then(() => {
              goBack();
            })
            .catch(() => {
              Alert.alert("", "Something wrong, Please try again later!");
            });
        },
      },
    ]);
  };

  const handleDelete = async (comment) => {
    await deleteComment(postID, comment?.id).then(() => {
      getComments(commentLimit + 5);
    });
    let post = await getDocumentById(collections.userPosts, postID);
    let commentArr = post?.comments?.filter((e) => e !== comment?.id);
    let obj = { ...item, comments: commentArr };
    await updateDocument(collections.userPosts, postID, obj).then(() =>
      getPost()
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111827" }}>
      <Header
        onBack={false}
        leftHeader={
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={goBack}
          >
            <Image
              source={require("../../../constants/icons/arrow-left.png")}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
              }}
            />
            <Text style={styles.heading}>Post</Text>
          </TouchableOpacity>
        }
        containerStyle={{ paddingBottom: height(2) }}
      />
      {isLoading && (
        <ActivityIndicator
          size={"large"}
          style={styles.indicator}
          color={"#f9fafb"}
        />
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: height(15) }}
      >
        {postData !== null ? (
          <>
            <PostList
              item={postData}
              currentUser={userData}
              liked={postData?.likes?.includes(userData?.id)}
              dummyUrl={appImages?.dummyUrl}
              onDone={() => getPost()}
              setPostComments={() => textInputRef?.current?.focus()}
              postIndex={true}
              handleDelete={() => handlePostDelete()}
            />
            {postComments?.length > 0 ? (
              <>
                {postComments?.map((item, index) => {
                  return (
                    <View style={[styles.row, styles.commentView]} key={index}>
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
                })}
              </>
            ) : (
              <Text style={styles.emptyMsg}>No Comment Yet!</Text>
            )}
          </>
        ) : (
          <Text style={styles.postMsg}>Post is unavailable!</Text>
        )}
      </ScrollView>
      {postData !== null && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            flex: 1,
            position: "absolute",
            bottom: height(0),
            alignItems: "center",
            width: width(100),
            backgroundColor: "#111827",
          }}
        >
          <View style={[styles.inputContainer, styles.row]}>
            <TextInput
              ref={textInputRef}
              value={comment}
              placeholder="Add a comment...."
              placeholderTextColor={"#B0B0B0"}
              onChangeText={(val) => setComment(val)}
              style={styles.input}
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
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

export default PostDetail;

const styles = StyleSheet.create({
  heading: {
    paddingLeft: width(2),
    color: "#fff",
    fontSize: totalSize(2),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "500",
  },
  indicator: {
    position: "absolute",
    top: height(30),
    alignSelf: "center",
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowBasic: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputContainer: {
    width: width(95),
    alignSelf: "center",
    borderRadius: totalSize(1),
    paddingHorizontal: width(2),
    backgroundColor: "#182130",
    marginBottom: height(4),
  },
  input: {
    backgroundColor: "#fff",
    fontSize: totalSize(1.5),
    color: "#fff",
    paddingVertical: height(1.5),
    backgroundColor: "#182130",
    width: "80%",
  },
  postMsg: {
    marginTop: height(30),
    textAlign: "center",
    color: "lightgrey",
    fontSize: totalSize(2),
  },
});
