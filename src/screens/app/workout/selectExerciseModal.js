import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SectionList,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateExercise } from "../../../api/features/workout/workoutSlice";
import { goBack } from "../../../navigation/rootNavigation";
import { TextInput } from "react-native-paper";

const SelectExerciseModal = ({ route }) => {
  const { ex, i } = route.params;
  const [searchText, setSearchText] = useState("");

  const dispatch = useDispatch();

  const selectExercise = (item, i) => {
    dispatch(updateExercise({ item, i }));
    goBack();
  };

  const exerciseList = [
    {
      title: "BACK EXERCISES",
      data: [
        "Deadlift",
        "Pull-Up",
        "Lat Pulldown",
        "Barbell Row",
        "Dumbbell Row",
        "Seated Cable Row",
        "T-Bar Row",
        "Single-Arm Dumbbell Row",
        "Face Pull",
        "Chin-Up",
        "Hyperextension",
        "Pendlay Row",
        "Rack Pull",
        "Inverted Row",
        "Close-Grip Lat Pulldown",
        "Straight-Arm Pulldown",
        "Kroc Row",
        "Meadows Row",
        "Machine Row",
        "Romanian Deadlift",
      ],
    },
    {
      title: "CHEST EXERCISES",
      data: [
        "Bench Press",
        "Incline Bench Barbell Press",
        "Decline Bench Barbell Press",
        "Dumbbell Flyes",
        "Chest Dips",
        "Pec Deck Machine",
        "Cable Crossovers",
        "Incline Dumbbell Press",
        "Seated Machine Chest Press",
        "Close-Grip Bench Press",
        "Chest Press Machine",
        "Floor Press",
        "Landmine Press",
        "Decline Dumbbell Press",
        "Incline Cable Flye",
        "Butterfly Machine",
        "Dumbbell Pullover",
        "Reverse-Grip Bench Press",
        "Wide-Grip Barbell Bench Press",
        "Incline Bench Cable Flye",
      ],
    },
    {
      title: "SHOULDER EXERCISES",
      data: [
        "Barbell Overhead Shoulder Press",
        "Seated Dumbbell Shoulder Press",
        "Front Raise",
        "Lateral Raise",
        "Bent-Over Dumbbell Reverse Fly",
        "Arnold Press",
        "Upright Row",
        "Face Pull",
        "Shrugs",
        "Standing Military Press",
        "Push Press",
        "Reverse Pec Deck Fly",
        "Single-Arm Cable Lateral Raise",
        "Dumbbell Scaption",
        "Machine Shoulder Press",
        "Cable Front Raise",
        "Cable Reverse Fly",
        "Bradford Press",
        "Leaning Away Lateral Raise",
        "Butterfly Raise",
      ],
    },
    {
      title: "LEG EXERCISES",
      data: [
        "Squat",
        "Leg Press",
        "Deadlift",
        "Lunges",
        "Leg Extension",
        "Leg Curl",
        "Stiff-Legged Deadlift",
        "Front Squat",
        "Hack Squat",
        "Bulgarian Split Squat",
        "Romanian Deadlift",
        "Calf Raise",
        "Goblet Squat",
        "Sumo Squat",
        "Glute Bridge",
        "Box Jump",
        "Step-Up",
        "Hip Thrust",
        "Walking Lunge",
      ],
    },
    {
      title: "BICEP EXERCISES",
      data: [
        "Barbell Curl",
        "Dumbbell Curl",
        "Hammer Curl",
        "Preacher Curl",
        "Concentration Curl",
        "Cable Curl",
        "Reverse Curl",
        "Incline Dumbbell Curl",
        "EZ Bar Curl",
        "Seated Alternate Dumbbell Curl",
        "Standing Resistance Band Curl",
        "Chin-Up",
        "Zottman Curl",
        "Spider Curl",
        "Curl Machine",
      ],
    },
    {
      title: "TRICEP EXERCISES",
      data: [
        "Close-Grip Bench Press",
        "Tricep Dips",
        "Skull Crushers",
        "Overhead Tricep Extension",
        "Tricep Pushdown",
        "Diamond Push-Ups",
        "Rope Pushdown",
        "Dumbbell Kickback",
        "Single-Arm Cable Kickback",
        "Bench Dip",
        "Cable Overhead Tricep Extension",
        "Machine Tricep Extension",
        "Tricep Extension with Resistance Band",
        "Reverse Grip Tricep Pushdown",
        "Tate Press",
      ],
    },

    {
      title: "CALF EXERCISES",
      data: [
        "Standing Calf Raise",
        "Seated Calf Raise",
        "Leg Press Calf Raise",
        "Single-Leg Calf Raise",
        "Barbell Calf Raise",
        "Smith Machine Calf Raise",
        "Dumbbell Calf Raise",
        "Donkey Calf Raise",
        "Angled Calf Press",
        "Calf Raise on a Dumbbell",
      ],
    },
    {
      title: "ABS EXERCISES",
      data: [
        "Crunches",
        "Bicycle Crunches",
        "Russian Twists",
        "Plank",
        "Leg Raises",
        "Hanging Leg Raise",
        "Mountain Climbers",
        "Reverse Crunches",
        "V-Up",
        "Ab Roller",
        "Cable Crunch",
        "Wood Choppers",
        "Side Plank",
        "Flutter Kicks",
        "Toe Touches",
      ],
    },

  ];

  // Filter the data based on the search text
  const filteredData = exerciseList.reduce((acc, section) => {
    const filteredSectionData = section.data.filter((item) =>
      item.toLowerCase().includes(searchText.toLowerCase())
    );

    if (filteredSectionData.length > 0) {
      acc.push({
        ...section,
        data: filteredSectionData,
      });
    }

    return acc;
  }, []);

  // Render item in the SectionList
  const renderItem = ({ item }) => (
    <View className="pl-10 py-3">
      <TouchableOpacity onPress={() => selectExercise(item, i)}>
        <Text className="text-gray-400 mb-2">{item}</Text>
      </TouchableOpacity>
      <View className="border-b border-gray-800" />
    </View>
  );

  // Render each section in the SectionList
  const renderSectionHeader = ({ section: { title } }) => (
    <Text className="text-white text-base font-semibold pl-6 mt-3">{title}</Text>
  );

  return (
    <SafeAreaView className="bg-gray-900 flex-1">
      <View className="items-end bg-card-bg">
        <TouchableOpacity className=" w-12 mx-4 my-2" onPress={() => goBack()}>
          <Text className="text-cyan-600 font-semibold text-lg">Done</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center mt-6">
        <View className=" w-11/12 bg-custom-stroke mx-1 items-center">
          <TextInput
            label="Exercise Name"
            style={styles.txtinp}
            activeUnderlineColor={"#07B6D5"}
            textColor={"white"}
            autoCorrect={false}
            value={ex.exercise}
            onChangeText={(text) =>
              dispatch(updateExercise({ item: text, i }))
            }
            mode="flat"
            className='w-full px-2'
          />
        </View>
      </View>
      <View className="">
        <View className="flex-row items-center my-4 justify-center">
          <View className="border-b w-1/3 border-gray-400 mr-2" />
          <Text className="text-gray-400 font-semibold text-lg">OR</Text>
          <View className="border-b w-1/3 border-gray-400 ml-2" />
        </View>
      </View>
      <View className="flex justify-center">
        <View className="items-center">
          <View className=" w-11/12 bg-gray-900 rounded-lg items-center">
            <TextInput
              clearButtonMode="always"
              label="Search"
              style={styles.txtinp}
              activeUnderlineColor={"#07B6D5"}
              textColor={"white"}
              autoCorrect={false}
              value={searchText}
              onChangeText={setSearchText}
              className="w-full px-2"
            />
          </View>
        </View>
      </View>
      <SectionList
        stickySectionHeadersEnabled={false}
        sections={filteredData}
        keyExtractor={(item, index) => item + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 32,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
  },
  txtinpmain: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    // flex: 1,
    paddingHorizontal: 20,
  },
  txtinpcon: {
    borderRadius: 10,
    height: 55,
    overflow: "hidden",
    marginTop: 15,
    borderColor: "#f43f5e",
  },
  txtinp: {
    height: 57,
    overflow: "hidden",
    backgroundColor: "#172033",
  },
});

export default SelectExerciseModal;

