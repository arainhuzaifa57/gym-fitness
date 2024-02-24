import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Header } from "../../../components/Header";
import { width, height, totalSize } from "react-native-dimension";
import { appImages } from "../../../constants/images";
import UserAvatar from "@muhzi/react-native-user-avatar";
import { TextInput } from "react-native-paper";
import { navigate } from "../../../navigation/rootNavigation";
import { collections, routes } from "../../../constants/routes";
import ImagePicker from "react-native-image-crop-picker";
import ImageOptionsModal from "../../../components/ImageOptions";
import {
  createDocument,
  uploadGroupFile,
  getGroupList,
  updateDocument,
  deleteDocument,
} from "../../../api/firebase/db";
import { useSelector } from "react-redux";
import { getRandomNumber } from "../../../utils/helpingMethods";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";

const GroupScreen = () => {
  const [createModal, setCreateModal] = useState(false);
  const [groupDetail, setGroupDetail] = useState({
    profile: null,
    name: "",
    goals: "",
  });
  const [imagePicker, setImagePicker] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState({
    field: "",
    msg: "",
  });
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [mainLoader, setMainLoader] = useState(false);

  const { userData, allUsers } = useSelector((state) => state?.userData);

  useEffect(() => {
    if (groupDetail?.name !== "" && groupDetail?.goals !== "") {
      setError({
        field: "",
        msg: "",
      });
    }
  }, [groupDetail]);

  const handleImagePick = async () => {
    const result = await ImagePicker.openPicker({
      mediaType: "photo",
      cropping: true,
      height: height(50),
      width: width(100),
      compressImageQuality: 0.6,
      cropperCircleOverlay: true,
    });
    //console.log(result?.assets[0]);
    let data = {
      name: result?.filename,
      url:
        Platform.OS === "android"
          ? result.path
          : result.path.replace("file://", ""),
      type: result?.mime,
    };
    // console.log("File>>", data);
    setGroupDetail((prevState) => ({ ...prevState, profile: data }));
  };

  const handleCameraImage = async () => {
    const result = await ImagePicker.openCamera({
      mediaType: "photo",
      useFrontCamera: true,
      cropping: true,
      height: height(50),
      width: width(100),
      compressImageQuality: 0.6,
      cropperCircleOverlay: true,
    });
    //console.log(result?.assets[0]);
    let data = {
      name: result?.filename,
      url:
        Platform.OS === "android"
          ? result.path
          : result.path.replace("file://", ""),
      type: result?.mime,
    };
    // console.log("File>>", data);
    setGroupDetail((prevState) => ({ ...prevState, profile: data }));
  };

  const handleCreate = async () => {
    if (groupDetail?.name == "" || groupDetail?.goals == "") {
      setError({
        field: "all",
        msg: "All fields are required!",
      });
    } else {
      setLoading(true);
      if (groupDetail.profile?.url !== undefined) {
        console.log("Profile>>", groupDetail?.profile);
        await uploadGroupFile(groupDetail.profile).then(async (url) => {
          let data = {
            groupName: groupDetail.name,
            goals: groupDetail.goals,
            profile: url,
            createdAt: moment().valueOf(),
            createdBy: userData?.id,
            groupID: getRandomNumber(),
            invites: [],
            members: [userData?.id],
          };
          await createDocument(collections.groups, data?.groupID, data).then(
            () => {
              setCreateModal(false);
              setGroupDetail({
                profile: null,
                name: "",
                goals: "",
              });
            }
          );
        });
      } else {
        let data = {
          groupName: groupDetail.name,
          goals: groupDetail.goals,
          profile: null,
          createdAt: moment().valueOf(),
          createdBy: userData?.id,
          groupID: getRandomNumber(),
          invites: [],
          members: [userData?.id],
        };
        await createDocument(collections.groups, data?.groupID, data).then(
          () => {
            setCreateModal(false);
            setGroupDetail({
              profile: null,
              name: "",
              goals: "",
            });
          }
        );
      }
      getGroup();
      setLoading(false);
    }
  };

  const updateGroupDetail = async () => {
    if (groupDetail?.name == "" || groupDetail?.goals == "") {
      setError({
        field: "all",
        msg: "All fields are required!",
      });
    } else {
      setLoading(true);
      if (groupDetail?.profile?.url?.includes("firebase")) {
        let data = {
          groupName: groupDetail.name,
          goals: groupDetail.goals,
          profile: selectedGroup.profile,
          createdAt: selectedGroup.createdAt,
          createdBy: selectedGroup.createdBy,
          groupID: selectedGroup.groupID,
          invites: selectedGroup.invites,
          members: selectedGroup.members,
        };
        await updateDocument(collections.groups, data?.groupID, data).then(
          () => {
            setCreateModal(false);
            setGroupDetail({
              profile: null,
              name: "",
              goals: "",
            });
            setSelectedGroup(null);
          }
        );
      } else {
        console.log("Update Profile URL>>", groupDetail.profile?.url);
        if (groupDetail.profile?.url !== undefined) {
          await uploadGroupFile(groupDetail.profile).then(async (url) => {
            let data = {
              groupName: groupDetail.name,
              goals: groupDetail.goals,
              profile: url,
              createdAt: selectedGroup.createdAt,
              createdBy: selectedGroup.createdBy,
              groupID: selectedGroup.groupID,
              invites: selectedGroup.invites,
              members: selectedGroup.members,
            };
            await updateDocument(collections.groups, data?.groupID, data).then(
              () => {
                setCreateModal(false);
                setGroupDetail({
                  profile: null,
                  name: "",
                  goals: "",
                });
                setSelectedGroup(null);
              }
            );
          });
        } else {
          console.log("Update Profile URL null>>", groupDetail.profile?.url);
          let data = {
            groupName: groupDetail.name,
            goals: groupDetail.goals,
            profile: null,
            createdAt: selectedGroup.createdAt,
            createdBy: selectedGroup.createdBy,
            groupID: selectedGroup.groupID,
            invites: selectedGroup.invites,
            members: selectedGroup.members,
          };
          await updateDocument(collections.groups, data?.groupID, data).then(
            () => {
              setCreateModal(false);
              setGroupDetail({
                profile: null,
                name: "",
                goals: "",
              });
              setSelectedGroup(null);
            }
          );
        }
      }
      getGroup();
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getGroup();
      setSelectedGroup(null);
    }, [userData])
  );

  // Get all Groups from collection
  async function getGroup() {
    setMainLoader(true);
    let groups = await getGroupList(userData?.id);
    // console.log("Groups>>", groups);
    let allGroups = [];
    groups.forEach((group) => {
      let profiles = getUserProfiles(group?.members);
      // console.log("Profiles>>", profiles);
      allGroups.push({
        ...group,
        userProfiles: profiles,
      });
    });
    allGroups?.sort((a, b) => moment(b.createdAt) - moment(a.createdAt));
    // console.log("All Groups>>", allGroups);
    setGroups(allGroups);
    setMainLoader(false);
  }

  // Get the User Profile Image according to Group Members array
  const getUserProfiles = (members) => {
    let users = [];
    if (members?.includes(userData?.id)) {
      users.push(userData?.userData?.profilePic);
    }
    allUsers?.forEach((user) => {
      if (members?.includes(user?.uid)) {
        users.push(user?.profilePic);
      }
    });
    // console.log("User Profiles>>", users);
    return users;
  };

  // For Edit Group Profile
  useEffect(() => {
    if (selectedGroup !== null) {
      setGroupDetail({
        profile: {
          name: "1234345",
          url: selectedGroup?.profile ?? undefined,
          type: "image/jpeg",
        },
        name: selectedGroup?.groupName,
        goals: selectedGroup?.goals?.toString(),
      });
    }
  }, [selectedGroup]);

  const deleteGroup = async () => {
    await deleteDocument(collections.groups, selectedGroup?.groupID).then(
      () => {
        getGroup();
        setCreateModal(false);
        setGroupDetail({
          profile: null,
          name: "",
          goals: "",
        });
        setSelectedGroup(null);
      }
    );
  };

  return (
    <View className="flex-1 bg-gray-900">
      <Header
        onBack={false}
        leftHeader={<Text style={styles.heading}>Groups</Text>}
        rightHeader={
          <TouchableOpacity onPress={() => setCreateModal(true)}>
            <Text style={styles.rightBtn}>Create Group</Text>
          </TouchableOpacity>
        }
        containerStyle={{ paddingHorizontal: width(4) }}
      />
      {mainLoader ? (
        <ActivityIndicator
          color={"#f9fafb"}
          size={"large"}
          style={{ marginTop: height(10) }}
        />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => {
            // console.log('Item Members>>', item.members);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigate(routes.leaderboard, { groupDetail: item })
                }
              >
                <View style={styles.rowBasic}>
                  <UserAvatar
                    src={item?.profile ?? appImages?.dummyUrl}
                    size={totalSize(8)}
                  />
                  <View style={{ paddingLeft: width(2) }}>
                    <Text style={styles.cardHeading}>{item?.groupName}</Text>
                    <Text style={styles.cardTotal}>
                      {item?.members?.length}{" "}
                      <Text style={{ color: "#B0B0B0" }}>members</Text>
                    </Text>
                    <View style={styles.rowBasic}>
                      {item?.userProfiles?.slice(0, 6)?.map((profile) => (
                        <TouchableOpacity style={styles.avatar}>
                          <UserAvatar src={profile} size={totalSize(2.5)} />
                        </TouchableOpacity>
                      ))}
                      {item?.userProfiles?.length > 6 && (
                        <View style={styles.userAvatar}>
                          <Text
                            style={{ color: "#fff", fontSize: totalSize(1.2) }}
                          >{`+${item?.userProfiles?.length - 5}`}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedGroup(item);
                    setCreateModal(true);
                  }}
                >
                  <Image
                    source={require("../../../constants/icons/edit.png")}
                    style={styles.editIcon}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <Modal visible={createModal} animationType="slide" statusBarTranslucent>
        <View style={styles.modal}>
          <Header
            onBack={false}
            leftHeader={
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => {
                  setCreateModal(false);
                  setGroupDetail({
                    profile: null,
                    name: "",
                    goals: "",
                  });
                  setSelectedGroup(null);
                }}
              >
                <Image
                  source={require("../../../constants/icons/arrow-left.png")}
                  resizeMode="contain"
                  style={{
                    width: 25,
                    height: 25,
                  }}
                />
                <Text style={styles.heading}>
                  {selectedGroup ? "Edit Group" : "Create Group"}
                </Text>
              </TouchableOpacity>
            }
            containerStyle={{ marginBottom: height(4) }}
          />
          <TouchableOpacity
            style={{ alignSelf: "center" }}
            onPress={() => setImagePicker(true)}
          >
            <UserAvatar
              src={groupDetail?.profile?.url ?? appImages?.dummyUrl}
              size={totalSize(15)}
            />
          </TouchableOpacity>
          <View
            style={{
              ...styles.input,
              borderWidth:
                groupDetail?.name == "" && isError.field == "all" ? 2 : 0,
            }}
          >
            <TextInput
              mode="flat"
              label="Group Name"
              style={{
                height: height(6),
                overflow: "hidden",
                backgroundColor: "#182130",
              }}
              activeUnderlineColor={"#07B6D5"}
              textColor={"white"}
              value={groupDetail?.name}
              onChangeText={(text) => {
                setGroupDetail((prevState) => ({ ...prevState, name: text }));
              }}
            />
          </View>
          <View
            style={{
              ...styles.input,
              borderWidth:
                groupDetail?.goals == "" && isError.field == "all" ? 2 : 0,
            }}
          >
            <TextInput
              mode="flat"
              label="Workout Goal"
              style={{
                height: height(6),
                overflow: "hidden",
                backgroundColor: "#182130",
              }}
              activeUnderlineColor={"#07B6D5"}
              textColor={"white"}
              value={groupDetail?.goals}
              onChangeText={(text) => {
                setGroupDetail((prevState) => ({
                  ...prevState,
                  goals: parseInt(text),
                }));
              }}
              keyboardType="decimal-pad"
            />
          </View>
          {isError.field == "all" && (
            <Text style={styles.errorMsg}>{isError.msg}</Text>
          )}
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              if (selectedGroup) {
                updateGroupDetail();
              } else {
                handleCreate();
              }
            }}
          >
            {isLoading ? (
              <ActivityIndicator color={"#f9fafb"} size={"small"} />
            ) : (
              <Text style={styles.btnTxt}>
                {selectedGroup ? `Update` : `Create`}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Delete Group", "Do you want to delete this group?", [
                { text: "Cancel", onPress: () => console.log("") },
                { text: "Confirm", onPress: () => deleteGroup() },
              ]);
            }}
            style={[styles.btn, { backgroundColor: "#C51935" }]}
          >
            <Text style={styles.btnTxt}>Delete Group</Text>
          </TouchableOpacity>
        </View>
        {imagePicker && (
          <ImageOptionsModal
            isVisible={imagePicker}
            onClose={() => setImagePicker(false)}
            onCamera={handleCameraImage}
            onGallery={handleImagePick}
            backColor={"#182130"}
            innerColor={"#111828"}
            cameraText={"Add Image"}
          />
        )}
      </Modal>
    </View>
  );
};

