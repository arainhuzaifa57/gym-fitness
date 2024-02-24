import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import Sound from 'react-native-sound';


const CountdownTimerDisplay = ({ duration }) => {
  let MM = parseInt((duration / 60) % 60)
  let SS = parseInt(duration % 60)

  MM = (MM < 10) ? '0' + MM : MM
  SS = (SS < 10) ? '0' + SS : SS

  const convertDuration = ({ remainingTime }) => {
    let minutes = parseInt((duration / 60) % 60)
    let seconds = parseInt(duration % 60)

    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds

    return `${minutes}:${seconds}`
  }

  return (
    <View className='flex-row p-3 justify-between items-center'>
      <Text className='text-white w-48 text-center font-semibold'>{MM}:{SS}</Text>
    </View>
  )
}


const CounterdownTimer = () => {
  const [ticker, setTicker] = useState(null)
  const [duration, setDuration] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [alarmSound, setAlarmSound] = useState()

  useEffect(() => {
    // Set up the sound session for iOS
    Sound.setCategory('Ambient', true); // 'Ambient' allows mixing, 'true' indicates mixWithOthers
  
    // Initialize sound
    const alarm = new Sound('countdown_timer.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
      }
    });
  
    setAlarmSound(alarm);
  
    return () => {
      alarm.release();
    };
  }, []);

  useEffect(() => () =>
    clearInterval(ticker), [])

  const handleNewTimer = (minutes, seconds) => {

    const MM = parseInt(minutes || 0)
    const SS = parseInt(seconds || 0)

    const duration = SS + (MM * 60)

    if (duration > 0) {
      resetTimer()
      startTimer(duration)
    }
  }

  const startTimer = (duration) => {
    const newTicker = setInterval(() => {
      setDuration((prev) => {
        if (prev <= 1) {
          // Play sound
          alarmSound.play((success) => {
            if (!success) {
              console.log('Sound playback failed due to audio decoding errors');
            }
          });

          // Trigger alert
          alert('Hit your set!');
          clearInterval(newTicker);
          resetTimer();
        }
        return Math.max(prev - 1, 0)
      })
    }, 1000)

    if (duration) setDuration(duration)
    setTicker(newTicker)
    setIsPaused(false)
  }

  const pauseTimer = () => {
    clearInterval(ticker)
    setIsPaused(true)
  }

  const resetTimer = () => {
    clearInterval(ticker)
    setDuration(0)
    setIsPaused(false)
    setTicker(null)
  }

  const toggleTimer = () => {
    if (!isPaused) pauseTimer()
    else startTimer()
  }


  return (
    <View className="bg-card-bg rounded-xl items-center mt-2">
      {(ticker != null) ? (
        <View className=' flex-row'>
          <TouchableOpacity
            onPress={() => resetTimer()}
            className='w-1/4 items-center justify-center'>
            <Text className='text-white'>Cancel</Text>
          </TouchableOpacity>
          <View className='w-48'>
            <CountdownTimerDisplay duration={duration} />
          </View>
          <TouchableOpacity onPress={() => toggleTimer()}
            className={(isPaused ? 'rounded-r-xl bg-gray-900 border border-cyan-600 w-1/4 items-center justify-center' : 'rounded-r-xl bg-icon-bg w-1/4 items-center justify-center')}>
            {(isPaused) ?
              <Text className='text-white'>Start</Text> :
              <Text className='text-white'>Pause</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View className='flex-row'>
          <TouchableOpacity className='w-1/4 items-center justify-center'>
            <Text className='text-white'>Cancel</Text>
          </TouchableOpacity>

          <View className='flex-row divide-x-2 divide-gray-800'>

            <TextInput className="p-3  text-white w-24"
              placeholderTextColor={'gray'}
              textAlign='center'
              keyboardType='number-pad'
              value={minutes}
              onChangeText={text => setMinutes(text)}
              placeholder='minutes' />
            <TextInput className="p-3  text-white w-24"
              placeholderTextColor={'gray'}
              textAlign='center'
              keyboardType='number-pad'
              value={seconds}
              onChangeText={text => setSeconds(text)}
              placeholder='seconds' />
          </View>

          <TouchableOpacity
            onPress={() => handleNewTimer(minutes, seconds)}
            className='rounded-r-xl bg-gray-900  border border-cyan-600 w-1/4 items-center justify-center'>
            <Text className='text-white'>Start</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}


export default CounterdownTimer




