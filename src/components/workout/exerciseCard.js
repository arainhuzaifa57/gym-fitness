import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateWeightSets, addSet, deleteSet, handleInputChange } from '../../api/features/workout/workoutSlice'
import { deleteTemplateSet } from '../../api/features/workout/workoutTemplate'
import { navigate } from '../../navigation/rootNavigation'
import { routes } from '../../constants/routes'


const ExerciseCard = ({ show, cardIndex, sets, templateSets, lastWorkoutData, exerciseHistory }) => {
  const [myTextInput, setMyTextInput] = useState([{ weight: '', rep: '' }])
  // Initialize local state for user inputs
  const [userInputs, setUserInputs] = useState(templateSets.map(() => ({ weight: '', rep: '' })));

  const dispatch = useDispatch()
  // console.log("Last workout data for card:", lastWorkoutData);


  const deleteSetLocal = (index) => {
    dispatch(deleteSet({ cardIndex, index }))
    dispatch(deleteTemplateSet({ cardIndex, index }))
  }

  return (
    <View className='rounded  w-11/12 mt-4'>
      {show ? (
        <View>
          <View className="flex-row items-center">
            <View className="px-4 mr-2"></View>
            <View style={{ flex: 1, alignItems: 'center' }} >
              <Text className="text-gray-400">Weight</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text className="text-gray-400">Reps</Text>
            </View>
            <TouchableOpacity
            onPress={() => navigate(routes.exerciseHistory, { exerciseHistory })}
            style={{ flex: 1, alignItems: 'center' }} className="bg-icon-bg rounded-full py-1"
            >
                <Text className="text-cyan-600">History</Text>
            </TouchableOpacity>
          </View>
          <View className="border-t-2 border-gray-800 w-full my-2" />
        </View>
      ) : null}
      {show ? (
        sets.map((val, i) => {

          const placeholderWeight = templateSets[i] && templateSets[i].weight !== '' ? templateSets[i].weight : 'weight';
          const placeholderRep = templateSets[i] && templateSets[i].rep !== '' ? templateSets[i].rep : 'reps';

          // Check if last workout data for this set exists
          const prevSet = lastWorkoutData && lastWorkoutData.sets[i];
          const prevDisplay = prevSet ? `${prevSet.weight} x ${prevSet.rep}` : "N/A";

          return (
            <View className="w-full"  key={i}>
              <View className='flex-row items-center'>
                <TouchableOpacity
                  onPress={() => deleteSetLocal(i)}
                  className="bg-icon-bg px-1 py-1 rounded-full mr-2"
                >
                  <Image source={require('../../constants/icons/minus.png')}
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  />
                </TouchableOpacity>


                <View className="flex-1 items-center">
                  <TextInput className="p-4 w-24 text-white rounded-xl bg-gray-900"
                    placeholderTextColor={'gray'}
                    keyboardType='number-pad'
                    textAlign='center'
                    value={val.weight}
                    onChangeText={text => dispatch(handleInputChange({ cardIndex, i, field: "weight", text }))}
                    placeholder={placeholderWeight} />
                </View>

                <View className=" flex-1 items-center">
                  <TextInput className="p-4 w-24 text-white rounded-xl bg-gray-900"
                    placeholderTextColor={'gray'}
                    keyboardType='number-pad'
                    textAlign='center'
                    value={val.rep}
                    onChangeText={text => dispatch(handleInputChange({ cardIndex, i, field: "rep", text }))}
                    placeholder={placeholderRep} />
                </View>

                <View className="rounded-xl flex-1 items-center">
                  <Text className="p-4 w-24 text-gray-400 text-center">
                    {prevDisplay}
                  </Text>
                </View>
              </View>
              <View className="border-b-2 border-gray-800 w-full my-2" />
            </View>
          )
        })
      ) : null}
      {show ? (
        <View className="items-center">
          <TouchableOpacity
            onPress={() => {
              dispatch(addSet(cardIndex));
        
            }}
            className='justify-center py-1 my-1 items-center rounded-lg bg-gray-900 border border-cyan-600 w-1/4 h-8 mb-3'
          >
            <View className='flex-row items-center px-4'>
              <Image
                source={require('../../constants/icons/add-white.png')}
                resizeMode="contain"
                style={{
                  width: 14,
                  height: 14,
                }}
                className='mr-1'
              />
              <Text className='text-white'>Set</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  )
}

export default ExerciseCard