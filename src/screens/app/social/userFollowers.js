import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
  Text,
} from "react-native";
import React, { useEffect, useState } from "react";
import { height, totalSize, width } from "react-native-dimension";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { useSelector, useDispatch } from "react-redux";
import {
  updateDocument,
  getAllUser,
  getDocumentById,
} from "../../../api/firebase/db";
import { appImages } from "../../../constants/images";
import { fetchUserData } from "../../../api/features/user/userDataSlice";
import { goBack, navigate } from "../../../navigation/rootNavigation";
import { collections, routes } from "../../../constants/routes";
import { Header } from "../../../components/Header";

const UserFollowers = ({ navigation, route }) => {
  const { userData } = useSelector((state) => state.userData);
  const dispatch = useDispatch();
  const { type, userID } = route.params;
  // console.log("Screen Type:>", type, userID);

  const [users, setUsers] = useState([]);
  const [tempUser, setTempUSer] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isFollowLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    getUser();
    navigation.setOptions({
      headerShown: false,
    });
  }, [userID]);

  const getUser = async () => {
    setLoading(true);
    let user = await getDocumentById(collections.users, userID);
    // console.log(user);
    let users = await getAllUser(userID);
    if (users?.length > 0) {
      if (type == "followers") {
        let filt = users?.filter((i) => {
          // return i?.followings?.includes(userID);
          return user?.followers?.includes(i?.uid);
        });
        setUsers(filt);
        setTempUSer(filt);
      } else {
        let filt = users?.filter((i) => {
          // return i?.followers?.includes(userID);
          return user?.followings?.includes(i?.uid);
        });
        setUsers(filt);
        setTempUSer(filt);
      }
    }
    setLoading(false);
  };

  const filterUsers = (search) => {
    setSearch(search);
    if (search?.length > 0) {
      let filt = tempUser?.filter((i) => {
        let name = i?.name?.toLowerCase();
        return name?.includes(search?.toLowerCase());
      });
      setUsers(filt);
    } else {
      setUsers(tempUser);
    }
  };

  const checkFollow = (id) => {
    if (userData?.userData?.blockUsers?.includes(id)) {
      return true;
    } else {
      return false;
    }
  };

  const blockUser = async (user) => {
    console.log(user);
    setFollowLoading(user);
    let currentUser = userData?.userData;
    let updatedCurrentUser;
    if (currentUser?.blockUsers) {
      updatedCurrentUser = {
        ...currentUser,
        blockUsers: [...currentUser?.blockUsers, user?.uid],
      };
    } else {
      updatedCurrentUser = {
        ...currentUser,
        blockUsers: [user?.uid],
      };
    }
    console.log("Updated Current User>>", updatedCurrentUser);
    //Update the Current User
    await updateDocument(collections.users, userData?.id, updatedCurrentUser)
      .then(() => {
        dispatch(fetchUserData());
      })
      .catch(() => setFollowLoading(null));
    setFollowLoading(null);
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
      })
      .catch(() => setFollowLoading(null));
    setFollowLoading(null);
  };

  return (
    <SafeAreaView className="bg-gray-900 flex-1">
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
                width: 25,
                height: 25,
              }}
            />
            <Text style={styles.heading}>{`User ${
              type == "followers" ? "Followers" : "Followings"
            }`}</Text>
          </TouchableOpacity>
        }
        containerStyle={{ marginTop: 0 }}
      />
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={(val) => filterUsers(val)}
        placeholder="Search User"
        placeholderTextColor={"#B0B0B0"}
      />
      {isLoading ? (
        <ActivityIndicator
          color={"#f9fafb"}
          size={"large"}
          style={{ alignSelf: "center", marginTop: height(20) }}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(_, index) => index.toString()}
          refreshing={userData}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => {
                if (userData?.id == item?.uid) {
                  navigate(routes.profile);
                } else {
                  navigate(routes.userProfile, { userID: item.uid });
                }
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
                <Text style={styles.userName}>{item?.name}</Text>
              </View>
              <TouchableOpacity
                style={{
                  ...styles.btn,
                  backgroundColor: checkFollow(item?.uid)
                    ? "#163041"
                    : "#22d3ee",
                }}
                onPress={() => {
                  checkFollow(item?.uid) ? unBlockUser(item) : blockUser(item);
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
                    {checkFollow(item?.uid) ? "Unblock" : "Block"}
                  </Text>
                )}
              </TouchableOpacity>
            </Pressable>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.emptyList}>No User!</Text>
          )}
          ListFooterComponent={() => <View style={{ height: height(10) }} />}
        />
      )}
    </SafeAreaView>
  );
};

export default UserFollowers;

const styles = StyleSheet.create({
  heading: {
    color: "white",
    fontSize: totalSize(2),
    fontWeight: "500",
    marginLeft: width(2),
    fontFamily: "IBMPlexSans-Regular",
  },
  search: {
    borderWidth: 1,
    borderColor: "#B0B0B0",
    borderRadius: totalSize(1),
    height: height(5),
    paddingHorizontal: width(2),
    marginHorizontal: width(5),
    color: "#fff",
    marginTop: height(3),
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
    paddingLeft: width(2),
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
  emptyList: {
    textAlign: "center",
    marginTop: height(10),
    color: "#B0B0B0",
    fontSize: totalSize(1.7),
  },
});
