import { Box, Flex, Image, Text, useBreakpointValue, IconButton, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { rotateCardData } from "./data";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { MdArrowOutward } from "react-icons/md";

interface CardProps {
  card: {
    id: number;
    name: string;
    title: string;
    experience: string;
    image: string;
    opacity: number;
    width: string;
    height: string;
    link: string;
    charges?: string;
  };
  index: number;
  isActive: boolean;
  onClick?: () => void;
  onTouchEnd?: any;
  isMobile?: boolean;
}

const CommonCard = ({ card, index, isActive, onClick, onTouchEnd, isMobile }: CardProps) => {
  const cardWidth = useBreakpointValue({
    base: isActive ? "11rem" : "9rem",
    md: isActive ? "19rem" : "16rem",
  });
  const cardHeight = useBreakpointValue({
    base: isActive ? "13rem" : "10rem",
    md: isActive ? "21rem" : "18rem",
  });
  const fontSize = useBreakpointValue({
    base: isActive ? "10px" : "8px",
    md: isActive ? "18px" : "16px",
  });
  const subFontSize = useBreakpointValue({
    base: isActive ? "8px" : "6px",
    md: isActive ? "13px" : "10px",
  });

  // Helper function to handle navigation
  const handleNavigation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    window.open(card.link, "_blank");
  };

  const GetPosition = (idx: number) => {
    const desktopPosition = [
      { x: -320, y: 120 }, // Card 1
      { x: 0, y: 0 }, // Active Card
      { x: 0, y: 300 }, // Card 3
    ];

    const mobilePosition = [
      { x: -130, y: 100 }, // Card 1
      { x: 50, y: 40 }, // Active Card
      { x: 50, y: 210 }, // Card 3
    ];

    return (
      useBreakpointValue({ base: mobilePosition, md: desktopPosition })?.[idx] ||
      { x: 0, y: 0 }
    );
  };

  if (isMobile) {
    return (
      <Box
        onClick={onClick}
        onTouchEnd={onTouchEnd}
        width="100%"
        maxWidth="240px"
        mx="auto"
        opacity={1}
        cursor="pointer"
        role="button"
        aria-label={`View profile of ${card.name}`}
        style={{ touchAction: "manipulation" }}
      >
        <Box position="relative">
          <Image
            src={card.image}
            width="100%"
            height="300px"
            objectFit="cover"
            borderRadius="16px"
            border={isActive ? "2px solid #DF837C" : "none"}
            alt="Psychologist In Noida"
          />

          {/* View Profile tag for mobile */}
          <Button
            as="a"
            variant="ghost"
            rightIcon={<MdArrowOutward />}
            colorScheme="teal"
            size={{ base: "xs", md: "xs" }}
            px={{ base: 0, md: 1 }}
            position="absolute"
            top="6px"
            right="5px"
            bg="white"
            zIndex={2}
            onClick={handleNavigation}
            onTouchEnd={handleNavigation}
            cursor="pointer"
            style={{ touchAction: "manipulation" }}
          >
            View
          </Button>

          <Flex
            justify="center"
            position="absolute"
            bottom="0.5rem"
            width="100%"
          >
            <Box
              w="95%"
              bg="blackAlpha.600"
              color="white"
              py={2}
              px={2}
              rounded="10px"
              boxShadow="md"
              mb="-4px"
            >
              <Text fontSize="14px" fontWeight={700}>
                {card.name}
              </Text>
              <Text fontSize="11px" mt="0">
                {card.title}
              </Text>
              <Text mt={0.5} fontSize="12px">{card.experience}</Text>
              {/* <Text fontSize="9px">Charges @ Rs. {card.charges}</Text> */}
            </Box>
          </Flex>
        </Box>
      </Box>
    );
  }

  return (
    <motion.div
      layout
      layoutId={`card-${card.id}`}
      initial={GetPosition(index)}
      animate={GetPosition(index)}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
      }}
      onClick={onClick}
      onTouchEnd={onTouchEnd}
      style={{
        position: "absolute",
        cursor: "pointer",
        width: cardWidth,
        opacity: isActive ? 1 : 0.5,
        touchAction: "manipulation",
      }}
      role="button"
      aria-label={`View profile of ${card.name}`}
    >
      <Box position="relative">
        <motion.img
          src={card.image}
          style={{
            width: "100%",
            height: cardHeight,
            objectFit: "cover",
            borderRadius: "16px",
            border: isActive ? "2px solid #DF837C" : "none",
          }}
          alt="Psychologist In Noida"
        />

        {/* View Profile tag for desktop */}
        {isActive && (
          <Button
            as="a"
            variant="ghost"
            rightIcon={<MdArrowOutward />}
            colorScheme="teal"
            size={{ base: "xs", md: "xs" }}
            px={{ base: 2, md: 1 }}
            position="absolute"
            top="4px"
            right="6px"
            bg="white"
            zIndex={2}
            onClick={handleNavigation}
            onTouchEnd={handleNavigation}
            cursor="pointer"
            style={{ touchAction: "manipulation" }}
          >
            View
          </Button>
        )}

        <Flex
          justify="center"
          position="absolute"
          bottom={isActive ? "0.5rem" : "1rem"}
          width="100%"
        >
          <Box
            w={{ base: "95%", lg: "90%" }}
            bg="blackAlpha.600"
            color="white"
            py={isActive ? 2 : 1}
            px={{ base: 2, lg: isActive ? 3 : 2 }}
            rounded="10px"
            boxShadow="md"
            mb={isActive ? "-4px" : "-10px"}
          >
            <Text fontSize={fontSize} fontWeight={700}>
              {card.name}
            </Text>
            <Text fontSize={subFontSize} mt={{ lg: 1 }}>
              {card.title}
            </Text>
            <Text mt={{ base: 0.5, lg: 1 }} fontSize={subFontSize}>{card.experience}</Text>
            {/* <Text fontSize={subFontSize}>Charges @ Rs. {card.charges}</Text> */}
          </Box>
        </Flex>
      </Box>
    </motion.div>
  );
};

