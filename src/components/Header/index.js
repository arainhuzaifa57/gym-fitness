import { TouchableOpacity, View, Image, Platform, Text } from "react-native";
import { goBack } from "../../navigation/rootNavigation";
import { height, width } from "react-native-dimension";

export const Header = ({
  containerStyle,
  onBack = true,
  onBackPress,
  leftHeader,
  rightHeader,
  title,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: width(2),
        width: width(100),
        marginTop: height(6),
        paddingVertical: height(1),
        borderBottomWidth: 1,
        borderBottomColor: "#182130",
        ...containerStyle,
      }}
    >
      {onBack ? (
        <TouchableOpacity
          onPress={() => {
            onBackPress !== undefined ? onBackPress() : goBack();
          }}
        >
          <Image
            source={require("../../constants/icons/arrow-left.png")}
            resizeMode="contain"
            style={{
              width: 25,
              height: 25,
            }}
          />
        </TouchableOpacity>
      ) : (
        leftHeader
      )}
      {title && (
        <Text
          style={{
            fontFamily: "IBMPlexSans-Regular",
            fontSize: 26,
            fontWeight: "500",
            color: "white",
          }}
        >
          {title}
        </Text>
      )}
      {rightHeader}
    </View>
  );
};
