import { useState, useRef, useEffect } from "react";
import { Box, Flex, IconButton, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";

const BackgroundVideo = ({ backgroundVideo }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    video.addEventListener("timeupdate", updateProgress);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

  return (
    <Box position="relative" h={{ base: "320px", md: "460px" }} w="100%" overflow="hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <source
          src={backgroundVideo || "https://res.cloudinary.com/dekfm4tfh/video/upload/v1743332932/bnvqlheuhidefliyifoz.mp4"}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Controls Container */}
      <Flex
        position="absolute"
        bottom={{ base: "2px", md: "2px" }}
        left={{ base: "70%", md: "50%" }}
        transform="translateX(-50%)"
        width={{ base: "50%", md: "30%" }}
        bg="rgba(0, 0, 0, 0.5)"
        borderRadius="md"
        p="1"
        opacity="0.8"
        _hover={{ opacity: 1 }}
        transition="opacity 0.2s"
        zIndex="10"
        alignItems="center"
      >
        <IconButton
          aria-label={isPlaying ? "Pause" : "Play"}
          icon={
            isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" ry="1"></rect>
                <rect x="14" y="4" width="4" height="16" rx="1" ry="1"></rect>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )
          }
          onClick={togglePlay}
          // colorScheme="whiteAlpha"
          bg={'teal.500'}
          color="white"
          size={{ base: "sm", md: "md" }}
          mr="2"
        />

        <Slider
          value={progress}
          onChange={handleSeek}
          min={0}
          max={100}
          flex="1"
          mx="2"
          focusThumbOnChange={false}
        >
          <SliderTrack bg="gray.600">
            <SliderFilledTrack bg="white" />
          </SliderTrack>
          <SliderThumb boxSize={{ base: 2, md: 3 }} bg="white" />
        </Slider>

        <IconButton
          aria-label={isMuted ? "Unmute" : "Mute"}
          icon={
            isMuted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2"></line>
                <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2"></line>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" fill="none"></path>
              </svg>
            )
          }
          onClick={toggleMute}
          variant="ghost"
          colorScheme="whiteAlpha"
          color="white"
          size={{ base: "sm", md: "md" }}
        />
      </Flex>
    </Box>
  );
};

export default BackgroundVideo;
