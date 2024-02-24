import { View, Text } from 'react-native'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import CircularProgress from 'react-native-circular-progress-indicator'

const WeightGoalDisplay = () => {
    const totalRecordedWorkouts = useSelector((state) => state.userData.totalRecordedWorkouts)

    return (
        <View className='w-1/3 rounded-lg items-center justify-center mx-1 border border-gray-800 bg-gray-800'>
            <Text className='text-white mt-2'>Weight</Text>
            <View className='my-2'>
                <CircularProgress
                    value={10}
                    radius={30}
                    inActiveStrokeColor={'#2ecc71'}
                    activeStrokeColor={'#dc2626'}
                    inActiveStrokeOpacity={0.2}
                    progressValueColor={'#fff'}
                    valueSuffix={'%'}
                />
            </View>
        </View>
    )
}

export default WeightGoalDisplay