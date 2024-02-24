import { View, Text, FlatList, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native'
import React from 'react'
import { useDispatch } from 'react-redux'
import { replaceWithRecordedWorkoutData, setToRecordedWorkoutDayData, resetInitialState } from '../../api/features/workout/workoutSlice'
import { goBack, navigate } from '../../navigation/rootNavigation'
import { routes } from '../../constants/routes'
import { decrementTotalWorkoutsCount, deleteDocumentFromPath, deleteWorkout } from '../../api/firebase/db'
import auth from '@react-native-firebase/auth';
import { deleteRecordedWorkoutDay } from '../../api/features/workoutCalendar/workoutCalendarSlice'
import { Header } from '../Header'
import moment from 'moment'


const RecordedWorkoutDaysList = ({ recordedWorkoutData }) => {
    const dispatch = useDispatch()

    const goToRecordedWorkout = (item) => {
        dispatch(setToRecordedWorkoutDayData(item))
        navigate(routes.selectedWorkoutDayHistory)
    };

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
          }
      
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
    

    const Item = ({ item, index }) => (
        <View className='flex-row items-center mx-4'>
             <TouchableOpacity
                onPress={() => deleteSelectedWorkout(item.id)}
                className="bg-icon-bg py-2 px-2 rounded-full mr-1"
            >
                <Image
                    source={require('../../constants/icons/trash.png')}
                    style={{
                        width: 24,
                        height: 24,
                    }}
                />
            </TouchableOpacity>
            <TouchableOpacity
                className='rounded-lg bg-gray-900 flex-grow p-4 my-1'
                onPress={() => goToRecordedWorkout(item)}
            >
                <View className='flex-row justify-between flex-grow items-center'>
                    <Text className='ml-2 text-white'>{item.workoutDay}</Text>
                    <Image
                        source={require('../../constants/icons/arrow-right.png')}
                        resizeMode="contain"
                        className=''
                        style={{
                            width: 16,
                            height: 16,
                        }}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderItem = ({ item, index }) => {
        return (
            <Item
                item={item}
                index={index}
            />
        );
    };

    return (
        <SafeAreaView>
            <Header
                containerStyle={{ marginTop: 0 }}
                onBack={false}
                leftHeader={
                    <TouchableOpacity
                        className="flex-row items-center ml-2"
                        onPress={goBackPage}
                    >
                        <Image
                            source={require("../../constants/icons/arrow-left.png")}
                            resizeMode="contain"
                            style={{
                                width: 24,
                                height: 24,
                            }}
                        />
                        <Text className="text-white text-lg ml-1">{moment(recordedWorkoutData[0].createdAt).format('MMMM D, YYYY')}</Text>
                    </TouchableOpacity>
                }
            />
            <View className="items-center">
                <View className="bg-card-bg w-11/12 rounded-xl py-2 mt-4">
                    <View className='flex-row ml-4 my-2 items-center'>
                        <Image
                            source={require("../../constants/icons/weight-dumbbell.png")}
                            resizeMode="contain"
                            style={{
                                width: 30,
                                height: 30,
                            }}
                        />
                        <Text className='text-white font-ibmRegular text-lg ml-1 mb-2'>Workout History</Text>
                    </View>
                    <View>
                        <FlatList
                            data={recordedWorkoutData}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default RecordedWorkoutDaysList