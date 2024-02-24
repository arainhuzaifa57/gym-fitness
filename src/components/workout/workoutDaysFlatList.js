import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'

const WorkoutDaysFlatList = ({ workoutProgram }) => {

    const Item = ({ item, index }) => (
        <View className='w-2/3  my-2 items-center flex-row'>
            <TouchableOpacity
                className='w-2/3 h-10 border-solid border-2 border-gray-700 rounded-lg items-center justify-center'
                onPress={() => console.log(item.workoutDay)}
            >
                <Text className='text-white'>{item.workoutDay}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderItem = ({ item, index }) => {
        return (
            <View className='items-center'>
                <Item
                    item={item}
                    index={index}
                />
            </View>
        );
    };

    return (
        <View>
            <FlatList
                data={workoutProgram.workoutDays}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                className=' bg-gray-800 grow-0 w-11/12 my-2 rounded-lg'
            />
        </View>
    )
}

export default WorkoutDaysFlatList