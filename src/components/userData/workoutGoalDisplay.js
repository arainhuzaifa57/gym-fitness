import { View, Text } from 'react-native'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import CircularProgress from 'react-native-circular-progress-indicator'

const WorkoutGoalDisplay = () => {
    const totalRecordedWorkouts = useSelector((state) => state.userData.totalRecordedWorkouts)

    return (
        <View className='bg-gray-800 w-1/3 rounded-lg items-center justify-center mx-1'>
            <Text className='text-white text-base'>Weekly Workout</Text>
            <View className='my-2'>
                <CircularProgress
                    value={85}
                    radius={30}
                    inActiveStrokeColor={'#2ecc71'}
                    inActiveStrokeOpacity={0.2}
                    progressValueColor={'#fff'}
                    valueSuffix={'%'}
                />
            </View>
        </View>
    )
}

export default WorkoutGoalDisplay