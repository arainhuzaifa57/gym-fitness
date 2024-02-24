import { View, Text } from 'react-native'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import TotalRecordedWorkouts from './totalRecordedWorkouts'
import WeightGoalDisplay from './weightGoalDisplay'
import WorkoutGoalDisplay from './workoutGoalDisplay'

const UserDataDisplay = () => {
  const userData = useSelector((state) => state.userData)

  return (
    <View className='flex-row my-2 mx-4'>
      <TotalRecordedWorkouts/>
    </View>
  )
}

export default UserDataDisplay