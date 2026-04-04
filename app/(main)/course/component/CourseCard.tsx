'use client';

import {
  Box,
  Badge,
  Heading,
  Text,
  Image,
  HStack,
  VStack,
  Icon,
  AspectRatio,
  useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaClock, FaStar } from 'react-icons/fa';

const MotionBox = motion(Box);

interface CourseCardProps {
  course: any;
  onClick: () => void;
}

export const CourseCard = ({ course, onClick }: CourseCardProps) => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <MotionBox
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      cursor="pointer"
      borderRadius="3xl"
      overflow="hidden"
      position="relative"
      bg={cardBg}
      boxShadow="0 10px 30px rgba(0,0,0,0.08)"
      _hover={{
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }}
    >
      {/* IMAGE */}
      <AspectRatio ratio={16 / 9}>
        <Image
          src={course.image}
          alt={course.title}
          objectFit="cover"
        />
      </AspectRatio>

      {/* GRADIENT OVERLAY */}
      <Box
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        bg="linear-gradient(to top, rgba(0,0,0,0.6), transparent)"
      />

      {/* CONTENT */}
      <VStack
        align="start"
        spacing={3}
        position="absolute"
        bottom="0"
        p={5}
        color="white"
        w="full"
      >
        <HStack justify="space-between" w="full">
          <Badge
            bg="whiteAlpha.300"
            color="white"
            px={3}
            borderRadius="full"
            backdropFilter="blur(6px)"
          >
            {course.level}
          </Badge>

          <HStack spacing={1}>
            <Icon as={FaStar} color="yellow.300" />
            <Text fontSize="sm" fontWeight="bold">
              {course.rating}
            </Text>
          </HStack>
        </HStack>

        <Heading size="sm" noOfLines={2}>
          {course.title}
        </Heading>

        <HStack justify="space-between" w="full">
          <Text fontSize="lg" fontWeight="bold" color="green.300">
            ₹{course.price.toLocaleString()}
          </Text>

          <HStack fontSize="xs">
            <Icon as={FaClock} />
            <Text>{course.duration}</Text>
          </HStack>
        </HStack>
      </VStack>
    </MotionBox>
  );
};