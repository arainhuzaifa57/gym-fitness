import { View, Platform } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { width, height } from "react-native-dimension";
import Video from "react-native-video";
import MediaControls, { PLAYER_STATES } from "react-native-media-controls";
import VisibilitySensor from "@svanboxel/visibility-sensor-react-native";

const VideoPlayer = ({ postIndex, postUrl }) => {
  //  Media Control States
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [playerState, setPlayerState] = useState(PLAYER_STATES.PAUSED);

  const videoRef = useRef();

  const onSeek = (seek) => {
    videoRef?.current.seek(seek);
  };

  const onSeeking = (currentVideoTime) => setCurrentTime(currentVideoTime);

  const onReplay = () => {
    videoRef?.current.seek(0);
    setCurrentTime(0);
    if (Platform.OS === "android") {
      setPlayerState(PLAYER_STATES.PAUSED);
      setPaused(true);
    } else {
      setPlayerState(PLAYER_STATES.PLAYING);
      setPaused(false);
    }
  };

  const onProgress = (data) => {
    if (!isLoading) {
      setCurrentTime(data.currentTime);
    }
  };

  const onLoad = (data) => {
    setDuration(Math.round(data.duration));
    setIsLoading(false);
  };

  const onLoadStart = () => setIsLoading(true);

  const onEnd = () => {
    setPlayerState(PLAYER_STATES.ENDED);
    setCurrentTime(duration);
  };

  useEffect(() => {
    // console.log("Post INDex>>", postIndex);
    if (postIndex == true) {
      setPaused(false);
      setPlayerState(PLAYER_STATES.PLAYING);
    } else {
      setPaused(true);
      setPlayerState(PLAYER_STATES.PAUSED);
    }
  }, [postIndex]);

  return (
    <VisibilitySensor
      onChange={(isVisible) => {
        // console.log("Visible>>", isVisible);
        setPaused(isVisible ? false : true);
      }}
    >
      <View>
        <Video
          ref={videoRef}
          source={{ uri: postUrl }}
          paused={paused}
          style={{ height: height(40), width: width(100) }}
          // useTextureView={false}
          // disableFocus={true}
          resizeMode={"cover"}
          onEnd={onEnd}
          onLoad={onLoad}
          onLoadStart={onLoadStart}
          posterResizeMode={"cover"}
          onProgress={onProgress}
        />
        <MediaControls
          duration={duration}
          isLoading={isLoading}
          mainColor="#22d3ee"
          onPaused={(state) => {
            setPaused(!paused);
            setPlayerState(state);
          }}
          onReplay={onReplay}
          playerState={playerState}
          progress={currentTime}
          onSeek={onSeek}
          onSeeking={onSeeking}
        />
      </View>
    </VisibilitySensor>
  );
};

export default VideoPlayer;
