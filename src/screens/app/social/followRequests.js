import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  getNotifications,
  deleteDocument,
  updateDocument,
  createDocument,
  readAllNotifications,
} from "../../../api/firebase/db";
import moment from "moment";
import { collections } from "../../../constants/routes";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { appImages } from "../../../constants/images";
import { width, height, totalSize } from "react-native-dimension";
import { useSelector, useDispatch } from "react-redux";
import { goBack, navigate } from "../../../navigation/rootNavigation";
import { routes } from "../../../constants/routes";
import { Header } from "../../../components/Header";
import { sendNotify } from "../../../../Notification";
import { fetchUserData } from "../../../api/features/user/userDataSlice";
import { getRandomNumber } from "../../../utils/helpingMethods";

const FollowRequests = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isFollowLoading, setFollowLoading] = useState(false);

  const dispatch = useDispatch();
  const { userData, allUsers } = useSelector((state) => state?.userData);

  useEffect(() => {
    getNotify();
  }, []);

  async function getNotify() {
    setLoading(true);
    let notify = await getNotifications(userData?.id);
    let filt = notify?.filter((i) => {
      if (i?.notifyType == "followRequest") {
        return i;
      }
    });
    filt = filt?.sort((a, b) => moment(b?.createdAt) - moment(a?.createdAt));
    setNotifications(filt);
    setLoading(false);
    await readAllNotifications(userData?.id, "==", "followRequest").then(() => {
      console.log("All Follow Request Notifications are readed!!");
    });
  }

  const filterUser = (id) => {
    // console.log("searchID>>", id);
    let filt = allUsers?.filter((i) => {
      return i?.uid == id;
    });
    // console.log("filt>>", filt);
    return filt[0];
  };

  const deleteNotify = async (item) => {
    await deleteDocument(collections.notification, item?.id).then(() =>
      getNotify()
    );
  };

  const acceptRequest = async (item) => {
    setFollowLoading(true);
    let user = filterUser(item?.notifyFrom);
    // console.log("Filter User>>", user);
    let updatedUser = {
      ...user,
      followings: [...user?.followings, userData?.id],
    };
    // console.log("Updated User>>", updatedUser);
    let userFilt = userData?.userData?.requests?.filter((i) => {
      return i !== user?.uid;
    });
    let currentUser = {
      ...userData?.userData,
      followers: [...userData?.userData?.followers, user?.uid],
      requests: userFilt,
    };
    // console.log("Updated Current User>>", currentUser?.followings);

    if (!user?.followings?.includes(userData?.id)) {
      //Update the Selected User
      await updateDocument(collections.users, user?.uid, updatedUser).catch(
        () => setFollowLoading(false)
      );
    }
    //Update the Current User
    if (!userData?.userData?.followers?.includes(user?.uid)) {
      await updateDocument(collections.users, userData?.id, currentUser)
        .then(() => {
          //Delete Notification
          deleteNotify(item);
        })
        .catch(() => setFollowLoading(false));
    } else {
      deleteNotify(item);
      setFollowLoading(false);
    }
    dispatch(fetchUserData());
    //Save Notification
    let data = {
      id: getRandomNumber(),
      notifyTo: user?.uid,
      notifyFrom: userData?.id,
      desc: `accepted your friend request!`,
      createdAt: moment().valueOf(),
      notifyType: "userFollow",
      read: false,
    };
    await createDocument(collections.notification, data.id, data);
    //Send Push Notification
    if (user?.fcmToken) {
      await sendNotify({
        token: user?.fcmToken,
        title: `Fitgress`,
        msg: `${userData?.userData?.name} accepted your friend request!`,
      })
        .then((res) => console.log("Notify Response>>", res))
        .catch((err) => console.log("Notify Error>", err));
    }
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
            <Text style={styles.heading}>Follow Requests</Text>
          </TouchableOpacity>
        }
        containerStyle={{ marginBottom: height(4) }}
      />
      {isLoading && (
        <ActivityIndicator
          size={"large"}
          style={styles.indicator}
          color={"#f9fafb"}
        />
      )}
      <FlatList
        data={notifications}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          let user = filterUser(item?.notifyFrom);
          return (
            <View
              style={[
                styles.notifyContainer,
                styles.row,
                {
                  backgroundColor: item?.read
                    ? "transparent"
                    : "#232E41",
                },
              ]}
            >
              <View style={styles.row}>
                <Pressable
                  onPress={() =>
                    navigate(routes.userProfile, { userID: user.uid })
                  }
                >
                  <UserAvatar
                    src={
                      user?.profilePic !== ""
                        ? user?.profilePic
                        : appImages.dummyUrl
                    }
                    size={totalSize(4)}
                  />
                </Pressable>
                <View style={{ paddingLeft: width(2) }}>
                  <Text style={styles.name}>
                    {user?.fullName}{" "}
                    {/* <Text style={styles.msg}>{item?.desc}</Text> */}
                  </Text>
                  <Text style={styles.date}>{`@${user?.name}`}</Text>
                </View>
              </View>
              <View
                style={{
                  ...styles.row,
                  alignSelf: "flex-end",
                  marginTop: height(1),
                }}
              >
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#3B424F" }]}
                  onPress={() => deleteNotify(item)}
                >
                  <Text style={styles.btnTxt}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.btn,
                    { backgroundColor: "#0891b2", marginLeft: width(2) },
                  ]}
                  onPress={() => acceptRequest(item)}
                  disabled={isFollowLoading}
                >
                  {isFollowLoading ? (
                    <ActivityIndicator color={"#f9fafb"} size={"small"} />
                  ) : (
                    <Text style={styles.btnTxt}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyMsg}>No user request yet!</Text>
        )}
      />
    </View>
  );
};

export default FollowRequests;

const styles = StyleSheet.create({
  heading: {
    paddingLeft: width(2),
    color: "#fff",
    fontSize: totalSize(2),
    fontFamily: "IBMPlexSans-Regular",
  },
  emptyMsg: {
    color: "#B0B0B0",
    textAlign: "center",
    marginTop: height(20),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifyContainer: {
    width: width(100),
    paddingHorizontal: width(5),
    paddingVertical: height(1),
    borderBottomWidth: 0.5,
    borderBottomColor: "#B0B0B0",
    width: width(100),
    justifyContent: "space-between",
  },
  name: {
    color: "#fff",
    fontWeight: "700",
    fontSize: totalSize(1.5),
  },
  msg: {
    color: "grey",
    fontSize: totalSize(1.5),
    fontWeight: "500",
  },
  date: {
    color: "grey",
    fontSize: totalSize(1.2),
  },
  indicator: {
    position: "absolute",
    top: height(30),
    alignSelf: "center",
  },
  btn: {
    width: width(20),
    paddingVertical: height(0.6),
    borderRadius: totalSize(0.5),
    alignItems: "center",
    justifyContent: "center",
  },
  btnTxt: {
    fontSize: totalSize(1.7),
    color: "#fff",
  },
});
