import React, { useState } from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import ImageModal from "../ImageModal/ImageModal";
import moment from "moment";
import { handleWeightConverter } from "../../utils/helpingMethods";
import { totalSize, width, height } from "react-native-dimension";
import Entypo from "react-native-vector-icons/Entypo";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { deleteUserWeight } from "../../api/firebase/db";
import { useSelector } from "react-redux";
import { navigate } from "../../navigation/rootNavigation";
import { routes } from "../../constants/routes";

const WeightDetails = ({ data, onDone }) => {
  const [open, setOpen] = useState(0);
  const [Images, setImage] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const { userData } = useSelector((state) => state?.userData);
  const handleDelete = async (id) => {
    await deleteUserWeight(userData?.id, id).then(() => {
      onDone();
    });
  };

  return (
    <View>
      {data?.map((item, index) => {
        return (
          <View
            style={{ paddingHorizontal: 10, marginVertical: 4 }}
            key={index}
          >
            <TouchableOpacity
              style={{
                ...styles.mainView,
                borderBottomLeftRadius: open == item?.id ? 0 : 10,
                borderBottomRightRadius: open == item?.id ? 0 : 10,
              }}
              onPress={() => {
                if (open == 0) {
                  setOpen(item?.id);
                } else {
                  setOpen(0);
                }
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: "white" }}>Date: </Text>
                <Text style={{ color: "rgba(164, 164, 164, 1)" }}>
                  {moment(item?.createdAt).format("MM/DD/YYYY")}
                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: "white" }}>Weight: </Text>
                <Text style={{ color: "rgba(164, 164, 164, 1)" }}>{`${
                  item?.weightUnit !== "lbs"
                    ? handleWeightConverter(item?.weight, item?.weightUnit)
                    : item?.weight
                } ${item?.weightUnit}`}</Text>
              </View>
              <Menu>
                <MenuTrigger>
                  <Entypo name="dots-three-vertical" size={24} color="#fff" />
                </MenuTrigger>
                <MenuOptions
                  customStyles={{
                    optionsContainer: {
                      marginTop: height(4),
                      width: width(30),
                      backgroundColor: "#232E41",
                      borderRadius: 5,
                      paddingLeft: width(2),
                      paddingVertical: height(0.5),
                    },
                  }}
                >
                  <MenuOption
                    onSelect={() =>
                      navigate(routes.addWeight, {
                        type: "edit",
                        weight: item,
                      })
                    }
                  >
                    <Text style={{ ...styles.menuOptionText, color: "#fff" }}>
                      Edit
                    </Text>
                  </MenuOption>
                  <MenuOption onSelect={() => handleDelete(item?.id)}>
                    <Text style={styles.menuOptionText}>Delete</Text>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </TouchableOpacity>
            {open == item?.id && (
              <View style={styles.imageView}>
                {item?.weightImages?.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {item?.weightImages?.map((i, ind) => {
                      let imagesLength = item?.weightImages?.length;
                      return (
                        <TouchableOpacity
                          key={ind}
                          onPress={() => {
                            setImageIndex(ind);
                            setImage(item?.weightImages);
                          }}
                          style={{
                            marginBottom: 10,
                            alignSelf: "center",
                            marginRight: width(imagesLength == 1 ? 0 : 2),
                          }}
                        >
                          <Image
                            source={{ uri: i?.postUrl }}
                            style={{
                              height: height(25),
                              width: width(imagesLength == 1 ? 93 : 40),
                              resizeMode: "cover",
                              borderRadius: 5,
                            }}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        );
      })}
      {Images.length > 0 && (
        <ImageModal
          visible={true}
          onSwipeComplete={() => {
            setImage([]);
            setImageIndex(0);
          }}
          onBackdropPress
          images={Images}
          index={imageIndex}
        />
      )}
    </View>
  );
};

export default WeightDetails;

const styles = StyleSheet.create({
  menuOptionText: {
    fontSize: totalSize(2),
    color: "red",
  },
  mainView: {
    height: 53,
    backgroundColor: `#172033`,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    justifyContent: "space-between",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  imageView: {
    backgroundColor: "#172033",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 4,
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 10,
  },
});
