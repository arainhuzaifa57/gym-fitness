import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Switch
} from "react-native";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CircularProgress from "react-native-circular-progress-indicator";
import { goBack } from "../../../../navigation/rootNavigation";
import Sound from "react-native-sound";

const UseIntervalTimerPage = () => {
  const intervalData = useSelector((state) => state.intervalTimer.template);
  const workDuration = intervalData.activeDuration;
  const restDuration = intervalData.restDuration;
  const warmUpDuration = intervalData.warmUpDuration;
  const rounds = intervalData.rounds;
  const coolDownDuration = intervalData.coolDownDuration;
  const [isSoundEnabled, setIsSoundEnabled] = useState(true); // default value
  const [currentRound, setCurrentRound] = useState(1);
  const [currentInterval, setCurrentInterval] = useState("Warm Up");
  const [timeRemaining, setTimeRemaining] = useState(
    +warmUpDuration.minutes * 60 + +warmUpDuration.seconds
  );
  const [isRunning, setIsRunning] = useState(true);
  const [warmupSound, setWarmupSound] = useState(null);
  const [workSound, setWorkSound] = useState(null);
  const [restSound, setRestSound] = useState(null);
  const [cooldownSound, setCooldownSound] = useState(null);

  useEffect(() => {
    Sound.setCategory('Ambient', true);

    // Define a function to play the appropriate sound based on the current interval
    const playInitialSound = (sound) => {
      if (isSoundEnabled && sound) {
        sound.play();
      }
    };
  
    // Load the warmup sound and check if it should be played initially
    const warmup = new Sound('warm_up.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load warmup sound', error);
      } else if (currentInterval === "Warm Up") {
        playInitialSound(warmup);
      }
    });
  
    // Load the work sound
    const work = new Sound('high_intensity.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load work sound', error);
      } else if (currentInterval === "Work") {
        playInitialSound(work);
      }
    });
  
    // Load the rest sound
    const rest = new Sound('low_intensity.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load rest sound', error);
      } else if (currentInterval === "Rest") {
        playInitialSound(rest);
      }
    });
  
    // Load the cooldown sound
    const cooldown = new Sound('cool_down.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load cooldown sound', error);
      } else if (currentInterval === "Cool Down") {
        playInitialSound(cooldown);
      }
    });
  
    // Set the sound state
    setWarmupSound(warmup);
    setWorkSound(work);
    setRestSound(rest);
    setCooldownSound(cooldown);
  
    // Cleanup function to release the sounds when the component unmounts
    return () => {
      warmup.release();
      work.release();
      rest.release();
      cooldown.release();
    };
  }, [currentInterval, isSoundEnabled]); // Add dependencies to useEffect

  
  let bgColor;
  let initialValue;

  // switch to get field type background colors
  switch (currentInterval) {
    case "Warm Up":
      bgColor = "bg-card-bg flex-1";
      break;
    case "Work":
      bgColor = "bg-cyan-600 flex-1";
      break;
    case "Rest":
      bgColor = "bg-icon-bg flex-1";
      break;
    case "Cool Down":
      bgColor = "bg-gray-900 flex-1";
      break;
  }
  
  // switch to calculate total value in seconds.
  switch (currentInterval) {
    case "Warm Up":
      initialValue = +warmUpDuration.minutes * 60 + +warmUpDuration.seconds;
      break;
    case "Work":
      initialValue = +workDuration.minutes * 60 + +workDuration.seconds;
      break;
    case "Rest":
      initialValue = +restDuration.minutes * 60 + +restDuration.seconds;
      break;
    case "Cool Down":
      initialValue = +coolDownDuration.minutes * 60 + +coolDownDuration.seconds;
      break;
  }

  // Interval Timer
  useEffect(() => {
    let intervalId;

    const handleIntervalChange = () => {
      if (currentInterval === "Warm Up") {
        setCurrentInterval("Work");
        if (isSoundEnabled && workSound) workSound.play();
        setTimeRemaining(+workDuration.minutes * 60 + +workDuration.seconds); // Convert to seconds
      } else if (currentInterval === "Work") {
        setCurrentInterval("Rest");
        if (isSoundEnabled && restSound) restSound.play();
        setTimeRemaining(+restDuration.minutes * 60 + +restDuration.seconds); // Convert to seconds
      } else if (currentInterval === "Rest") {
        if (currentRound < rounds) {
          setCurrentInterval("Work");
          if (isSoundEnabled && workSound) workSound.play();
          setCurrentRound((prevRound) => prevRound + 1);
          setTimeRemaining(+workDuration.minutes * 60 + +workDuration.seconds); // Convert to seconds
        } else {
          setCurrentInterval("Cool Down");
          if (isSoundEnabled && cooldownSound) cooldownSound.play();
          setTimeRemaining(
            +coolDownDuration.minutes * 60 + +coolDownDuration.seconds
          ); // Convert to seconds
        }
      } else if (currentInterval === "Cool Down") {
        setIsRunning(false);
      }
    };

    if (isRunning) {
      if (timeRemaining > 0) {
        intervalId = setInterval(() => {
          setTimeRemaining((prevTime) => prevTime - 1);
        }, 1000);
      } else {
        handleIntervalChange();
      }
    };

    return () => clearInterval(intervalId);
  }, [
    workDuration,
    restDuration,
    rounds,
    warmUpDuration,
    coolDownDuration,
    timeRemaining,
    isRunning,
    currentRound,
    currentInterval,
  ]);

  // function to start timer
  const startTimer = () => {
    setIsRunning(true);
    setCurrentRound(1);
    setCurrentInterval("Warm Up");
    setTimeRemaining(+warmUpDuration.minutes * 60 + +warmUpDuration.seconds); // Convert to seconds
  };

  // handle start and stop of interval timer
  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      if (
        currentInterval === "Warm Up" &&
        currentRound === 1 &&
        timeRemaining === null
      ) {
        startTimer();
      } else {
        setIsRunning(true);
      }
    }
  };

  const getTotalTimeForCurrentInterval = () => {
    switch (currentInterval) {
      case "Warm Up":
        return +warmUpDuration.minutes * 60 + +warmUpDuration.seconds;
      case "Work":
        return +workDuration.minutes * 60 + +workDuration.seconds;
      case "Rest":
        return +restDuration.minutes * 60 + +restDuration.seconds;
      case "Cool Down":
        return +coolDownDuration.minutes * 60 + +coolDownDuration.seconds;
      default:
        return 0;
    }
  };

  function formatTimeProgress(progress) {
    "worklet";
    // Assuming maxValue is 100 and represents seconds
    const totalSeconds = Math.round(progress);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  const exitTimer = () => {
    goBack();
  };

  return (
    <SafeAreaView className={bgColor}>
      <View className="flex-row justify-between items-center">
        <TouchableOpacity onPress={() => exitTimer()}>
          <View className="flex-row items-center ml-4">
            <Image
              source={require("../../../../constants/icons/close-white.png")}
              resizeMode="contain"
              style={{
                width: 30,
                height: 30,
              }}
            />
          </View>
        </TouchableOpacity>
        <View className="flex-row items-center mr-4">
          <Text className="text-white text-lg ml-4 mr-2">
            SOUND
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#21B9DE" }}
            thumbColor={isSoundEnabled ? "#FFFFFF" : "#FFFFFF"}
            onValueChange={() => setIsSoundEnabled(previousState => !previousState)}
            value={isSoundEnabled}
          />
        </View>
      </View>
      <View className="flex-1 items-center justify-center">
        <CircularProgress
          key={currentInterval}
          value={timeRemaining}
          initialValue={initialValue}
          clockwise={false}
          maxValue={getTotalTimeForCurrentInterval()}
          radius={140}
          activeStrokeWidth={10}
          inactiveStrokeWidth={8}
          activeStrokeColor="#e0e0e0"
          inactiveStrokeColor="#f3f3f3"
          duration={1000} // Align with 1 second interval
          progressFormatter={formatTimeProgress}
        />

        <Text className="text-white text-xl mt-4">{`${currentInterval}`}</Text>
        <Text className="text-white text-xl">{`Round ${currentRound} of ${rounds}`}</Text>
        <View className="bg-gray-900 rounded-xl w-1/4 mt-8 border-solid border-2 border-cyan-600">
          <TouchableOpacity
            onPress={handleStartStop}
            className="items-center"
          >
            <Text className="text-white text-lg">{isRunning ? "Pause" : "Start"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UseIntervalTimerPage;
