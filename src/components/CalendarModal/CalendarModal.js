/**
 * login modal component
 * @param param0 props accepted by this component
 * @returns React Component
 */
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Calendar } from "react-native-calendars";
import { getUserWeight } from "../../api/firebase/db";
import { useSelector } from "react-redux";
import moment from "moment";

const CalenderModal = (props) => {
  const {
    visible,
    onSwipeComplete,
    swipeDown = true,
    onBackdropPress = false,
    Data,
  } = props;
  const [markedData, setMarkedData] = useState({});

  const { userData } = useSelector((state) => state?.userData);

  useEffect(() => {
    getMarkedData();
  }, []);

  const getMarkedData = async () => {
    const response = await getUserWeight(userData?.id);
    let dates = response.map((item) => {
      return moment(item?.createdAt).format("YYYY-MM-DD");
    });
    let formattedDates = formatDates(dates);
    setMarkedData(formattedDates);
  };

  function formatDates(dates) {
    return dates.reduce((acc, date) => {
      const localDate = new Date(date).toISOString().split("T")[0];
      acc[localDate] = { selected: true, marked: true };
      return acc;
    }, {});
  }

  const CustomDay = ({ state, marking, date, onMarkedPress }) => {
    const isMarked = marking?.marked;

    if (state === "disabled") {
      return <Text className="text-center text-gray-500">{date.day}</Text>;
    }

    return (
      <TouchableOpacity
        onPress={() => onMarkedPress(date)}
        activeOpacity={isMarked ? 0.5 : 1}
      >
        <View
          style={{
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            borderWidth: isMarked ? 2 : 0, // Set border width for marked days
            borderColor: isMarked ? "#9ca3af" : "transparent", // Set border color for marked days
            backgroundColor: isMarked ? "transparent" : "transparent",
          }}
        >
          <Text
            style={{ textAlign: "center", color: isMarked ? "white" : "white" }}
          >
            {date.day}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      isVisible={visible}
      {...(swipeDown ? { swipeDirection: "down" } : {})}
      style={{
        justifyContent: "center",
        marginHorizontal: 20,
        margin: 0,
      }}
      backdropOpacity={0.5}
      onBackdropPress={() => {
        onBackdropPress && onSwipeComplete();
      }}
      onSwipeComplete={() => onSwipeComplete()}
    >
      <View
        style={{
          borderRadius: 6,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <View style={{ marginTop: 15 }}>
          <Calendar
            markedDates={markedData}
            dayComponent={({ date, state, marking }) => (
              <CustomDay
                date={date}
                state={state}
                marking={marking}
                onMarkedPress={() => Data(date)}
              />
            )}
            theme={{
              backgroundColor: "#1f2937",
              calendarBackground: "#1f2937",
              textSectionTitleColor: "#f9fafb",
              dayTextColor: "white",
              monthTextColor: "white",
            }}
            style={{ borderRadius: 15 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default CalenderModal;
