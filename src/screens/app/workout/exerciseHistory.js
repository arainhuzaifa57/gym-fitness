import { View, Text } from 'react-native'
import React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import moment from 'moment';

const ExerciseHistory = ({ route, navigation }) => {
  const { exerciseHistory } = route.params;


  return (
    <View className="bg-gray-900 flex-1">
      <View className="bg-card-bg p-3 items-center mb-3">
        <View className="border-2 border-gray-400 rounded-2xl w-16" />
      </View>
      <View className="mx-4">
      {exerciseHistory.length === 0 ? (
            <Text className="text-white text-lg text-center">No Exercise History Available</Text>
        ) : (
        <ScrollView>
          {exerciseHistory.slice().reverse().map((ex, i) => {
            return (<View className="mt-2 bg-card-bg rounded-xl items-center" key={i}>
              <View className="bg-gray-900 items-center rounded-lg w-48 py-1 my-2">
                <Text className="text-white text-base text-center">{moment(ex.date).format('MMMM D, YYYY')}</Text>
              </View>
              <View className="flex-row items-center justify-center w-1/2 mt-2">
                <View className="flex-1 item-center">
                  <Text className="text-gray-400 text-center">Weight</Text>
                </View>
                <View className="flex-1 item-center">
                  <Text className="text-gray-400 text-center">Reps</Text>
                </View>
              </View>
              <View className="border border-gray-800 w-1/2 mt-1" />
              {ex.sets.map((set, i) => {
                return (<View className="my-1 w-1/2 mb-2">
                  <View className="flex-row items-center justify-center">
                    <View className="flex-1 item-center">
                      <Text className="text-white text-base text-center">{set.weight}</Text>
                    </View>
                    <View className="flex-1 item-center">
                      <Text className="text-white text-base text-center">{set.rep}</Text>
                    </View>
                  </View>
                  {i < ex.sets.length - 1 && <View className="border border-gray-800" />}
                </View>)
              })}
            </View>)

          })}
        </ScrollView>
        )}
      </View>
    </View>
  )
}

export default ExerciseHistory