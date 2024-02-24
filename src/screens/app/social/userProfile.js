import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateDocument,
  getDocumentById,
  createDocument,
  getuserPosts,
} from "../../../api/firebase/db";
import { fetchUserData } from "../../../api/features/user/userDataSlice";
import { height, totalSize, width } from "react-native-dimension";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { PostList } from "../../../components/postList";
import { appImages } from "../../../constants/images";
import { PostComments } from "../../../components/postComments";
import { convertToInternationalCurrencySystem } from "../../../utils/helpingMethods";
import { goBack, navigate } from "../../../navigation/rootNavigation";
import { collections, routes } from "../../../constants/routes";
import { getRandomNumber } from "../../../utils/helpingMethods";
import moment from "moment";
import { sendNotify } from "../../../../Notification";
import Material from "react-native-vector-icons/MaterialIcons";

const UserProfile = ({ navigation, route }) => {
  const { userID } = route.params;
  const { userData } = useSelector((state) => state.userData);
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [isFollowLoading, setFollowLoading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [postComments, setPostComments] = useState(null);
  const [isRequestLoading, setRequestLoading] = useState(null);
  const [lastPost, setLastPost] = useState(0);
  const [postIndex, setPostIndex] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    getUserDetail();
    navigation.setOptions({
      title: "",
      headerLeft: () => (
        <TouchableOpacity onPress={() => goBack()}>
          <Image
            source={require("../../../constants/icons/arrow-left.png")}
            resizeMode="contain"
            style={{
              width: 25,
              height: 25,
            }}
          />
        </TouchableOpacity>
      ),
    });
  }, [userID]);

  const getUserDetail = async () => {
    setLoading(true);
    await getDocumentById(collections.users, userID?.toString())
      .then((response) => {
        setUser(response);
        if (!userData?.userData?.blockUsers?.includes(userID)) {
          getPost(response);
        }
      })
      .catch((err) => console.log("Error>>", err));
  };

  const getPost = async (user) => {
    let { newPosts, lastDocument } = await getuserPosts(user?.uid, lastPost);
    let posts = [...userPosts, ...newPosts];
    const arrayUniqueByKey = [
      ...new Map(posts.map((item) => [item["id"], item])).values(),
    ];
    setUserPosts(arrayUniqueByKey);
    setLastPost(lastDocument);
    setLoading(false);
  };

  const checkFollow = () => {
    if (user?.followers?.includes(userData?.id)) {
      return true;
    } else {
      return false;
    }
  };

  const checkRequested = () => {
    if (user?.requests?.includes(userData?.id)) {
      return true;
    } else {
      return false;
    }
  };

  const followUser = async () => {
    setFollowLoading(true);
    let updatedUser = {
      ...user,
      followers: [...user?.followers, userData?.id],
    };
    // console.log("Updated User>>", updatedUser);

    let currentUser = userData?.userData;
    currentUser = {
      ...currentUser,
      followings: [...currentUser?.followings, user?.uid],
    };
    // console.log("Updated Current User>>", currentUser?.followings);

    //Update the Selected User
    await updateDocument(collections.users, user?.uid, updatedUser).catch(() =>
      setFollowLoading(null)
    );
    //Update the Current User
    await updateDocument(collections.users, userData?.id, currentUser)
      .then(() => {
        dispatch(fetchUserData());
        getUserDetail();
      })
      .catch(() => setFollowLoading(false));
    if (user?.fcmToken) {
      await sendNotify({
        token: user?.fcmToken,
        title: `Fitgress`,
        msg: `${userData?.userData?.name} Follows you`,
      })
        .then((res) => console.log("Notify Response>>", res))
        .catch((err) => console.log("Notify Error>", err));
    }
    let data = {
      id: getRandomNumber(),
      notifyTo: user?.uid,
      notifyFrom: userData?.id,
      desc: `Following you`,
      createdAt: moment().valueOf(),
      notifyType: "userFollow",
      read: false,
    };
    await createDocument(collections.notification, data.id, data);
    setFollowLoading(false);
  };

  const unFollowUser = async () => {
    console.log("Unfolowing user!!");
    setFollowLoading(true);
    let userFilt = user?.followers?.filter((i) => {
      return i !== userData?.id;
    });
    let updatedUser = { ...user, followers: userFilt };
    // console.log("Updated User>>", user?.followers);

    let currentUser = userData?.userData;
    let currentUserFilt = currentUser?.followings?.filter((i) => {
      return i !== user?.uid;
    });
    currentUser = {
      ...currentUser,
      followings: currentUserFilt,
    };
    // console.log("Updated Current User>>", currentUser?.followings);

    await updateDocument(collections.users, user?.uid, updatedUser).catch(() =>
      setFollowLoading(null)
    );
    await updateDocument(collections.users, currentUser?.uid, currentUser)
      .then(() => {
        getUserDetail();
        dispatch(fetchUserData());
      })
      .catch(() => setFollowLoading(false));
    setFollowLoading(false);
  };

  const handleFollowRequest = async () => {
    setRequestLoading(true);
    if (checkRequested()) {
      let userFilt = user?.requests?.filter((i) => {
        return i !== userData?.id;
      });
      let updatedUser = { ...user, requests: userFilt };
      await updateDocument(collections.users, user?.uid, updatedUser).catch(
        () => setRequestLoading(false)
      );
    } else {
      let updatedUser = {
        ...user,
        requests: [...user?.requests, userData?.id],
      };
      await updateDocument(collections.users, user?.uid, updatedUser).catch(
        () => setRequestLoading(false)
      );
      let data = {
        id: getRandomNumber(),
        notifyTo: user?.uid,
        notifyFrom: userData?.id,
        desc: `requested to follow you`,
        createdAt: moment().valueOf(),
        notifyType: "followRequest",
        read: false,
      };
      await createDocument(collections.notification, data.id, data);
      if (user?.fcmToken) {
        await sendNotify({
          token: user?.fcmToken,
          title: `Fitgress`,
          msg: `${userData?.userData?.name} requested to follow you`,
        })
          .then((res) => console.log("Notify Response>>", res))
          .catch((err) => console.log("Notify Error>", err));
      }
    }
    getUserDetail();
    setRequestLoading(false);
  };

  const checkBlock = () => {
    if (userData?.userData?.blockUsers?.includes(userID)) {
      return true;
    } else {
      return false;
    }
  };

  const unBlockUser = async (user) => {
    setFollowLoading(user);
    let currentUser = userData?.userData;
    let currentUserFilt = currentUser?.blockUsers?.filter((i) => {
      return i !== user?.uid;
    });
    currentUser = {
      ...currentUser,
      blockUsers: currentUserFilt,
    };
    console.log("Updated Current User>>", currentUser);
    await updateDocument(collections.users, currentUser?.uid, currentUser)
      .then(() => {
        dispatch(fetchUserData());
        setTimeout(() => {
          getUserDetail();
        }, 2000);
      })
      .catch(() => setFollowLoading(null));
    setFollowLoading(null);
  };

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
    <SafeAreaView className="bg-gray-900 flex-1">
      {user ? (
        <FlatList
          data={userPosts}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={getUserDetail} />
          }
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          ListHeaderComponent={() => (
            <View>
              <View style={[styles.userTopDetaiView, styles.row]}>
                <UserAvatar
                  size={totalSize(10)}
                  src={
                    user?.profilePic !== ""
                      ? user?.profilePic
                      : appImages.dummyUrl
                  }
                />
                <View style={{ width: width(60) }}>
                  <View style={styles.row}>
                    <Pressable
                      style={{ alignItems: "center" }}
                      onPress={() => {
                        user?.profileType == "public" ||
                        (user?.profileType == "private" && checkFollow())
                          ? navigate(routes.userFollowers, {
                              type: "followers",
                              userID: userID,
                            })
                          : console.log("");
                      }}
                    >
                      <Text style={styles.profileValue}>
                        {convertToInternationalCurrencySystem(
                          user?.followers?.length
                        )}
                      </Text>
                      <Text style={{ color: "#B0B0B0" }}>Followers</Text>
                    </Pressable>
                    <Pressable
                      style={{ alignItems: "center" }}
                      onPress={() => {
                        user?.profileType == "public" ||
                        (user?.profileType == "private" && checkFollow())
                          ? navigate(routes.userFollowers, {
                              type: "followings",
                              userID: userID,
                            })
                          : console.log("");
                      }}
                    >
                      <Text style={styles.profileValue}>
                        {convertToInternationalCurrencySystem(
                          user?.followings?.length
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
                  {checkBlock() ? (
                    <TouchableOpacity
                      style={[
                        styles.followBtn,
                        {
                          backgroundColor: checkBlock() ? "#163041" : "#0891b2",
                        },
                      ]}
                      onPress={() => unBlockUser(user)}
                    >
                      {isFollowLoading ? (
                        <ActivityIndicator size={"small"} color={"#f9fafb"} />
                      ) : (
                        <Text
                          style={[
                            styles.followBtnTxt,
                            { color: checkBlock() ? "#22d3ee" : "#fff" },
                          ]}
                        >
                          {"Unblock"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View>
                      {user?.profileType == "private" && !checkFollow() ? (
                        <TouchableOpacity
                          style={[
                            styles.followBtn,
                            {
                              backgroundColor: checkFollow()
                                ? "#163041"
                                : checkRequested()
                                ? "#163041"
                                : "#0891b2",
                            },
                          ]}
                          onPress={() => {
                            handleFollowRequest();
                          }}
                        >
                          {isRequestLoading ? (
                            <ActivityIndicator
                              size={"small"}
                              color={"#f9fafb"}
                            />
                          ) : (
                            <Text
                              style={[
                                styles.followBtnTxt,
                                {
                                  color: checkFollow()
                                    ? "#22d3ee"
                                    : checkRequested()
                                    ? "#22d3ee"
                                    : "#fff",
                                },
                              ]}
                            >
                              {checkFollow()
                                ? "Following"
                                : checkRequested()
                                ? "Requested"
                                : "Follow"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.followBtn,
                            {
                              backgroundColor: checkFollow()
                                ? "#163041"
                                : "#0891b2",
                            },
                          ]}
                          onPress={() => {
                            checkFollow() ? unFollowUser() : followUser();
                          }}
                        >
                          {isFollowLoading ? (
                            <ActivityIndicator
                              size={"small"}
                              color={"#f9fafb"}
                            />
                          ) : (
                            <Text
                              style={[
                                styles.followBtnTxt,
                                { color: checkFollow() ? "#22d3ee" : "#fff" },
                              ]}
                            >
                              {checkFollow() ? "Following" : "Follow"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
              <View
                style={{
                  ...styles.userTopDetaiView,
                  marginVertical: height(2),
                }}
              >
                <Text style={styles.profileName}>{user?.fullName}</Text>
                <Text style={{ color: "#B0B0B0" }}>{`@${user?.name}`}</Text>
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
                  >{` ${user?.totalWorkoutsCount ?? 0} workouts`}</Text>
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
                    user?.totalDuration
                      ? parseInt(user?.totalDuration / 3600)
                      : 0
                  } hours`}</Text>
                </View>
                <Text style={styles.profileBio}>{user?.bio}</Text>
                {user?.profileType == "private" && !checkFollow() && (
                  <View style={{ marginTop: height(10) }}>
                    <View style={styles.lockView}>
                      <Material
                        name="lock-outline"
                        size={totalSize(8)}
                        color={"#fff"}
                      />
                    </View>
                    <Text
                      style={{
                        color: "#B0B0B0",
                        fontSize: totalSize(2.2),
                        fontWeight: "700",
                        paddingTop: height(2),
                        textAlign: "center",
                      }}
                    >
                      This profile is private
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
          refreshing={postIndex}
          renderItem={({ item, index }) => {
            return (
              <>
                {user?.profileType == "public" ||
                (user?.profileType == "private" && checkFollow()) ? (
                  <PostList
                    item={item}
                    currentUser={userData}
                    userPosts={userPosts}
                    liked={item?.likes?.includes(userData?.id)}
                    dummyUrl={appImages?.dummyUrl}
                    onDone={() => getPost(user)}
                    setPostComments={setPostComments}
                    postIndex={postIndex}
                  />
                ) : null}
              </>
            );
          }}
          ListFooterComponent={() => <View style={{ height: height(30) }} />}
          ListEmptyComponent={() => {
            if (
              user?.profileType == "public" ||
              (user?.profileType == "private" && checkFollow())
            ) {
              return <Text style={styles.emptyTxt}>No Post Yet!</Text>;
            }
          }}
        />
      ) : (
        <Text
          style={{
            color: "#B0B0B0",
            fontSize: totalSize(2.2),
            fontWeight: "700",
            marginTop: height(30),
            textAlign: "center",
          }}
        >
          This user account is deleted!
        </Text>
      )}
      {postComments !== null && (
        <PostComments
          isVisible={postComments ? true : false}
          onClose={() => setPostComments(null)}
          postData={postComments}
          onDone={() => getPost(user)}
        />
      )}
    </SafeAreaView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    marginTop: height(3),
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    width: width(25),
    paddingVertical: height(0.6),
    borderRadius: totalSize(0.5),
    marginRight: width(4),
    alignItems: "center",
    justifyContent: "center",
  },
  btnTxt: {
    fontSize: totalSize(1.7),
    color: "#000",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userTopDetaiView: {
    paddingHorizontal: width(5),
    width: width(100),
    marginTop: height(1),
  },
  profileValue: {
    color: "#fff",
    fontWeight: "700",
    fontSize: totalSize(2),
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
  followBtn: {
    width: width(60),
    alignSelf: "center",
    paddingVertical: height(1),
    marginTop: height(1),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: totalSize(0.5),
  },
  followBtnTxt: {
    fontSize: totalSize(1.7),
    fontWeight: "600",
  },
  lockView: {
    backgroundColor: "rgba(7, 182, 213, 0.6)",
    height: totalSize(15),
    width: totalSize(15),
    borderRadius: totalSize(10),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  emptyTxt: {
    color: "grey",
    textAlign: "center",
    fontSize: totalSize(2),
    marginTop: height(20),
  },
});
