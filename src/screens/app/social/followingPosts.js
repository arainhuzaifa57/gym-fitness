import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { PostComments } from "../../../components/postComments";
import moment from "moment";
import { width, height, totalSize } from "react-native-dimension";
import { appImages } from "../../../constants/images";
import { useSelector } from "react-redux";
import { getFollowingUserPosts } from "../../../api/firebase/db";
import { PostList } from "../../../components/postList";
import { useFocusEffect } from "@react-navigation/native";

const FollowingPosts = ({ tab, setSelectedTab }) => {
  const [postComments, setPostComments] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [followingPosts, setFollowPosts] = useState([]);
  const [postIndex, setPostIndex] = useState(false);
  const [lastPost, setLastPost] = useState(0);

  const { userData, allUsers } = useSelector((state) => state?.userData);

  useFocusEffect(
    useCallback(() => {
      if (userData) {
        getPost();
      }
    }, [userData])
  );

  const getPost = async () => {
    if (userData?.userData?.followings?.length > 0) {
      let { newPosts, lastDocument } = await getFollowingUserPosts(
        userData?.userData?.followings,
        lastPost
      );
      let posts = [...followingPosts, ...newPosts];
      const arrayUniqueByKey = [
        ...new Map(posts.map((item) => [item["id"], item])).values(),
      ];
      let arr = arrayUniqueByKey?.filter((item) => {
        if (
          !userData?.userData?.blockUsers?.includes(item?.user?.userID) &&
          !checkBlock(item?.user?.userID)
        ) {
          return item;
        }
      });
      setFollowPosts(arr);
      setLastPost(lastDocument);
    }
    setLoading(false);
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

  const checkBlock = (id) => {
    let block = false;
    let user = allUsers?.filter((item) => {
      return item.uid == id;
    });
    // console.log("Post User>>", user);
    if (user[0]?.blockUsers?.includes(userData?.id)) {
      block = true;
    } else {
      block = false;
    }
    // console.log("Block>>", block);
    return block;
  };

  return (
    <View className="flex-1 bg-gray-900">
      <View style={styles.tabsView}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => {}}>
          <Text style={tab == 0 ? styles.selectedTabBtnTxt : styles.tabBtnTxt}>
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
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setSelectedTab(1)}
        >
          <Text style={tab == 1 ? styles.selectedTabBtnTxt : styles.tabBtnTxt}>
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
      </View>
      {isLoading ? (
        <ActivityIndicator
          color={"#f9fafb"}
          size={"large"}
          style={styles.indicator}
        />
      ) : (
        <FlatList
          data={followingPosts?.sort(
            (a, b) => moment(b.createdAt) - moment(a.createdAt)
          )}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          keyExtractor={(_, index) => index.toString()}
          refreshing={postIndex}
          renderItem={({ item }) => {
            return (
              <PostList
                item={item}
                currentUser={userData}
                userPosts={followingPosts}
                liked={item?.likes?.includes(userData?.id)}
                dummyUrl={appImages?.dummyUrl}
                onDone={getPost}
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
      )}
      {postComments !== null && (
        <PostComments
          isVisible={postComments ? true : false}
          onClose={() => setPostComments(null)}
          postData={postComments}
          onDone={() => getPost()}
        />
      )}
    </View>
  );
};

export default FollowingPosts;

const styles = StyleSheet.create({
  tabsView: {
    marginBottom: height(0),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: height(7),
    width: width(100),
  },
  tabBtn: {
    width: width(24),
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
  indicator: {
    alignSelf: "center",
    top: height(20),
    position: "absolute",
    zIndex: 1000,
  },
  emptyTxt: {
    color: "grey",
    textAlign: "center",
    fontSize: totalSize(2),
    marginTop: height(20),
  },
});
