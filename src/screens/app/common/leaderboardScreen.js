import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  FlatList,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { height, width, totalSize } from "react-native-dimension";
import { Header } from "../../../components/Header";
import { goBack, navigate } from "../../../navigation/rootNavigation";
import { appImages } from "../../../constants/images";
import { routes } from "../../../constants/routes";
import { getGroupMembers } from "../../../api/firebase/db";
import { useSelector } from "react-redux";

const LeaderBoardScreen = ({ route }) => {
  const { groupDetail } = route.params;
  // console.log("Params>>>", groupDetail);
  const { userData } = useSelector((state) => state?.userData);

  const [isLoading, setLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [topGroupMembers, setTopGroupMembers] = useState([]);

  useEffect(() => {
    if (route.params !== undefined) {
      getGroupMemebrsList();
    }
  }, [route]);

  const getGroupMemebrsList = async () => {
    setLoading(true);
    let members = await getGroupMembers(
      groupDetail?.members,
      groupDetail?.createdAt
    );

    members?.sort((a, b) => b?.totalWorkoutsCount - a?.totalWorkoutsCount);
    setGroupMembers(members?.slice(3));
    // console.log("Members>>>", members?.slice(0, 3));
    let membersList = members?.slice(0, 3).map((member, index) => {
      return {
        ...member,
        rank: index == 0 ? 1 : index == 1 ? 2 : 3,
      };
    });
    let arr = [];
    arr[0] = membersList[1];
    arr[1] = membersList[0];
    arr[2] = membersList[2];
    // console.log(arr);
    setTopGroupMembers(arr);
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-gray-900">
      {isLoading && (
        <ActivityIndicator
          size={"large"}
          color={"#f9fafb"}
          style={styles.indicator}
        />
      )}
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
                width: 24,
                height: 24,
              }}
            />
            <Text style={styles.heading}>{"Leaderboard"}</Text>
          </TouchableOpacity>
        }
        rightHeader={
          <TouchableOpacity
            onPress={() =>
              navigate(routes.inviteMembers, { groupDetail: groupDetail })
            }
          >
            <Text style={styles.rightBtn}>Invite Members</Text>
          </TouchableOpacity>
        }
        containerStyle={{}}
      />
      <FlatList
        data={groupMembers}
        ListHeaderComponent={() => (
          <>
            <View style={styles.subHeader}>
              <Text style={styles.subHeading}>{groupDetail?.groupName}</Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: totalSize(1.7),
                  fontWeight: "700",
                }}
              >
                Goal:{" "}
                <Text style={{ color: "#B0B0B0" }}>{groupDetail?.goals}</Text>
              </Text>
            </View>
            <View style={styles.topView}>
              {topGroupMembers?.map((item, index) => {
                if (item) {
                  return (
                    <Pressable
                      key={index}
                      style={{ marginLeft: index !== 0 ? width(3) : 0 }}
                      onPress={() => {
                        if (item.uid !== userData?.id) {
                          navigate(routes.userProfile, { userID: item.uid });
                        } else {
                          navigate(routes.profile);
                        }
                      }}
                    >
                      <ImageBackground
                        source={{
                          uri:
                            item?.profilePic !== ""
                              ? item?.profilePic
                              : appImages.dummyUrl,
                        }}
                        borderRadius={totalSize(2)}
                        style={{
                          height: totalSize(index == 1 ? 14 : 11),
                          width: totalSize(index == 1 ? 14 : 11),
                        }}
                      >
                        <Image
                          source={
                            index == 1
                              ? appImages.first
                              : index == 2
                              ? appImages.second
                              : appImages.third
                          }
                          style={styles.medalImg}
                        />
                      </ImageBackground>
                      <View
                        style={{
                          ...styles.infoContainer,
                          width: totalSize(index == 1 ? 14 : 11),
                        }}
                      >
                        <Text
                          style={{ color: index == 1 ? "#fff" : "#B0B0B0" }}
                        >
                          {item?.rank}
                          {"  "}
                          <Text style={styles.itemName}>{item?.fullName}</Text>
                        </Text>
                        <Text
                          style={{
                            color:
                              index == 1
                                ? "#FFBF3B"
                                : index == 2
                                ? "#6C8398"
                                : "#AF7257",
                          }}
                        >
                          {item?.totalWorkoutsCount ?? 0}{" "}
                          <Text style={{ color: "#B0B0B0" }}>Workouts</Text>
                        </Text>
                      </View>
                    </Pressable>
                  );
                }
              })}
            </View>
          </>
        )}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          return (
            <Pressable
              style={styles.listContainer}
              onPress={() => {
                if (item.uid !== userData?.id) {
                  navigate(routes.userProfile, { userID: item.uid });
                } else {
                  navigate(routes.profile);
                }
              }}
            >
              <View style={styles.rowBasic}>
                <Text style={{ color: "#fff", marginRight: 10 }}>
                  {index + 4}
                </Text>
                <UserAvatar
                  src={
                    item?.profilePic !== ""
                      ? item?.profilePic
                      : appImages.dummyUrl
                  }
                  size={totalSize(4)}
                />
                <Text style={styles.listName}>{item?.fullName}</Text>
              </View>
              <View style={styles.rowBasic}>
                <Image source={appImages.workout} style={styles.workoutImg} />
                <Text
                  style={{
                    color: "#fff",
                    paddingLeft: width(2),
                  }}
                >
                  {item?.totalWorkoutsCount ?? 0}{" "}
                  <Text style={{ color: "#B0B0B0" }}>Workouts</Text>
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

export default LeaderBoardScreen;

const styles = StyleSheet.create({
  heading: {
    color: "white",
    fontSize: totalSize(2),
    fontWeight: "500",
    marginLeft: width(2),
    fontFamily: "IBMPlexSans-Regular",
  },
  rightBtn: {
    color: "rgba(7, 182, 213, 0.7)",
    fontSize: totalSize(2),
    fontWeight: "500",
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    paddingHorizontal: width(5),
    width: width(100),
    marginTop: height(4),
  },
  subHeading: {
    color: "#fff",
    fontSize: totalSize(2),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "700",
  },
  topView: {
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width(5),
    width: width(100),
    marginTop: height(3),
  },
  medalImg: {
    position: "absolute",
    bottom: height(1),
    height: totalSize(2.5),
    width: totalSize(2.5),
    alignSelf: "center",
  },
  itemName: {
    fontWeight: "600",
    color: "#fff",
  },
  infoContainer: {
    paddingTop: height(1),
  },
  listContainer: {
    backgroundColor: "#182130",
    width: width(90),
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width(2),
    paddingVertical: height(1),
    borderRadius: totalSize(1),
    marginTop: height(1),
  },
  rowBasic: {
    flexDirection: "row",
    alignItems: "center",
  },
  listName: {
    fontWeight: "600",
    color: "#fff",
    paddingLeft: width(2),
  },
  workoutImg: {
    height: totalSize(2),
    width: totalSize(2),
    tintColor: "#fff",
    resizeMode: "contain",
  },
  indicator: {
    position: "absolute",
    top: height(20),
    alignSelf: "center",
    zIndex: 1000,
  },
});
