import { View, Text, Image } from 'react-native'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { TouchableOpacity } from '@gorhom/bottom-sheet'

const TotalRecordedWorkouts = () => {
    const totalWorkoutsCount = useSelector((state) => state.userData.totalWorkoutsCount)

    return (
        <View className='bg-card-bg flex-row w-1/3 rounded-2xl items-center justify-center p-4'>
            <Image
            source={require('../../constants/icons/weight-dumbbell.png')}
            style={{
                width: 30,
                height: 30,
              }}
            />
            <Text className='text-white text-base ml-1'>{totalWorkoutsCount ?? '0'}</Text>
        </View>
    )
}

export default TotalRecordedWorkouts