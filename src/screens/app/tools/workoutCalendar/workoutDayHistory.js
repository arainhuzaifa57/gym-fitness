import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import LoadingIndicator from '../../../../components/loadingIndicator'
import RecordedWorkoutDayCards from '../../../../components/workout/recordedWorkoutDayCards'
import RecordedWorkoutDaysList from '../../../../components/workout/recordedWorkoutDaysList'
import SelectedWorkoutDayHistory from './selectedWorkoutDayHistory'
import { navigate } from '../../../../navigation/rootNavigation'
import { routes } from '../../../../constants/routes'
import { setToRecordedWorkoutDayData } from '../../../../api/features/workout/workoutSlice'

const WorkoutDayHistory = () => {
    const recordedWorkoutDays = useSelector((state) => state.workoutCalendar.recordedWorkoutDays)
    const isLoading = useSelector((state) => state.workoutCalendar.isLoading)
    const dispatch = useDispatch()

    const goToRecordedWorkout = (item) => {
        dispatch(setToRecordedWorkoutDayData(item))
        
        return (
            <SelectedWorkoutDayHistory/>
        )
    }

    if (isLoading) {
        return <LoadingIndicator />
    }

    return (
        <SafeAreaView className='flex-1 bg-gray-900'>
            {
                recordedWorkoutDays.length === 1 && typeof recordedWorkoutDays[0] === 'object' && recordedWorkoutDays[0] !== null
                    ?
                    (
                        goToRecordedWorkout(recordedWorkoutDays[0])
                    )
                    :
                    (
                        // Render UI for other cases
                        <RecordedWorkoutDaysList recordedWorkoutData={recordedWorkoutDays}/>
                        // Adjust this part based on how you want to display when there are multiple or no recorded days
                    )
            }
        </SafeAreaView>
    )
}

export default WorkoutDayHistory