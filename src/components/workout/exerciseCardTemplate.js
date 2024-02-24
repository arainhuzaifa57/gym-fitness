import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateWeightSets, addSet, deleteSet, handleInputChange } from '../../api/features/workout/workoutSlice'


const ExerciseCardTemplate = ({ show, cardIndex, sets }) => {
    const [myTextInput, setMyTextInput] = useState([{ weight: '', rep: '' }])

    const dispatch = useDispatch()


    const deleteSetLocal = (index) => {
        let cloneArray = [...myTextInput]

        let filterArray = cloneArray.filter((val, i) => {
            if (i !== index) {
                return val
            }
        })
        setMyTextInput(filterArray)
        dispatch(deleteSet({ cardIndex, index }))
    }

    return (
        <View className='rounded w-11/12 mt-4 items-center'>
            {show ? (
                <View>
                    <View className="w-full mb-2" />
                    <View className="flex-row mb-2 w-11/12 border-b-2 border-gray-800">
                        <View className="p-4 mr-2"></View>
                        <View style={{ flex: 1, alignItems: 'center' }} >
                            <Text className="text-gray-400">Weight</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text className="text-gray-400">Reps</Text>
                        </View>
                        <View className="p-4 mr-2"></View>
                    </View>
            
                </View>
            ) : null}
            {show ? (
                sets.map((val, i) => {
                    return (
                        <View className="w-11/12">
                            <View className='flex-row items-center' key={i}>
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

                                        textAlign='center'
                                        value={val.weight}
                                        onChangeText={text => dispatch(handleInputChange({ cardIndex, i, field: "weight", text }))}
                                        placeholder='weight' />
                                </View>
                                <View className=" flex-1 items-center">
                                    <TextInput className="p-4 w-24 text-white rounded-xl bg-gray-900"
                                        placeholderTextColor={'gray'}

                                        textAlign='center'
                                        value={val.rep}
                                        onChangeText={text => dispatch(handleInputChange({ cardIndex, i, field: "rep", text }))}
                                        placeholder='reps' />
                                </View>
                                <View className="p-4 mr-2"></View>
                            </View>
                            <View className="border-b-2 border-gray-800 w-full my-2" />
                        </View>
                    )
                })
            ) : null}
            {show ? (
                <View className="items-center">
                    <TouchableOpacity
                        onPress={() =>  {
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

export default ExerciseCardTemplate