const RotatingCard = () => {
  const [cards, setCards] = useState(rotateCardData);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoSwipeInterval = useRef<NodeJS.Timeout | null>(null);
  const isIOS = useRef(false);
  const isSwiping = useRef(false);

  // Get the card height to adjust container heights dynamically
  const cardHeight = useBreakpointValue({
    base: "19rem",
    md: "21rem",
  });

  // Calculate container height based on card height
  const containerHeight = useBreakpointValue({
    base: "400px", // Adjusted for mobile to accommodate taller cards
    md: "600px",
  });

  // Detect iOS device
  useEffect(() => {
    isIOS.current = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  }, []);

  const startAutoRotation = useCallback(() => {
    if (isMobile) {
      // Auto swipe for mobile carousel
      autoSwipeInterval.current = setInterval(() => {
        setActiveIndex((prevIndex) =>
          prevIndex === cards.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000);
    } else {
      // Existing desktop rotation
      const interval = setInterval(() => {
        setCards((prev) => {
          const newCards = [...prev];
          newCards.unshift(newCards.pop()!); // Move the last card to the front
          return newCards;
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isMobile, cards.length]);

  // Setup auto rotation and cleanup
  useEffect(() => {
    startAutoRotation();

    return () => {
      if (autoSwipeInterval.current) {
        clearInterval(autoSwipeInterval.current);
      }
    };
  }, [startAutoRotation]);

  // Fixed handleCardClick function to work reliably on iOS
  const handleCardClick = useCallback((clickedId: number) => {
    // Don't navigate if we're in the middle of a swipe
    if (isSwiping.current) return;

    const clickedCard = cards.find((card) => card.id === clickedId);
    if (clickedCard) {
      // Add small delay for iOS to ensure it's not part of a swipe
      if (isIOS.current) {
        setTimeout(() => {
          window.open(clickedCard.link, "_blank");
        }, 10);
      } else {
        window.open(clickedCard.link, "_blank");
      }
    }
  }, [cards]);

  // Touch event handlers for swipe functionality
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = false;

    // Pause auto rotation when user interacts
    if (autoSwipeInterval.current) {
      clearInterval(autoSwipeInterval.current);
      autoSwipeInterval.current = null;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;

    // If movement is significant, mark as swiping
    if (Math.abs(touchEndX.current - touchStartX.current) > 10) {
      isSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Minimum distance required for swipe detection
    const minSwipeDistance = 50;
    const swipeDistance = touchEndX.current - touchStartX.current;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      // We've detected a significant swipe
      isSwiping.current = true;

      if (swipeDistance > 0) {
        // Swipe right - go to previous
        prevSlide();
      } else {
        // Swipe left - go to next
        nextSlide();
      }
    }

    // Resume auto rotation after user interaction
    if (!autoSwipeInterval.current) {
      startAutoRotation();
    }

    // Reset swiping state after a delay to allow click events
    setTimeout(() => {
      isSwiping.current = false;
    }, 50);
  }, [startAutoRotation]);

  const nextSlide = useCallback(() => {
    setActiveIndex((prevIndex) =>
      prevIndex === cards.length - 1 ? 0 : prevIndex + 1
    );
  }, [cards.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? cards.length - 1 : prevIndex - 1
    );
  }, [cards.length]);

  const handleCardTouch = useCallback((e: React.TouchEvent, cardId: number) => {
    e.stopPropagation();
    // Only navigate if not swiping
    if (!isSwiping.current) {
      handleCardClick(cardId);
    }
  }, [handleCardClick]);

  const boxSize = useBreakpointValue({ base: "100%", md: "0" });

  // Mobile carousel view
  if (isMobile) {
    return (
      <Box position="relative" h={containerHeight} w="100%" px={4}>
        <Flex
          position="absolute"
          top="20px"
          left="0"
          align="end"
          gap={2}
          display="flex"
          zIndex={1}
        >
          <Image src="/images/greenStar.svg" alt="Top Clinical Psychologist Doctors in Noida" boxSize="24px" />
          <Box
            width="4rem"
            height="30px"
            bg="#EAF475"
            borderTopLeftRadius="30px"
          />
        </Flex>

        <Box
          position="relative"
          mt={7}
          mx="auto"
          maxW="240px"
          height={cardHeight}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          {cards.map((card, index) => (
            <Box
              key={card.id}
              display={index === activeIndex ? "block" : "none"}
              style={{ touchAction: "manipulation" }}
            >
              <CommonCard
                card={card}
                index={index}
                isActive={true}
                onClick={() => handleCardClick(card.id)}
                onTouchEnd={(e) => handleCardTouch(e, card.id)}
                isMobile={true}
              />
            </Box>
          ))}

          <Flex justify="space-between" position="absolute" top="50%" width="100%" transform="translateY(-50%)" px={2}>
            <IconButton
              aria-label="Previous"
              icon={<ChevronLeftIcon boxSize={8} />}
              onClick={prevSlide}
              bg="transparent"
              _hover={{ bg: "transparent" }}
              _focus={{ boxShadow: "none" }}
              color="blackAlpha.700"
              position="absolute"
              left="-50px"
              top="50%"
              transform="translateY(-50%)"
              zIndex="10"
              style={{ touchAction: "manipulation" }}
            />

            <IconButton
              aria-label="Next"
              icon={<ChevronRightIcon boxSize={8} />}
              onClick={nextSlide}
              bg="transparent"
              _hover={{ bg: "transparent" }}
              _focus={{ boxShadow: "none" }}
              color="blackAlpha.700"
              position="absolute"
              right="-50px"
              top="50%"
              transform="translateY(-50%)"
              zIndex="10"
              style={{ touchAction: "manipulation" }}
            />
          </Flex>
        </Box>

        <Flex
          position="absolute"
          bottom={10}
          left="0"
          gap={2}
          align="start"
          display="flex"
          zIndex={1}
        >
          <Image src="/images/blueStar.svg" alt="Best Psychiatrists In Noida" boxSize="24px" />
          <Box
            width="6rem"
            height="40px"
            borderTopRightRadius="16px"
            borderBottomLeftRadius="20px"
            bg="#B9DDFF"
          />
        </Flex>

        <Flex justify="center" mt={4} position="relative" bottom="-35px">
          {cards.map((_, index) => (
            <Box
              key={index}
              h="8px"
              w="8px"
              borderRadius="50%"
              bg={index === activeIndex ? "#DF837C" : "gray.300"}
              mx={1}
              cursor="pointer"
              onClick={() => {
                setActiveIndex(index);
                // Reset auto rotation timer
                if (autoSwipeInterval.current) {
                  clearInterval(autoSwipeInterval.current);
                }
                startAutoRotation();
              }}
              style={{ touchAction: "manipulation" }}
            />
          ))}
        </Flex>
      </Box>
    );
  }

  // Desktop view
  return (
    <Box
      position="relative"
      h="600px"
      w={boxSize}
      overflow="visible"
      mx="auto"
    >
      <Flex
        position="absolute"
        top="60px"
        left={{ lg: "-170px" }}
        align="end"
        gap={{ lg: 4 }}
        display={{ md: "flex" }}
      >
        <Image src="/images/greenStar.svg" alt="Top Clinical Psychologist Doctors in Noida" boxSize={{ lg: "36px" }} />
        <Box
          width={{ lg: "6rem" }}
          height={{ lg: "50px" }}
          bg="#EAF475"
          borderTopLeftRadius={{ lg: "40px" }}
          zIndex={1}
        />
      </Flex>
      <Flex
        position="absolute"
        bottom={10}
        left={{ lg: "-240px" }}
        gap={2}
        align="start"
        display={{ md: "flex" }}
      >
        <Image src="/images/blueStar.svg" alt="Best Psychiatrists In Noida" boxSize={{ lg: "36px" }} />
        <Box
          width={{ lg: "11.5rem" }}
          height={{ lg: "90px" }}
          borderTopRightRadius={{ lg: "30px" }}
          borderBottomLeftRadius={{ lg: "30px" }}
          bg="#B9DDFF"
          zIndex={1}
        />
      </Flex>

      {cards.map((card, index) => (
        <CommonCard
          key={card.id}
          card={card}
          index={index}
          isActive={index === 0}
          onClick={() => handleCardClick(card.id)}
          onTouchEnd={(e) => handleCardTouch(e, card.id)}
        />
      ))}
    </Box>
  );
};

export default RotatingCard;