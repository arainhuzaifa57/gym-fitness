import { View, Text, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native'
import React from 'react'
import RecordedWorkoutDayCards from '../../../../components/workout/recordedWorkoutDayCards'
import { useDispatch, useSelector } from 'react-redux'
import { Header } from '../../../../components/Header'
import { resetInitialState } from '../../../../api/features/workout/workoutSlice'
import { goBack } from '../../../../navigation/rootNavigation'
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import { decrementTotalWorkoutsCount, deleteDocumentFromPath, deleteWorkout } from '../../../../api/firebase/db'

const SelectedWorkoutDayHistory = () => {
  const workoutDayData = useSelector((state) => (state.workout));
  const dispatch = useDispatch();

  const goBackPage = () => {
    dispatch(resetInitialState())
    goBack()
  }

  const deleteSelectedWorkout = (docId) => {

    const currentUser = auth().currentUser;
    const userId = currentUser ? currentUser.uid : null;

    const deleteThenGoBack = (docId) => {
      deleteWorkout(docId, userId)
      goBack()
    };

    Alert.alert(
      "Confirm",
      "Do you want to delete your workout day history? ",
      [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => deleteThenGoBack(docId),
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView className="bg-gray-900 flex-1">
      <Header
        containerStyle={{ marginTop: 0 }}
        onBack={false}
        leftHeader={
          <TouchableOpacity
            className="flex-row items-center ml-2"
            onPress={goBackPage}
          >
            <Image
              source={require("../../../../constants/icons/arrow-left.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
            <Text className="text-white text-lg ml-1">{workoutDayData.workoutDay}</Text>
          </TouchableOpacity>
        }
        rightHeader={
          <TouchableOpacity
            className="mr-2 bg-icon-bg py-2 px-2 rounded-full"
            onPress={() => deleteSelectedWorkout(workoutDayData.id)}
          >
            <Image
              source={require("../../../../constants/icons/trash.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
          </TouchableOpacity>
        }
      />
      <RecordedWorkoutDayCards workoutDayData={workoutDayData} />
    </SafeAreaView>
  )
}

export default SelectedWorkoutDayHistory