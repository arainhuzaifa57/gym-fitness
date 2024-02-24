import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'

const LoadingIndicator = () => {
  return (
    <ActivityIndicator size="large" color="#f9fafb" className='bg-gray-900 flex-1'/>
  )
}

export default LoadingIndicator