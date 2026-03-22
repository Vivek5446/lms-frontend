'use client'
import {
  Box,
  Center,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { IoIosPause, IoIosPlay, IoIosVolumeHigh, IoIosVolumeMute } from 'react-icons/io';
import CustomButton from '../../../../component/common/CustomButton/CustomButton';
import ScheduleSession from '../../../../component/common/scheduleSession/scheduleSession';
import StatsGrid from '../../../../component/common/StatsComponent/StatsComponrnt';
import BackgroundVideo from './BackgroundVideo';

// Add TypeScript declarations for YouTube API
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars: Record<string, any>;
          events: Record<string, any>;
        }) => {
          playVideo: any;
          pauseVideo: any;
          setVolume: any;
          mute: any;
          unMute: any;
          getVolume: any;
          isMuted: any;
          getCurrentTime: any;
          getDuration: any;
          seekTo: any;
        };
    };
  }
}


const ProfileTopSection = observer(({data} : any) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isPlaying, setIsPlaying] = useState(false);
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const timeUpdateIntervalRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Replace this with your actual YouTube video ID
  const youtubeVideoId = "IxF55qB4CuQ";

  // Initialize YouTube API
  useEffect(() => {
    // Add YouTube API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';

    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Define callback when YouTube API is ready
    window.onYouTubeIframeAPIReady = () => {
      setYoutubeReady(true);

      // Create YouTube player
      new window.YT.Player('youtube-background', {
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          loop: 1,
          playlist: youtubeVideoId,
          mute: 1 // Start muted
        },
        events: {
          onReady: (event: any) => {
            setYoutubePlayer(event.target);

            // Ensure player is not muted by default
            event.target.setVolume(volume);
            event.target.unMute();
            setIsMuted(false);

            // Set total video duration
            setDuration(event.target.getDuration());
          }
        }
      });
    };

    // Cleanup function
    return () => {
      window.onYouTubeIframeAPIReady = null as any;
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [youtubeVideoId]);

  // Create a separate effect to handle the time update interval
  useEffect(() => {
    if (youtubePlayer && isPlaying) {
      // Start interval to update currentTime automatically
      timeUpdateIntervalRef.current = window.setInterval(() => {
        setCurrentTime(youtubePlayer.getCurrentTime());
      }, 1000);
    } else if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [youtubePlayer, isPlaying]);

  // Auto-hide controls after 2 seconds
  const showControlsTemporarily = () => {
    setShowVideoControls(true);
    setShowAudioControls(true);

    // Clear any existing timeouts
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Set a new timeout to hide controls after 2 seconds
    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowVideoControls(false);
      setShowAudioControls(false);
    }, 2000);
  };

  const togglePlayPause = () => {
    if (youtubePlayer) {
      if (isPlaying) {
        youtubePlayer.pauseVideo();
      } else {
        // Ensure audio is properly initialized before playing
        if (isMuted) {
          youtubePlayer.unMute();
          setIsMuted(false);
        }

        // Make sure volume is set to audible level
        if (youtubePlayer.getVolume() === 0) {
          youtubePlayer.setVolume(50);
          setVolume(50);
        }

        youtubePlayer.playVideo();
      }
      setIsPlaying(!isPlaying);
      showControlsTemporarily(); // Show controls temporarily when play state changes
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (youtubePlayer) {
      youtubePlayer.setVolume(value);

      // If volume is set to 0, mute the player
      if (value === 0) {
        youtubePlayer.mute();
        setIsMuted(true);
      } else if (isMuted) {
        youtubePlayer.unMute();
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (youtubePlayer) {
      if (isMuted) {
        youtubePlayer.unMute();
        youtubePlayer.setVolume(volume === 0 ? 50 : volume);
        if (volume === 0) setVolume(50);
      } else {
        youtubePlayer.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  const handleSeekChange = (value: number) => {
    if (youtubePlayer) {
      youtubePlayer.seekTo(value, true);
      setCurrentTime(value);
    }
  };

  // Function to handle the profile image play button click
  // const handleProfilePlayClick = () => {
  //   togglePlayPause();

  //   // If the video is going to start playing, scroll to it to ensure visibility
  //   if (!isPlaying) {
  //     const videoElement = document.getElementById('youtube-background');
  //     if (videoElement) {
  //       videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //     }
  //   }
  // };

  return (
    <Box mb={4}>
      <Box maxW={'100%'} mx={'auto'} position="relative">
        {/* YouTube Background Video */}
        <Box
          position="relative"
          h={{ base: "250px", md: "300px", lg: '350px' }}
          w="100%"
          display={'none'}
          rounded="16px"
          overflow="hidden"
          mb={{ base: "70px", md: "4" }}
          onMouseEnter={showControlsTemporarily}
          onMouseMove={showControlsTemporarily}
        >
          {/* YouTube placeholder image before video loads */}
          {!youtubeReady && (
            <Image
              src="/images/profile/bgImg.png"
              alt="Best Psychotherapist In Noida"
              w="100%"
              h="100%"
              objectFit="cover"
              rounded="16px"
            />
          )}

          {/* YouTube iframe that will be replaced by API */}
          <Box
            id="youtube-background"
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="00%"
            rounded="16px"
            overflow="hidden"
          />

          {/* Video overlay - transparent regardless of play state */}
          <Box
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            bg="transparent"
            zIndex={1}
            cursor="pointer"
            onClick={() => {
              togglePlayPause();
              showControlsTemporarily();
            }}
          />

          {/* Video Progress Bar - Now with visibility control */}
          <Box
            position="absolute"
            bottom="14px"
            left="50%"
            transform="translateX(-50%)"
            width="40%"
            zIndex={2}
            px={{ base: 2, md: 4 }}
            py={2}
            bg="rgba(0,0,0,0.5)"
            borderRadius="md"
            opacity={showVideoControls ? 1 : 0}
            transition="opacity 0.3s"
            pointerEvents={showVideoControls ? "auto" : "none"}
          >
            <Slider
              aria-label="video-progress"
              value={currentTime}
              min={0}
              max={duration || 100}
              onChange={handleSeekChange}
              size="sm"
            >
              <SliderTrack bg="gray.300" h="2px">
                <SliderFilledTrack bg="blue.500" />
              </SliderTrack>
              <SliderThumb boxSize={3} bg="blue.500" />
            </Slider>
            {/* Video Time Indicator */}
            <Text textAlign="center" color="white" fontSize="xs" mt={1} textShadow="0px 0px 2px black">
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </Box>

          {/* Play/Pause Button (Centered on video) */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            p={1}
            bg="rgba(0,0,0,0.3)"
            rounded="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            onClick={togglePlayPause}
            zIndex={2}
            transition="opacity 0.3s"
            opacity={showVideoControls ? 1 : 0}
            _hover={{ opacity: 1 }}
          >
            <Icon
              as={isPlaying ? IoIosPause : IoIosPlay}
              color="white"
              fontSize="80px"
              bg="rgba(0,0,0,0.5)"
              p={4}
              borderRadius="full"
            />
          </Box>

          {/* Audio controls - with visibility control */}
          <Box
            position="absolute"
            top={{ base: "10px", md: "10px" }}
            right="10px"
            bg="rgba(0,0,0,0.6)"
            p={2}
            borderRadius="md"
            display="flex"
            alignItems="center"
            zIndex={3}
            opacity={showAudioControls ? 1 : 0}
            transition="opacity 0.3s"
            pointerEvents={showAudioControls ? "auto" : "none"}
          >
            <IconButton
              aria-label={isMuted ? "Unmute" : "Mute"}
              icon={<Icon as={isMuted ? IoIosVolumeMute : IoIosVolumeHigh} />}
              size="sm"
              mr={2}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the play/pause
                toggleMute();
              }}
              colorScheme="whiteAlpha"
            />
            <Box w={{ base: "80px", md: "100px" }}>
              <Slider
                aria-label="volume-slider"
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={100}
                step={1}
                onClick={(e) => e.stopPropagation()} // Prevent triggering the play/pause
              >
                <SliderTrack bg="gray.200">
                  <SliderFilledTrack bg="blue.500" />
                </SliderTrack>
                <SliderThumb boxSize={3} bg="blue.500" />
              </Slider>
            </Box>
          </Box>
        </Box>
        <BackgroundVideo backgroundVideo={data?.backgroundVideo} />

        {/* Profile image section - No changes needed here */}
        <Box
          position="relative"
          mt={{ base: "-100px", md: "-8rem" }}
          mb={2}
          display="flex"
          ml={{ lg: 12 }}
          justifyContent={{ base: "start", lg: "start" }}
          zIndex={4}
        >
          <Box position="relative">
            <Image
              alt={data?.pic?.name || "Best Psychotherapist In Noida"}
              objectFit="cover"
              w={{ base: "150px", md: "170px" }}
              bg="white"
              p={1}
              h={{ base: "200px", md: "220px" }}
              rounded="full"
              src={data?.pic?.url || undefined}
            />
            {/* <Box
              position="absolute"
              bottom="0px"
              right="0px"
              p={1}
              bg="white"
              rounded="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="lg"
              cursor="pointer"
              onClick={handleProfilePlayClick}
              zIndex={5}
            >
              <Icon
                bg="#DF837C"
                as={isPlaying ? IoIosPause : IoIosPlay}
                color="white"
                p={2}
                fontSize={{ base: "36px", md: "44px" }}
                rounded="full"
              />
            </Box> */}
          </Box>
        </Box>
      </Box>

      {/* Profile details section - Adjusted for mobile */}
      <Box mt={{ base: "30px", md: "6", lg: "-14" }}>
        <Heading textAlign={'center'} fontWeight={600} fontSize={{ base: "20px", lg: '24px' }}>{data?.name}</Heading>
        <Text color={'#8A8A8A'} fontWeight={500} my={2} textAlign={'center'} fontSize={'sm'}>
          {data?.professionalInfo} ({data?.qualifications})
        </Text>
        <Text fontWeight={500} textAlign={'center'} fontSize={'sm'}>
          License : <Text as={'span'} color={'#8A8A8A'}>{data?.licence || 'RCI CRR A-56007'}</Text>
        </Text>
        <Text fontSize={'16px'} my={2} textAlign={'center'} fontWeight={600}>
          Charges : {data?.charges} onwards
        </Text>
        <Text fontWeight={500} textAlign={'center'} fontSize={'sm'}>
          Speaks : <Text as={'span'} color={'#8A8A8A'}> {data?.languages?.join(" & ")}</Text>
        </Text>
      </Box>

      <Flex justify={'center'} w={'100%'}>
        <StatsGrid
          labelFontSize={{ base: "xs", lg: "sm" }}
          gap={{ base: "6", lg: "20" }}
          statColor={"brand.100"}
          statsData={data?.stats || []}
          fontSize={{ base: "1.4rem", md: "2.4rem", lg: "2.4rem" }}
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)", lg: "repeat(3, 1fr)" }}
        />
      </Flex>

      {/* Button to open modal */}
      <Center>
        <CustomButton mt={6} onClick={onOpen}>
          Schedule a Session
        </CustomButton>
        <ScheduleSession isOpen={isOpen} onClose={onClose} data={data}/>
      </Center>
    </Box>
  );
});


export default ProfileTopSection;