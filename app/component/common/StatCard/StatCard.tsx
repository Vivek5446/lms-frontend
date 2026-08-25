"use client";

import {
  Box,
  Flex,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
  usePrefersReducedMotion,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { IconType } from "react-icons";

export type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon: IconType | React.ElementType;
  colorScheme?: string;
  href?: string;
  animationDelay?: number;
};

const MotionBox = motion(Box);

export default function StatCard({
  label,
  value,
  helper,
  icon,
  colorScheme = "blue",
  href,
  animationDelay = 0,
}: StatCardProps) {
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.900", "white");
  const helperColor = useColorModeValue("gray.500", "gray.400");

  const iconBg = useColorModeValue(
    `${colorScheme}.50`,
    `${colorScheme}.900`
  );

  const iconColor = useColorModeValue(
    `${colorScheme}.600`,
    `${colorScheme}.200`
  );

  const accentColor = useColorModeValue(
    `${colorScheme}.400`,
    `${colorScheme}.300`
  );

  const helperBg = useColorModeValue("gray.50", "whiteAlpha.50");

  return (
    <MotionBox
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: prefersReducedMotion ? 0 : animationDelay }}
      position="relative"
      overflow="hidden"
      minW={0}
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius={{ base: "xl", md: "2xl" }}
      px={{ base: 4, md: 5 }}
      py={{ base: 4, md: 4 }}
      boxShadow={useColorModeValue(
        "0 2px 10px rgba(15, 23, 42, 0.05)",
        "0 2px 10px rgba(0, 0, 0, 0.18)"
      )}
      cursor={href ? "pointer" : "default"}
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
      aria-label={href ? `${label}: ${value}. Open details` : undefined}
      onClick={href ? () => router.push(href) : undefined}
      onKeyDown={href ? (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(href);
        }
      } : undefined}
      _hover={{
        transform: "translateY(-2px)",
        borderColor: useColorModeValue(
          `${colorScheme}.200`,
          `${colorScheme}.700`
        ),
        boxShadow: useColorModeValue(
          "0 6px 18px rgba(15, 23, 42, 0.07)",
          "0 6px 18px rgba(0, 0, 0, 0.22)"
        ),
      }}
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        w: "3px",
        h: "100%",
        bg: accentColor,
        borderRadius: "full",
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-40px",
        right: "-40px",
        w: "100px",
        h: "100px",
        borderRadius: "full",
        bg: iconBg,
        opacity: useColorModeValue(0.6, 0.16),
        pointerEvents: "none",
      }}
    >
      <Flex
        position="relative"
        zIndex={1}
        align="flex-start"
        justify="space-between"
        gap={4}
      >
        <Stat minW={0}>
          <StatLabel
            color={labelColor}
            fontSize={{ base: "11px", md: "xs" }}
            fontWeight="700"
            letterSpacing="0.04em"
            textTransform="uppercase"
            noOfLines={1}
          >
            {label}
          </StatLabel>

          <StatNumber
            mt={2}
            color={valueColor}
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="800"
            letterSpacing="-0.04em"
            lineHeight="1"
          >
            {typeof value === "number"
              ? value.toLocaleString()
              : value}
          </StatNumber>

          {helper && (
            <Flex
              mt={3}
              display="inline-flex"
              align="center"
              maxW="100%"
              px={2.5}
              py={1}
              bg={helperBg}
              borderRadius="full"
            >
              <Box
                w="5px"
                h="5px"
                mr={2}
                flexShrink={0}
                borderRadius="full"
                bg={accentColor}
              />

              <Text
                color={helperColor}
                fontSize="11px"
                fontWeight="500"
                noOfLines={1}
              >
                {helper}
              </Text>
            </Flex>
          )}
        </Stat>

        <Flex
          align="center"
          justify="center"
          w={{ base: "40px", md: "44px" }}
          h={{ base: "40px", md: "44px" }}
          flexShrink={0}
          borderRadius="xl"
          bg={iconBg}
          color={iconColor}
          borderWidth="1px"
          borderColor={useColorModeValue(
            `${colorScheme}.100`,
            `${colorScheme}.700`
          )}
          transition="transform 0.2s ease"
          _groupHover={{
            transform: "scale(1.04)",
          }}
        >
          <Icon
            as={icon}
            boxSize={{ base: 4, md: 5 }}
          />
        </Flex>
      </Flex>
    </MotionBox>
  );
}
