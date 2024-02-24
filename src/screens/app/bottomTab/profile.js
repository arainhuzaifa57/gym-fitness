import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  StatusBar,
  FlatList,
  Image,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { width, height, totalSize } from "react-native-dimension";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { useSelector } from "react-redux";
import {
  getuserPosts,
  deletePost,
  getNotifications,
} from "../../../api/firebase/db";
import CreatePost from "../../../components/createPostModal";
import { PostList } from "../../../components/postList";
import Ionicons from "react-native-vector-icons/Ionicons";
import { appImages } from "../../../constants/images";
import { convertToInternationalCurrencySystem } from "../../../utils/helpingMethods";
import { PostComments } from "../../../components/postComments";
import moment from "moment";
import { navigate } from "../../../navigation/rootNavigation";
import { routes } from "../../../constants/routes";
import FollowingPosts from "../social/followingPosts";
import { Badge } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreen = ({ navigation }) => {
  const [tab, setTab] = useState(1);
  const [userPosts, setUserPosts] = useState([]);
  const [showCreateModal, setCreateModal] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [postComments, setPostComments] = useState(null);
  const [showDot, setShowDot] = useState(false);
  const [postIndex, setPostIndex] = useState(false);
  const [lastPost, setLastPost] = useState(0);
  const [Refresh, setResfresh] = useState(false);

  const { userData } = useSelector((state) => state?.userData);
  // console.log("User>>", userData);

  useFocusEffect(
    useCallback(() => {
      getNotify();
    }, [])
  );

  useEffect(() => {
    if (userData) {
      getPost();
    }
    navigation.setOptions({
      headerShown: false,
      statusBarHidden: true,
      statusBarTranslucent: true,
    });
  }, [userData]);

  const getNewPost = async () => {
    let { newPosts, lastDocument } = await getuserPosts(userData?.id, lastPost);
    setUserPosts(newPosts);
    setLastPost(lastDocument);
    setResfresh(!Refresh);
  };

  const getPost = async () => {
    let { newPosts, lastDocument } = await getuserPosts(userData?.id, lastPost);
    // console.log("New Posts>>", newPosts);
    let posts = [...userPosts, ...newPosts];
    const arrayUniqueByKey = [
      ...new Map(posts.map((item) => [item["id"], item])).values(),
    ];
    setUserPosts(arrayUniqueByKey);
    setLastPost(lastDocument);
    setLoading(false);
    setResfresh(!Refresh);
  };

  async function getNotify() {
    let notify = await getNotifications(userData?.id);
    // console.log("Notify>>", notify);
    const hasNotify = notify.some(function (item) {
      return item.read === false;
    });
    setShowDot(hasNotify);
  }

  const onViewRef = useRef((viewable) => {
    // console.log("Visible items>>", viewable?.viewableItems);
    let viewableItem = viewable?.viewableItems;
    // console.log("Changed in this iteration", viewableItem[0]?.item?.postImages[0]);
    if (viewableItem?.length > 0) {
      if (
        viewableItem[0]?.isViewable == true &&
        viewableItem[0]?.item?.postImages[0]?.fileType == "video/mp4"
      ) {
        setPostIndex(true);
      } else {
        setPostIndex(false);
      }
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar translucent barStyle={"light-content"} />
      {tab == 0 ? (
        <FollowingPosts tab={tab} setSelectedTab={setTab} />
      ) : (
        <>
          {isLoading && (
            <ActivityIndicator
              color={"#f9fafb"}
              size={"large"}
              style={styles.indicator}
            />
          )}
          <View style={styles.tabsView}>
            <TouchableOpacity style={styles.tabBtn} onPress={() => setTab(0)}>
              <Text
                style={tab == 0 ? styles.selectedTabBtnTxt : styles.tabBtnTxt}
              >
                Following
              </Text>
              <View
                style={{
                  width: width(10),
                  height: 2,
                  backgroundColor: tab == 0 ? "#fff" : "transparent",
                  marginTop: height(1),
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn} onPress={() => setTab(1)}>
              <Text
                style={tab == 1 ? styles.selectedTabBtnTxt : styles.tabBtnTxt}
              >
                Your Profile
              </Text>
              <View
                style={{
                  width: width(10),
                  height: 2,
                  backgroundColor: tab == 1 ? "#fff" : "transparent",
                  marginTop: height(1),
                }}
              />
            </TouchableOpacity>
            <View style={styles.headerBtns}>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => navigate(routes.notification)}
              >
                <Ionicons
                  name="notifications-outline"
                  color={"#fff"}
                  size={totalSize(2.4)}
                />
                {showDot && <Badge size={totalSize(1)} style={styles.dot} />}
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={userPosts?.sort(
              (a, b) => moment(b.createdAt) - moment(a.createdAt)
            )}
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={viewConfigRef.current}
            onEndReached={() => getPost()}
            ListHeaderComponent={() => (
              <View>
                <View style={[styles.userTopDetaiView, styles.row]}>
                  <UserAvatar
                    size={totalSize(10)}
                    src={
                      userData?.userData?.profilePic !== ""
                        ? userData?.userData?.profilePic
                        : appImages.dummyUrl
                    }
                  />
                  <View style={{ width: width(60) }}>
                    <View style={styles.row}>
                      <Pressable
                        style={{ alignItems: "center" }}
                        onPress={() => {
                          navigate(routes.userFollowers, {
                            type: "followers",
                            userID: userData?.id,
                          });
                        }}
                      >
                        <Text style={styles.profileValue}>
                          {convertToInternationalCurrencySystem(
                            userData?.userData?.followers?.length
                          )}
                        </Text>
                        <Text style={{ color: "#B0B0B0" }}>Followers</Text>
                      </Pressable>
                      <Pressable
                        style={{ alignItems: "center" }}
                        onPress={() => {
                          navigate(routes.userFollowers, {
                            type: "followings",
                            userID: userData?.id,
                          });
                        }}
                      >
                        <Text style={styles.profileValue}>
                          {convertToInternationalCurrencySystem(
                            userData?.userData?.followings?.length
                          )}
                        </Text>
                        <Text style={{ color: "#B0B0B0" }}>Following</Text>
                      </Pressable>
                      <Pressable style={{ alignItems: "center" }}>
                        <Text style={styles.profileValue}>
                          {convertToInternationalCurrencySystem(
                            userPosts?.length ?? 0
                          )}
                        </Text>
                        <Text style={{ color: "#B0B0B0" }}>Posts</Text>
                      </Pressable>
                    </View>
                    <View style={[styles.row, { marginTop: 10 }]}>
                      <TouchableOpacity
                        style={{
                          ...styles.profileBtn,
                          backgroundColor: "#182130",
                        }}
                        onPress={() => navigate(routes.settings)}
                      >
                        <Text style={styles.profileBtnTxt}>Settings</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          ...styles.profileBtn,
                          backgroundColor: "#0891B3",
                        }}
                        onPress={() => setCreateModal(true)}
                      >
                        <Text style={styles.profileBtnTxt}>Create Post</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    ...styles.userTopDetaiView,
                    marginVertical: height(2),
                  }}
                >
                  <Text style={styles.profileName}>
                    {userData?.userData?.fullName}
                  </Text>
                  <Text
                    style={{ color: "#B0B0B0" }}
                  >{`@${userData?.userData?.name}`}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: height(1),
                    }}
                  >
                    <Image
                      source={require("../../../constants/icons/dumbell.png")}
                      style={{ height: 20, width: 20, tintColor: "#fff" }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{ color: "#fff", fontSize: totalSize(1.7) }}
                    >{` ${
                      userData?.userData?.totalWorkoutsCount ?? 0
                    } workouts`}</Text>
                    <View
                      style={{
                        borderWidth: 0.7,
                        borderColor: "#fff",
                        height: height(2),
                        marginHorizontal: 5,
                      }}
                    />
                    <Image
                      source={require("../../../constants/icons/timer-stopwatch.png")}
                      style={{ height: 20, width: 20, tintColor: "#fff" }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{ color: "#fff", fontSize: totalSize(1.7) }}
                    >{` ${
                      userData?.userData?.totalDuration
                        ? parseInt(userData?.userData?.totalDuration / 3600)
                        : 0
                    } hours`}</Text>
                  </View>
                  <Text style={styles.profileBio}>
                    {userData?.userData?.bio}
                  </Text>
                </View>
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
            refreshing={Refresh}
            renderItem={({ item }) => {
              return (
                <PostList
                  item={item}
                  currentUser={userData}
                  userPosts={userPosts}
                  liked={item?.likes?.includes(userData?.id)}
                  dummyUrl={appImages?.dummyUrl}
                  onDone={() => getNewPost()}
                  setPostComments={setPostComments}
                  postIndex={postIndex}
                />
              );
            }}
            ListFooterComponent={() => <View style={{ height: height(0) }} />}
            ListEmptyComponent={() => (
              <Text style={styles.emptyTxt}>No Post Yet!</Text>
            )}
          />
          <CreatePost
            isVisible={showCreateModal}
            onClose={() => setCreateModal(false)}
            onDone={getPost}
          />
          {postComments !== null && (
            <PostComments
              isVisible={postComments ? true : false}
              onClose={() => setPostComments(null)}
              postData={postComments}
              onDone={getPost}
            />
          )}
        </>
      )}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  tabsView: {
    marginBottom: height(1),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: width(100),
    marginTop: height(7),
  },
  tabBtn: {
    width: width(23),
    marginHorizontal: width(1),
    paddingBottom: height(1),
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnTxt: {
    fontSize: totalSize(1.7),
    color: "grey",
  },
  selectedTabBtnTxt: {
    fontSize: totalSize(1.7),
    color: "#fff",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userTopDetaiView: {
    paddingHorizontal: width(5),
    width: width(100),
  },
  profileValue: {
    color: "#fff",
    fontWeight: "700",
    fontSize: totalSize(2),
  },
  profileBtn: {
    width: width(28),
    // paddingHorizontal: width(5),
    paddingVertical: height(1.5),
    borderRadius: totalSize(1),
    justifyContent: "center",
    alignItems: "center",
  },
  profileBtnTxt: {
    color: "#fff",
    fontWeight: "500",
    fontSize: totalSize(1.5),
  },
  profileName: {
    color: "#fff",
    fontSize: totalSize(2.4),
    fontWeight: "700",
  },
  profileBio: {
    color: "#fff",
    fontSize: totalSize(1.7),
    textAlign: "left",
    paddingTop: height(1.5),
  },
  headerBtns: {
    position: "absolute",
    top: -8,
    right: width(2),
    flexDirection: "row",
    alignItems: "center",
  },
  shareBtn: {
    backgroundColor: "#182130",
    height: totalSize(4),
    width: totalSize(4),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: totalSize(2),
  },
  dot: {
    position: "absolute",
    top: height(1),
    right: width(2),
  },
  indicator: {
    position: "absolute",
    top: height(30),
    alignSelf: "center",
    zIndex: 1000,
  },
  emptyTxt: {
    color: "grey",
    textAlign: "center",
    fontSize: totalSize(2),
    marginTop: height(20),
  },
});
