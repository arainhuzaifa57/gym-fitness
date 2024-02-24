import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
  Pressable,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createDocument,
  getAllUser,
  updateDocument,
} from "../../../api/firebase/db";
import {
  fetchUserData,
  saveAllUsers,
} from "../../../api/features/user/userDataSlice";
import { height, totalSize, width } from "react-native-dimension";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { appImages } from "../../../constants/images";
import { navigate } from "../../../navigation/rootNavigation";
import { collections, routes } from "../../../constants/routes";
import { useFocusEffect } from "@react-navigation/native";
// import { sendNotify } from "../../../../Notification";
// import { getRandomNumber } from "../../../utils/helpingMethods";
// import moment from "moment";

const SearchPage = () => {
  const { userData, allUsers } = useSelector((state) => state.userData);
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [tempUsers, setTempUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setLoading] = useState(false);
  // const [isFollowLoading, setFollowLoading] = useState(null);
  // const [isRequestLoading, setRequestLoading] = useState(null);

  useFocusEffect(
    useCallback(() => {
      filterUsers("");
    }, [])
  );

  useEffect(() => {
    getUsers();
  }, [userData]);

  const getUsers = async () => {
    setLoading(true);
    if (allUsers?.length > 0) {
      let filt = allUsers?.filter((item) => {
        return !item?.blockUsers?.includes(userData.id);
      });
      setTempUsers(filt);
    } else {
      let user = await getAllUser(userData?.id);
      if (user?.length > 0) {
        //setUsers(user);
        let filt = user?.filter((item) => {
          return !item?.blockUsers?.includes(userData.id);
        });
        setTempUsers(filt);
        dispatch(saveAllUsers(filt));
      }
    }
    setLoading(false);
  };

  const filterUsers = (search) => {
    setSearch(search);
    if (search?.length > 0) {
      let filt = tempUsers?.filter((i) => {
        let name = i?.name?.toLowerCase();
        return name?.includes(search?.toLowerCase());
      });
      setUsers(filt);
    } else {
      setUsers([]);
    }
  };

  // const checkFollow = (id) => {
  //   if (userData?.userData?.followings?.includes(id)) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  // const checkRequested = (user) => {
  //   if (user?.requests?.includes(userData?.id)) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  // const followUser = async (user) => {
  //   setFollowLoading(user);
  //   let updatedUser = {
  //     ...user,
  //     followers: [...user?.followers, userData?.id],
  //   };
  //   // console.log("Updated User>>", updatedUser);

  //   let currentUser = userData?.userData;
  //   currentUser = {
  //     ...currentUser,
  //     followings: [...currentUser?.followings, user?.uid],
  //   };
  //   // console.log("Updated Current User>>", currentUser?.followings);

  //   //Update the Selected User
  //   await updateDocument(collections.users, user?.uid, updatedUser).catch(() =>
  //     setFollowLoading(null)
  //   );
  //   //Update the Current User
  //   await updateDocument(collections.users, userData?.id, currentUser)
  //     .then(() => {
  //       dispatch(fetchUserData());
  //     })
  //     .catch(() => setFollowLoading(null));
  //   if (user?.fcmToken) {
  //     await sendNotify({
  //       token: user?.fcmToken,
  //       title: `Fitgress`,
  //       msg: `${userData?.userData?.name} Follows you`,
  //     })
  //       .then((res) => console.log("Notify Response>>", res))
  //       .catch((err) => console.log("Notify Error>", err));
  //   }
  //   let data = {
  //     id: getRandomNumber(),
  //     notifyTo: user?.uid,
  //     notifyFrom: userData?.id,
  //     desc: `${userData?.userData?.name} Follows you`,
  //     createdAt: moment().valueOf(),
  //   };
  //   await createDocument(collections.notification, data.id, data);
  //   setFollowLoading(null);
  // };

  // const unFollowUser = async (user) => {
  //   setFollowLoading(user);
  //   let userFilt = user?.followers?.filter((i) => {
  //     return i !== userData?.id;
  //   });
  //   let updatedUser = { ...user, followers: userFilt };
  //   // console.log("Updated User>>", user?.followers);

  //   let currentUser = userData?.userData;
  //   let currentUserFilt = currentUser?.followings?.filter((i) => {
  //     return i !== user?.uid;
  //   });
  //   currentUser = {
  //     ...currentUser,
  //     followings: currentUserFilt,
  //   };
  //   // console.log("Updated Current User>>", currentUser?.followings);

  //   await updateDocument(collections.users, user?.uid, updatedUser).catch(() =>
  //     setFollowLoading(null)
  //   );
  //   await updateDocument(collections.users, currentUser?.uid, currentUser)
  //     .then(() => {
  //       dispatch(fetchUserData());
  //     })
  //     .catch(() => setFollowLoading(null));
  //   setFollowLoading(null);
  // };

  // const handleFollowRequest = async (user) => {
  //   setRequestLoading(user);
  //   if (checkRequested(user)) {
  //     let userFilt = user?.requests?.filter((i) => {
  //       return i !== userData?.id;
  //     });
  //     let updatedUser = { ...user, requests: userFilt };
  //     await updateDocument(collections.users, user?.uid, updatedUser).catch(
  //       () => setRequestLoading(null)
  //     );
  //   } else {
  //     let updatedUser = {
  //       ...user,
  //       requests: [...user?.requests, userData?.id],
  //     };
  //     await updateDocument(collections.users, user?.uid, updatedUser).catch(
  //       () => setRequestLoading(null)
  //     );
  //     let data = {
  //       id: getRandomNumber(),
  //       notifyTo: user?.uid,
  //       notifyFrom: userData?.id,
  //       desc: `requested to follow you`,
  //       createdAt: moment().valueOf(),
  //       notifyType: "followRequest",
  //     };
  //     await createDocument(collections.notification, data.id, data);
  //     if (user?.fcmToken) {
  //       await sendNotify({
  //         token: user?.fcmToken,
  //         title: `Fitgress`,
  //         msg: `${userData?.userData?.name} requested to follow you`,
  //       })
  //         .then((res) => console.log("Notify Response>>", res))
  //         .catch((err) => console.log("Notify Error>", err));
  //     }
  //   }
  //   getUsers();
  //   setRequestLoading(null);
  //   // setUsers([]);
  //   // filterUsers(search);
  // };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={(val) => filterUsers(val)}
        placeholder="Search User"
        placeholderTextColor={"#B0B0B0"}
      />
      <FlatList
        data={users}
        keyExtractor={(_, index) => index.toString()}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => {
              filterUsers("");
              navigate(routes.userProfile, { userID: item.uid });
            }}
          >
            <View style={styles.rowBasic}>
              <UserAvatar
                src={
                  item?.profilePic !== ""
                    ? item?.profilePic
                    : appImages?.dummyUrl
                }
                size={totalSize(6)}
              />
              <View style={{ paddingLeft: width(2) }}>
                <Text style={styles.userName}>{item?.fullName}</Text>
                <Text style={{ color: "#B0B0B0" }}>{`@${item?.name}`}</Text>
              </View>
            </View>
            {/* {item?.profileType == "public" ? (
              <TouchableOpacity
                style={{
                  ...styles.btn,
                  backgroundColor: checkFollow(item?.uid)
                    ? "#163041"
                    : "#22d3ee",
                }}
                onPress={() => {
                  checkFollow(item?.uid)
                    ? unFollowUser(item)
                    : followUser(item);
                }}
              >
                {isFollowLoading?.uid == item?.uid ? (
                  <ActivityIndicator size={"small"} color={"#fff"} />
                ) : (
                  <Text
                    style={{
                      ...styles.btnTxt,
                      color: checkFollow(item?.uid) ? "#22d3ee" : "#fff",
                    }}
                  >
                    {checkFollow(item?.uid) ? "Following" : "Follow"}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  ...styles.btn,
                  backgroundColor: checkRequested(item) ? "#163041" : "#22d3ee",
                }}
                onPress={() => {
                  handleFollowRequest(item);
                }}
              >
                {isRequestLoading?.uid == item?.uid ? (
                  <ActivityIndicator size={"small"} color={"#fff"} />
                ) : (
                  <Text
                    style={{
                      ...styles.btnTxt,
                      color: checkRequested(item) ? "#22d3ee" : "#fff",
                    }}
                  >
                    {checkRequested(item) ? "Requested" : "Request"}
                  </Text>
                )}
              </TouchableOpacity>
            )} */}
          </Pressable>
        )}
        ListFooterComponent={() => <View style={{ height: height(10) }} />}
      />
    </SafeAreaView>
  );
};

export default SearchPage;

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderColor: "#B0B0B0",
    borderRadius: totalSize(1),
    height: height(5),
    paddingHorizontal: width(2),
    marginHorizontal: width(5),
    color: "#fff",
    marginTop: Platform.OS == "ios" ? height(3) : height(8),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: width(5),
    marginTop: height(2),
  },
  rowBasic: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: totalSize(2),
    fontWeight: "600",
    color: "#fff",
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
});
