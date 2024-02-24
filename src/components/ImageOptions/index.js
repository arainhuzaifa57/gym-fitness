import React, { useRef, useMemo, useEffect } from "react";
import {
  Image,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { width, height, totalSize } from "react-native-dimension";

const ImageOptionsModal = ({
  onClose,
  onCamera,
  onGallery,
  backColor,
  innerColor,
  cameraText,
  isVisible,
}) => {
  const bottomSheetRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "30%"], []);

  useEffect(() => {
    if (isVisible == true) {
      bottomSheetRef?.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current.close();
    }
  }, [isVisible]);

  return (
    <TouchableWithoutFeedback onPress={() => onClose()}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 1000,
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onClose={() => {
            // bottomSheetRef.current.close();
            onClose();
          }}
          enablePanDownToClose={true}
          backgroundStyle={{
            backgroundColor: backColor ?? "#111828",
          }}
          handleIndicatorStyle={{
            backgroundColor: "#fff",
            marginVertical: height(1),
          }}
        >
          <View
            style={{
              backgroundColor: innerColor ?? "#182130",
              width: width(100),
              // marginTop: height(2),
            }}
          >
            <Pressable
              style={{
                height: 78,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
              }}
              onPress={() => {
                onCamera();
                onClose()
              }}
            >
              <Image
                source={require("../../constants/icons/camera-Icon.png")}
                style={{ width: 28, height: 24, marginRight: 10 }}
              />
              <Text style={{ fontSize: 18, fontWeight: "400", color: "white" }}>
                {cameraText ?? `Add Image/Video`}
              </Text>
            </Pressable>
            <Pressable
              style={{
                height: 78,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => {
                onGallery();
                onClose()
              }}
            >
              <Image
                source={require("../../constants/icons/gallery.png")}
                style={{ width: 28, height: 24, marginRight: 10 }}
              />
              <Text style={{ fontSize: 18, fontWeight: "400", color: "white" }}>
                Upload from Gallery
              </Text>
            </Pressable>
          </View>
        </BottomSheet>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ImageOptionsModal;
