import { View, Text } from 'react-native'
import React from 'react'

const InputErrorComponent = ({ message }) => {
    return (
        <View className='p-4 mt-2 bg-red-900 border-solid border-2 border-red-700 rounded-xl font-ibmRegular w-11/12'>
            <Text className='text-white'>{message}</Text>
        </View>
    )
}

export default InputErrorComponent