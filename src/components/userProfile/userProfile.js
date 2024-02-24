import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ScrollView } from 'react-native';

const UserProfile = ({userData}) => {


  return (
    <ScrollView>
    <View className='flex-1 p-8 items-center'>
      <Image source={{ uri: userData.profilePicture }} className='w-24 h-24 rounded-full' />
      <Text className='text-lg font-bold my-1'>{userData.name}</Text>
      <Text className='text-gray-600'>@{userData.username}</Text>
      <Text className='my-2'>{userData.bio}</Text>

      <View className='flex-row my-4'>
        <View className='flex-1 items-center'>
          <Text className='font-bold text-lg'>{userData.followers}</Text>
          <Text>Followers</Text>
        </View>
        <View className='flex-1 items-center'>
          <Text className='font-bold text-lg'>{userData.following}</Text>
          <Text>Following</Text>
        </View>
      </View>

      <FlatList
        data={null}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        )}
        numColumns={3}
      />
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({

  count: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  postImage: {
    width: '33%',
    height: 100
  }
});

export default UserProfile;
