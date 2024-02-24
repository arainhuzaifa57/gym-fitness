/**
 * login modal component
 * @param param0 props accepted by this component
 * @returns React Component
 */
import React from "react";
import { Image, TouchableWithoutFeedback, FlatList } from "react-native";
import Modal from "react-native-modal";
import { height, width, totalSize } from "react-native-dimension";

const ImageModal = ({
  visible,
  onSwipeComplete,
  swipeDown = true,
  onBackdropPress = false,
  images,
  index,
}) => {
  console.log("Image Index>>", index);
  return (
    <Modal
      isVisible={visible}
      {...(swipeDown ? { swipeDirection: "down" } : {})}
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
      backdropOpacity={0.8}
      onBackdropPress={() => {
        onBackdropPress && onSwipeComplete();
      }}
      onBackButtonPress={() => onSwipeComplete()}
      onSwipeComplete={() => onSwipeComplete()}
    >
      <FlatList
        data={images}
        initialScrollIndex={index ?? 0}
        onScrollToIndexFailed={(info) => {
          console.log("Failed Index>>", info.index);
        }}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          width: width(100),
          // flex: 1,
        }}
        renderItem={({ item }) => (
          <TouchableWithoutFeedback onPress={onSwipeComplete}>
            <Image
              source={{ uri: item?.postUrl }}
              style={{
                height: height(100),
                width: width(100),
              }}
              resizeMode="contain"
            />
          </TouchableWithoutFeedback>
        )}
      />
    </Modal>
  );
};

export default ImageModal;
