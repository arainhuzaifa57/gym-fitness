import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useCallback, useState } from "react";
import { Header } from "../../../components/Header";
import { goBack, navigate } from "../../../navigation/rootNavigation";
import { width, height, totalSize } from "react-native-dimension";
import { useSelector, useDispatch } from "react-redux";
import {
  getNotifications,
  getAllUser,
  deleteDocument,
  readAllNotifications,
  updateDocument,
  getDocumentById,
  createDocument,
} from "../../../api/firebase/db";
import moment from "moment";
import { saveAllUsers } from "../../../api/features/user/userDataSlice";
import Swipelist from "react-native-swipeable-list-view";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { appImages } from "../../../constants/images";
import Ionicons from "react-native-vector-icons/Ionicons";
import { collections, routes } from "../../../constants/routes";
import { Badge } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { sendNotify } from "../../../../Notification";
import { getRandomNumber } from "../../../utils/helpingMethods";

const Notifications = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDot, setShowDot] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [loaders, setLoaders] = useState({
    isDeclineLoading: false,
    isAcceptLoading: false,
  });

  const dispatch = useDispatch();
  const { userData, allUsers } = useSelector((state) => state?.userData);
  // console.log("Users>>", allUsers);
  // console.log("User>>", userData);

  useFocusEffect(
    useCallback(() => {
      getNotify();
    }, [])
  );

  async function getNotify() {
    let notify = await getNotifications(userData?.id);
    let filt = notify?.filter((i) => {
      if (i?.notifyType == "followRequest" && i?.read == false) {
        setShowDot(true);
      } else {
        return i;
      }
    });

    filt = filt?.sort((a, b) => moment(b?.createdAt) - moment(a?.createdAt));
    // console.log("Notify>>", filt);
    setNotifications(filt);
    if (allUsers?.length == 0) {
      let users = await getAllUser(userData?.id);
      dispatch(saveAllUsers(users));
    }
    setLoading(false);
    await readAllNotifications(userData?.id, "!=", "followRequest").then(() => {
      console.log("All Notifications are readed!!");
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

  const declineRequest = async (item) => {
    setLoaders((prevState) => ({ ...prevState, isDeclineLoading: true }));
    let group = await getDocumentById(collections.groups, item?.notifyData?.id);
    // console.log("Group>>", group);
    let data = {
      ...group,
      invites: group?.invites?.filter((i) => i != userData?.id),
    };
    updateDocument(collections.groups, group?.groupID, data).then(() =>
      deleteNotify(item)
    );
    setLoaders((prevState) => ({ ...prevState, isDeclineLoading: false }));
  };

  const acceptRequest = async (item) => {
    setLoaders((prevState) => ({ ...prevState, isAcceptLoading: true }));
    let user = filterUser(item?.notifyFrom);
    // console.log("Filter User>>", user);
    let group = await getDocumentById(collections.groups, item?.notifyData?.id);
    // console.log("Group>>", group);
    let data = {
      ...group,
      invites: group?.invites?.filter((i) => i != userData?.id),
      members: [...group?.members, userData?.id],
    };
    updateDocument(collections.groups, group?.groupID, data).then(() =>
      deleteNotify(item)
    );
    //Save Notification
    let notificationData = {
      id: getRandomNumber(),
      notifyTo: user?.uid,
      notifyFrom: userData?.id,
      desc: `accepted your ${group?.groupName} group request!`,
      createdAt: moment().valueOf(),
      notifyType: "groupInvite",
      read: false,
    };
    await createDocument(
      collections.notification,
      notificationData.id,
      notificationData
    );
    //Send Push Notification
    if (user?.fcmToken) {
      await sendNotify({
        token: user?.fcmToken,
        title: `Fitgress`,
        msg: `${userData?.userData?.name} accepted your ${group?.groupName} group request!`,
      })
        .then((res) => console.log("Notify Response>>", res))
        .catch((err) => console.log("Notify Error>", err));
    }
    setLoaders((prevState) => ({ ...prevState, isAcceptLoading: false }));
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
            <Text style={styles.heading}>Notifications</Text>
          </TouchableOpacity>
        }
        rightHeader={
          <TouchableOpacity onPress={() => navigate(routes.followRequests)}>
            <Text
              style={{
                color: "#0891b2",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Follow Requests
            </Text>
            {showDot && <Badge size={totalSize(1)} style={styles.dot} />}
          </TouchableOpacity>
        }
        containerStyle={{ marginBottom: height(2) }}
      />
      {isLoading ? (
        <ActivityIndicator
          size={"large"}
          style={styles.indicator}
          color={"#f9fafb"}
        />
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {notifications?.length > 0 ? (
            <Swipelist
              data={notifications}
              renderRightItem={(item, index) => {
                let user = filterUser(item?.notifyFrom);
                return (
                  <View
                    style={{
                      backgroundColor: item?.read ? "transparent" : "#232E41",
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.notifyContainer,
                        item?.notifyData && { height: height(12) },
                      ]}
                      onPress={() => {
                        if (
                          item?.notifyType == "commentPost" ||
                          item?.notifyType == "likePost"
                        ) {
                          navigate(routes.postDetail, { postID: item?.postID });
                        } else {
                          navigate(routes.userProfile, { userID: user?.uid });
                        }
                      }}
                    >
                      <View style={styles.row}>
                        <UserAvatar
                          src={
                            user?.profilePic !== ""
                              ? user?.profilePic
                              : appImages.dummyUrl
                          }
                          size={totalSize(4)}
                        />
                        <View
                          style={{
                            paddingLeft: width(2),
                            width: width(80),
                          }}
                        >
                          <Text style={styles.name}>
                            {user?.fullName}{" "}
                            <Text style={styles.msg}>{item?.desc}</Text>
                            {item?.notifyData && (
                              <>
                                <Text> {item?.notifyData?.name} </Text>
                                <Text style={styles.msg}>group</Text>
                              </>
                            )}
                          </Text>
                          <Text style={styles.date}>
                            {moment(item?.createdAt).format("MM/DD/YYYY")}
                          </Text>
                        </View>
                      </View>
                      {item?.notifyData && (
                        <View
                          style={[
                            styles.row,
                            { alignSelf: "flex-end", marginTop: height(1) },
                          ]}
                        >
                          <TouchableOpacity
                            style={[styles.btn, { backgroundColor: "#3B424F" }]}
                            onPress={() => declineRequest(item)}
                          >
                            {loaders?.isDeclineLoading ? (
                              <ActivityIndicator
                                color={"#f9fafb"}
                                size={"small"}
                              />
                            ) : (
                              <Text style={styles.btnTxt}>Decline</Text>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.btn,
                              {
                                backgroundColor: "#0891b2",
                                marginLeft: width(2),
                              },
                            ]}
                            onPress={() => acceptRequest(item)}
                          >
                            {loaders?.isAcceptLoading ? (
                              <ActivityIndicator
                                color={"#f9fafb"}
                                size={"small"}
                              />
                            ) : (
                              <Text style={styles.btnTxt}>Confirm</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }}
              renderHiddenItem={(item, index) => (
                <TouchableOpacity
                  style={[
                    styles.rightAction,
                    item?.notifyData && { height: height(12) },
                  ]}
                  onPress={() => deleteNotify(item)}
                >
                  <Ionicons
                    name="trash-outline"
                    color={"#fff"}
                    size={totalSize(3)}
                  />
                </TouchableOpacity>
              )}
              rightOpenValue={100}
            />
          ) : (
            <Text style={styles.emptyMsg}>No Notification yet!</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  heading: {
    paddingLeft: width(2),
    color: "#fff",
    fontSize: totalSize(2),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "500",
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
    height: height(7),
    borderBottomWidth: 0.4,
    borderBottomColor: "#B0B0B0",
    width: width(100),
    justifyContent: "center",
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
  rightAction: {
    backgroundColor: "red",
    height: height(7),
    borderBottomWidth: 0.5,
    borderBottomColor: "#B0B0B0",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    position: "absolute",
    top: 0,
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
