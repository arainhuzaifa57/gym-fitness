import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Button, Image } from 'react-native';
// import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux'
import { setWarmUpDuration, updateRounds } from '../../api/features/tools/intervalTimerSlice';
import { navigate } from '../../navigation/rootNavigation';
import { routes } from '../../constants/routes';

const IntervalTimerDurations = ({ isRoundsValid, setIsRoundsValid }) => {
    const intervalData = useSelector((state) => state.intervalTimer?.template)
    const workDuration = intervalData?.activeDuration
    const restDuration = intervalData?.restDuration
    const warmUpDuration = intervalData?.warmUpDuration
    const rounds = intervalData?.rounds
    const coolDownDuration = intervalData?.coolDownDuration

    const dispatch = useDispatch()

    const handleSelectField = (field) => {
        // router.push({ pathname: '/tools/selectTimerModal', params: { field } })
        navigate(routes.selectTimerModal, { field })
    }

    const timeSelectionComponent = ({ field, data, title }) => {
        return <View>
            <View className='flex-row items-center justify-between'>
                <Text className='text-white'>{title}:</Text>
                <TouchableOpacity
                    onPress={() => handleSelectField(field)}
                    className='rounded-xl p-3 bg-gray-900 my-2 w-1/4'
                >
                    <Text className='text-white text-center'>{data?.minutes}m : {data?.seconds}s </Text>
                </TouchableOpacity>
            </View>
            <View className="border-b border-gray-700" />
        </View>
    }

    return (
        <View>
            <View className='mt-6'>
                <View className="flex-row items-center">
                    <Image
                        source={require("../../constants/icons/timer-stopwatch.png")}
                        resizeMode="contain"
                        style={{
                            width: 24,
                            height: 24,
                        }}
                    />
                    <Text className='text-white text-lg ml-1'>Set durations</Text>
                </View>
                {timeSelectionComponent({ field: 'warmUpDuration', data: warmUpDuration, title: 'Warm Up' })}
                {timeSelectionComponent({ field: 'activeDuration', data: workDuration, title: 'High Intensity' })}
                {timeSelectionComponent({ field: 'restDuration', data: restDuration, title: 'Rest' })}
                {timeSelectionComponent({ field: 'coolDownDuration', data: coolDownDuration, title: 'Cooldown' })}
                <View className='flex-row items-center justify-between'>
                    <Text className='text-white'>Rounds:</Text>
                    <TextInput className={isRoundsValid ? "rounded-xl p-3 bg-gray-900 my-2 w-1/4 text-white text-center" : "rounded-xl p-3 bg-gray-900 my-2 w-1/4 text-white text-center border-2 border-rose-500"}
                        placeholderTextColor={'gray'}
                        value={rounds}
                        onChangeText={text => dispatch(updateRounds(text))}
                        placeholder='#'
                        keyboardType='number-pad'
                        onFocus={() => isRoundsValid ? null : setIsRoundsValid(true)} 
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        width: '80%',
    },
});

export default IntervalTimerDurations;
