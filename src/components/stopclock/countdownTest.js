import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'

const CountdownTest = () => {
    const [isPlaying, setIsPlaying] = React.useState(true)
  
    return (
      <View style={styles.container}>
        <CountdownCircleTimer
          isPlaying={isPlaying}
          duration={10}
          colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
          colorsTime={[10, 6, 3, 0]}
          onComplete={() => ({ shouldRepeat: true, delay: 2 })}
          updateInterval={1}
      >
        {({ remainingTime, color }) => (
          <Text style={{ color, fontSize: 40 }}>
            {remainingTime}
          </Text>
        )}
      </CountdownCircleTimer>
    </View>
    )
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ecf0f1',
      padding: 8,
    }
  });

export default CountdownTest