export default GroupScreen;

const styles = StyleSheet.create({
  heading: {
    color: "#fff",
    fontSize: totalSize(2),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "500",
  },
  rightBtn: {
    color: "#0891b2",
    fontSize: totalSize(2),
    fontWeight: "500",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width(95),
    alignSelf: "center",
    paddingHorizontal: width(3),
    backgroundColor: "#182130",
    marginTop: height(2),
    paddingVertical: height(2),
    borderRadius: totalSize(1),
  },
  rowBasic: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeading: {
    color: "#fff",
    fontSize: totalSize(2),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "700",
  },
  cardTotal: {
    color: "#fff",
    fontSize: totalSize(1.5),
    fontFamily: "IBMPlexSans-Regular",
    paddingVertical: 5,
  },
  avatar: {
    marginRight: -15,
  },
  userAvatar: {
    backgroundColor: "rgba(0,0,0,0.5)",
    height: totalSize(2.5),
    width: totalSize(2.5),
    borderRadius: totalSize(1.5),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -5,
  },
  editIcon: {
    resizeMode: "contain",
    height: totalSize(2),
    width: totalSize(2),
  },
  modal: {
    flex: 1,
    backgroundColor: "#111827",
  },
  input: {
    borderRadius: totalSize(1),
    height: height(6),
    overflow: "hidden",
    marginHorizontal: width(5),
    marginTop: height(2),
    borderColor: "#f43f5e",
  },
  btn: {
    backgroundColor: "#0891b2",
    borderRadius: totalSize(1),
    height: height(6),
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: width(5),
    marginTop: height(5),
  },
  btnTxt: {
    color: "#fff",
    fontSize: totalSize(2),
    fontWeight: "500",
  },
  errorMsg: {
    fontSize: totalSize(1.3),
    color: "#f43f5e",
    width: width(90),
    alignSelf: "center",
  },
});
