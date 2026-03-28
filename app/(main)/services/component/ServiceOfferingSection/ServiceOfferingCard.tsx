'use client';

import Link from 'next/link';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Image, Tag, Text, useBreakpointValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ServiceOffering {
  id: number;
  imageUrl: string;
  tag: string;
  title: string;
  description: string;
  buttonText?: string;
  bg: string;
  coverImage: string;
  route?: string;
}

interface ServiceOfferingCardProps {
  service: ServiceOffering;
}

const MotionBox = motion(Box);
const MotionImage = motion(Image);

const ServiceOfferingCard = ({ service }: ServiceOfferingCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setIsClicked(!isClicked);
    }
  };

  const CardContent = (
    <MotionBox
      shadow="xl"
      rounded="2xl"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      h="350px"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={handleToggle}
      initial={{ scale: 1 }}
      whileHover={{ scale: isMobile ? 1 : 1.02 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      cursor="pointer"
    >
      {/* Image Section */}
      <Box position="relative" h="180px" overflow="hidden">
        <MotionImage
          src={service.coverImage}
          h="100%"
          w="100%"
          objectFit="cover"
          objectPosition="center 20%"
          position="absolute"
          top="0"
          left="0"
          opacity={isHovered || isClicked ? 1 : 0}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          zIndex={1}
        />
        <MotionBox
          p={5}
          bg={service.bg}
          rounded="2xl"
          h="100%"
          initial={{ opacity: 1 }}
          animate={{ opacity: isHovered || isClicked ? 0 : 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <Flex justify="space-between">
            <Image alt="service icon" boxSize="40px" src={service.imageUrl} />
            {service.tag && (
              <Tag mt={1} fontSize="xs" fontWeight={600} h="fit-content" py={1} px={2} rounded="full" bg="white">
                {service.tag}
              </Tag>
            )}
          </Flex>
          <Text fontSize="20px" mt={10} fontWeight={600}>
            {service.title}
          </Text>
        </MotionBox>
      </Box>

      {/* Description & Button */}
      <Flex flex="1" direction="column" p={5} color="#4D4D4D" fontSize="sm">
        <Text noOfLines={3} overflow="hidden" textOverflow="ellipsis">
          {service.description}
        </Text>

        {service.buttonText && (
          <Box mt="auto">
            <Button
              fontWeight={600}
              variant="link"
              color="brand.100"
              rightIcon={<ChevronRightIcon />}
            >
              {service.buttonText}
            </Button>
          </Box>
        )}
      </Flex>
    </MotionBox>
  );

  if (!isMounted) {
    return (
      <Box
        shadow="xl"
        rounded="2xl"
        h="350px"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      />
    );
  }

  return service.route ? (
    <Link href={service.route} passHref legacyBehavior>
      <a style={{ textDecoration: 'none' }} target="_self">
        {CardContent}
      </a>
    </Link>
  ) : (
    CardContent
  );
};

export default ServiceOfferingCard;
