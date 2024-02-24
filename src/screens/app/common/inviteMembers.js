import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { goBack } from "../../../navigation/rootNavigation";
import React, { useState, useRef, useMemo, useEffect } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { width, height, totalSize } from "react-native-dimension";
import { useSelector } from "react-redux";
import AntDesign from "react-native-vector-icons/AntDesign";
import { appImages } from "../../../constants/images";
import {
  getDocumentById,
  updateDocument,
  createDocument,
} from "../../../api/firebase/db";
import { collections } from "../../../constants/routes";
import moment from "moment";
import { getRandomNumber } from "../../../utils/helpingMethods";
import { sendNotify } from "../../../../Notification";

const InviteMembers = ({ route }) => {
  const { groupDetail } = route.params;
  // console.log("Invite Params>>>", groupDetail);
  const { userData, allUsers } = useSelector((state) => state?.userData);

  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [followingUsers, setFollowingUsers] = useState([]);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["80%", "90%"], []);
  bottomSheetRef?.current?.snapToIndex(0);

  useEffect(() => {
    getGroupDetail();
  }, [groupDetail]);

  const getGroupDetail = async () => {
    const group = await getDocumentById(
      collections.groups,
      groupDetail?.groupID
    );
    setGroup(group);
    let filt = allUsers?.filter((i) => {
      return (
        i?.followers?.includes(userData?.id) &&
        !group?.members?.includes(i?.uid)
      );
    });
    // console.log(allUsers.length);
    setFollowingUsers(filt);
    setIsLoading(false);
  };

  const getUserProfiles = (id) => {
    let filt = allUsers?.filter((i) => {
      return i?.uid == id;
    });
    return filt[0];
  };

  const handleInvites = async (user) => {
    if (group?.invites?.includes(user?.uid)) {
      let data = {
        ...group,
        invites: group?.invites?.filter((i) => i != user?.uid),
      };
      updateDocument(collections.groups, groupDetail?.groupID, data).then(() =>
        getGroupDetail()
      );
    } else {
      let data = {
        ...group,
        invites: [...group?.invites, user?.uid],
      };
      updateDocument(collections.groups, groupDetail?.groupID, data).then(() =>
        getGroupDetail()
      );
      let notify = {
        id: getRandomNumber(),
        notifyTo: user?.uid,
        notifyFrom: userData?.id,
        desc: `sent an invite to join`,
        createdAt: moment().valueOf(),
        notifyType: "groupInvite",
        read: false,
        notifyData: {
          name: group?.groupName,
          id: group?.groupID,
        },
      };
      await createDocument(collections.notification, notify.id, notify);
      if (user?.fcmToken) {
        await sendNotify({
          token: user?.fcmToken,
          title: `Fitgress`,
          msg: `${userData?.userData?.name} sent an invite to join ${group?.groupName} group`,
        })
          .then((res) => console.log("Notify Response>>", res))
          .catch((err) => console.log("Notify Error>", err));
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={goBack}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onClose={goBack}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: "#182130" }}
          handleIndicatorStyle={{
            backgroundColor: "#fff",
            marginVertical: height(1),
          }}
        >
          <View
            className="flex-1 bg-gray-900"
            style={{ paddingHorizontal: width(2) }}
          >
            {isLoading ? (
              <ActivityIndicator
                color={"#f9fafb"}
                size={"large"}
                style={{ marginTop: height(10) }}
              />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.heading}>Invite Members</Text>
                <Text style={styles.note}>
                  Note:{" "}
                  <Text style={styles.msg}>
                    You can only invite users you are following
                  </Text>
                </Text>
                <View style={styles.invitedView}>
                  <Text style={{ color: "grey", paddingHorizontal: width(2) }}>
                    Invited {group?.invites?.length}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {group?.invites?.map((i, index) => {
                      const user = getUserProfiles(i);
                      return (
                        <View style={styles.namesView} key={index}>
                          <Text style={{ color: "#fff" }}>{user?.name}</Text>
                          <TouchableOpacity onPress={() => handleInvites(user)}>
                            <AntDesign
                              name="close"
                              color="#0891B2"
                              size={totalSize(1.5)}
                              style={{ paddingLeft: width(2) }}
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
                {followingUsers?.map((user, index) => (
                  <TouchableOpacity
                    style={styles.row}
                    key={index}
                    onPress={() => handleInvites(user)}
                  >
                    <View style={styles.rowBasic}>
                      <UserAvatar
                        src={user?.profilePic ?? appImages.dummyUrl}
                        size={totalSize(4)}
                      />
                      <View style={{ paddingLeft: width(2) }}>
                        <Text style={styles.listName}>{user?.fullName}</Text>
                        <Text
                          style={{ color: "#B0B0B0" }}
                        >{`@${user.name}`}</Text>
                      </View>
                    </View>
                    <Image
                      source={
                        group?.invites?.includes(user?.uid)
                          ? appImages.check
                          : appImages.unCheck
                      }
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </BottomSheet>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default InviteMembers;

const styles = StyleSheet.create({
  heading: {
    color: "#fff",
    fontSize: totalSize(2),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "700",
    paddingTop: height(2),
  },
  note: {
    color: "#fff",
    fontSize: totalSize(1.7),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "700",
    paddingTop: height(2),
  },
  msg: {
    color: "#B0B0B0",
    fontSize: totalSize(1.7),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "500",
  },
  invitedView: {
    backgroundColor: "#182130",
    width: width(95),
    alignSelf: "center",
    paddingHorizontal: width(2),
    paddingVertical: height(1),
    borderRadius: totalSize(1),
    marginTop: height(1),
  },
  namesView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width(2),
    paddingVertical: height(0.5),
    borderRadius: totalSize(3),
    marginRight: width(1),
    backgroundColor: "#07B6D51A",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: width(95),
    alignSelf: "center",
    marginTop: height(2),
  },
  rowBasic: {
    flexDirection: "row",
    alignItems: "center",
  },
  listName: {
    fontWeight: "600",
    color: "#fff",
  },
  icon: {
    height: totalSize(3),
    width: totalSize(3),
    resizeMode: "contain",
  },
});
