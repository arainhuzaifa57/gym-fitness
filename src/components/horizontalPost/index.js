import { StyleSheet, View, FlatList, Image, Animated } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { ExpandingDot } from "react-native-animated-pagination-dots";
import { width, height } from "react-native-dimension";
import VideoPlayer from "../VideoPlayer";

export const HorizontalPost = ({ postData, postIndex }) => {
  const [postViewable, setPostViewable] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setPostViewable(postIndex);
  }, [postIndex]);

  const onViewRef = useRef((viewable) => {
    // console.log("Visible items>>", viewable?.viewableItems);
    let viewableItem = viewable?.viewableItems;
    // console.log("Changed in this iteration", changed);
    if (viewableItem?.length > 0) {
      if (
        viewableItem[0]?.isViewable == true &&
        viewableItem[0]?.item?.fileType == "video/mp4"
      ) {
        setPostViewable(true);
      } else {
        setPostViewable(false);
      }
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  // console.log("Video  Focus>>", paused);
  return (
    <View
      style={{
        marginTop: height(1),
      }}
    >
      <FlatList
        data={postData}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
          }
        )}
        decelerationRate={"normal"}
        scrollEventThrottle={16}
        keyExtractor={(_, index) => index.toString()}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item, index }) => {
          if (item?.fileType == "video/mp4") {
            return (
              <VideoPlayer postIndex={postViewable} postUrl={item?.postUrl} />
            );
          } else {
            return (
              <View style={{ width: width(100) }}>
                <Image
                  source={{ uri: item?.postUrl }}
                  style={{
                    width: item?.width ?? width(100),
                    height: item?.height ?? height(47),
                  }}
                  resizeMode="contain"
                />
              </View>
            );
          }
        }}
      />
      {postData?.length > 1 && (
        <ExpandingDot
          data={postData}
          expandingDotWidth={30}
          scrollX={scrollX}
          inActiveDotOpacity={0.6}
          dotStyle={{
            width: 10,
            height: 10,
            backgroundColor: "#22d3ee",
            borderRadius: 5,
            marginHorizontal: 5,
          }}
          activeDotColor="#22d3ee"
          inActiveDotColor="#B0B0B0"
        />
      )}
    </View>
  );
};
