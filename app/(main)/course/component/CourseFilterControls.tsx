"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import {
  FiCheck,
  FiDollarSign,
  FiFilter,
  FiGlobe,
  FiGrid,
  FiSearch,
  FiStar,
  FiTag,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { CatalogSort, PricingFilter } from "../page";

// Hidden scrollbar style for sub-lists
const hiddenScrollbarCss = {
  scrollbarWidth: "none" as const,
  msOverflowStyle: "none" as const,
  "&::-webkit-scrollbar": { display: "none" },
};

interface CourseFilterControlsProps {
  showSearch: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  pricingFilter: PricingFilter;
  setPricingFilter: (filter: PricingFilter) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  languageFilter: string;
  setLanguageFilter: (language: string) => void;
  sortBy: CatalogSort;
  setSortBy: (sort: CatalogSort) => void;
  availableCategories: string[];
  availableLanguages: string[];
  softText: string;
  borderColor: string;
  searchInputStyles: any;
}

export const CourseFilterControls: React.FC<CourseFilterControlsProps> = ({
  showSearch,
  searchQuery,
  setSearchQuery,
  pricingFilter,
  setPricingFilter,
  categoryFilter,
  setCategoryFilter,
  languageFilter,
  setLanguageFilter,
  sortBy,
  setSortBy,
  availableCategories,
  availableLanguages,
  softText,
  borderColor,
  searchInputStyles,
}) => {
  const sortOptions = [
    {
      value: "popularity" as CatalogSort,
      label: "Community picks",
      description: "Most popular courses",
      icon: FiTrendingUp,
    },
    {
      value: "highest_rated" as CatalogSort,
      label: "Top rated",
      description: "Highest learner ratings",
      icon: FiStar,
    },
    {
      value: "price_asc" as CatalogSort,
      label: "Lowest price",
      description: "Affordable options first",
      icon: FiDollarSign,
    },
    {
      value: "price_desc" as CatalogSort,
      label: "Highest price",
      description: "Premium options first",
      icon: FiDollarSign,
    },
  ];

  return (
    <VStack align="stretch" spacing={6}>
      {showSearch ? (
        <Box>
          <HStack justify="space-between" mb={3.5} align="center">
            <HStack spacing={2}>
              <Icon as={FiFilter} color="brand.500" boxSize={3.5} />
              <Text fontSize="xs" fontWeight="800" color={useColorModeValue("gray.800", "white")} textTransform="uppercase" letterSpacing="0.08em">
                Find a course
              </Text>
            </HStack>
            {(pricingFilter !== "all" || categoryFilter !== "all" || languageFilter !== "all" || searchQuery !== "" || sortBy !== "popularity") && (
              <Button
                variant="ghost"
                size="xs"
                colorScheme="brand"
                h="auto"
                py={1}
                px={2.5}
                borderRadius="full"
                fontSize="10px"
                fontWeight="800"
                onClick={() => {
                  setPricingFilter("all");
                  setCategoryFilter("all");
                  setLanguageFilter("all");
                  setSearchQuery("");
                  setSortBy("popularity");
                }}
              >
                Reset All
              </Button>
            )}
          </HStack>
          <InputGroup>
            <InputLeftElement h="42px" pointerEvents="none">
              <Icon as={FiSearch} color={softText} />
            </InputLeftElement>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search courses..."
              pl={10}
              {...searchInputStyles}
            />
          </InputGroup>
        </Box>
      ) : null}

      <Box>
        <HStack mb={3} spacing={2.5}>
          <Box
            w="30px"
            h="30px"
            display="grid"
            placeItems="center"
            borderRadius="lg"
            bg={useColorModeValue("brand.50", "whiteAlpha.100")}
            color="brand.600"
          >
            <Icon as={FiDollarSign} fontSize="sm" />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="800" color={useColorModeValue("gray.850", "white")} lineHeight="1.1">
              Pricing
            </Text>
            <Text fontSize="10px" color={softText} fontWeight="500">
              Choose what suits you
            </Text>
          </Box>
        </HStack>

        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
          {[
            { value: "all" as PricingFilter, label: "All" },
            { value: "free" as PricingFilter, label: "Free" },
            { value: "paid" as PricingFilter, label: "Paid" },
          ].map((option) => {
            const isActive = pricingFilter === option.value;

            return (
              <Button
                key={option.value}
                h="36px"
                px={2}
                size="sm"
                borderRadius="xl"
                variant={isActive ? "solid" : "outline"}
                bg={isActive ? "brand.500" : "transparent"}
                color={isActive ? "white" : useColorModeValue("gray.600", "gray.350")}
                borderColor={isActive ? "brand.500" : useColorModeValue("gray.200", "whiteAlpha.200")}
                boxShadow={isActive ? "0 4px 14px rgba(98,105,255,0.25)" : "none"}
                fontSize="xs"
                fontWeight="700"
                onClick={() => setPricingFilter(option.value)}
                transition="all 0.2s ease"
                _hover={{
                  bg: isActive ? "brand.600" : useColorModeValue("gray.50", "whiteAlpha.50"),
                  borderColor: isActive ? "brand.600" : useColorModeValue("gray.300", "whiteAlpha.300"),
                  transform: "translateY(-1px)"
                }}
                _active={{ transform: "translateY(0)" }}
              >
                {option.label}
              </Button>
            );
          })}
        </Grid>
      </Box>

      <Box>
        <HStack mb={3} spacing={2.5}>
          <Box
            w="30px"
            h="30px"
            display="grid"
            placeItems="center"
            borderRadius="lg"
            bg={useColorModeValue("brand.50", "whiteAlpha.100")}
            color="brand.600"
          >
            <Icon as={FiGrid} fontSize="sm" />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="800" color={useColorModeValue("gray.850", "white")} lineHeight="1.1">
              Categories
            </Text>
            <Text fontSize="10px" color={softText} fontWeight="500">
              Pick an area to explore
            </Text>
          </Box>
        </HStack>

        <Flex
          gap={2}
          flexWrap="wrap"
          maxH="160px"
          overflowY="auto"
          pr={1}
          css={hiddenScrollbarCss}
        >
          {availableCategories.map((category) => {
            const isActive = categoryFilter === category;

            return (
              <Button
                key={category}
                size="xs"
                h="30px"
                px={3.5}
                maxW="100%"
                borderRadius="full"
                variant={isActive ? "solid" : "outline"}
                bg={isActive ? "brand.500" : "transparent"}
                color={isActive ? "white" : useColorModeValue("gray.600", "gray.350")}
                borderColor={isActive ? "brand.500" : useColorModeValue("gray.200", "whiteAlpha.200")}
                boxShadow={isActive ? "0 4px 12px rgba(98,105,255,0.2)" : "none"}
                fontWeight="700"
                leftIcon={category === "all" ? <FiGrid size={12} /> : <FiTag size={12} />}
                onClick={() => setCategoryFilter(category)}
                transition="all 0.2s ease"
                _hover={{
                  bg: isActive ? "brand.600" : useColorModeValue("gray.50", "whiteAlpha.50"),
                  borderColor: isActive ? "brand.600" : useColorModeValue("gray.300", "whiteAlpha.300"),
                  transform: "translateY(-1px)"
                }}
                _active={{ transform: "translateY(0)" }}
              >
                <Text as="span" noOfLines={1}>
                  {category === "all" ? "All topics" : category}
                </Text>
              </Button>
            );
          })}
        </Flex>
      </Box>

      <Box>
        <HStack mb={3} spacing={2.5}>
          <Box
            w="30px"
            h="30px"
            display="grid"
            placeItems="center"
            borderRadius="lg"
            bg={useColorModeValue("brand.50", "whiteAlpha.100")}
            color="brand.600"
          >
            <Icon as={FiGlobe} fontSize="sm" />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="800" color={useColorModeValue("gray.850", "white")} lineHeight="1.1">
              Language
            </Text>
            <Text fontSize="10px" color={softText} fontWeight="500">
              Learn in your preferred language
            </Text>
          </Box>
        </HStack>

        <Flex
          gap={2}
          flexWrap="wrap"
          maxH="120px"
          overflowY="auto"
          pr={1}
          css={hiddenScrollbarCss}
        >
          {availableLanguages.map((language) => {
            const isActive = languageFilter === language;

            return (
              <Button
                key={language}
                size="xs"
                h="30px"
                px={3.5}
                maxW="100%"
                borderRadius="full"
                variant={isActive ? "solid" : "outline"}
                bg={isActive ? "brand.500" : "transparent"}
                color={isActive ? "white" : useColorModeValue("gray.600", "gray.355")}
                borderColor={isActive ? "brand.500" : useColorModeValue("gray.200", "whiteAlpha.200")}
                boxShadow={isActive ? "0 4px 12px rgba(98,105,255,0.2)" : "none"}
                fontWeight="700"
                onClick={() => setLanguageFilter(language)}
                transition="all 0.2s ease"
                _hover={{
                  bg: isActive ? "brand.600" : useColorModeValue("gray.50", "whiteAlpha.50"),
                  borderColor: isActive ? "brand.600" : useColorModeValue("gray.300", "whiteAlpha.300"),
                  transform: "translateY(-1px)"
                }}
                _active={{ transform: "translateY(0)" }}
              >
                <Text as="span" noOfLines={1}>
                  {language === "all" ? "Every language" : language}
                </Text>
              </Button>
            );
          })}
        </Flex>
      </Box>

      <Box>
        <HStack mb={3} spacing={2.5}>
          <Box
            w="30px"
            h="30px"
            display="grid"
            placeItems="center"
            borderRadius="lg"
            bg={useColorModeValue("brand.50", "whiteAlpha.100")}
            color="brand.600"
          >
            <Icon as={FiZap} fontSize="sm" />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="800" color={useColorModeValue("gray.850", "white")} lineHeight="1.1">
              Arrange courses
            </Text>
            <Text fontSize="10px" color={softText} fontWeight="500">
              Set the order that feels right
            </Text>
          </Box>
        </HStack>

        <VStack align="stretch" spacing={2.5}>
          {sortOptions.map((option) => {
            const isActive = sortBy === option.value;

            return (
              <Button
                key={option.value}
                h="auto"
                minH="52px"
                py={2.5}
                px={3}
                justifyContent="flex-start"
                textAlign="left"
                borderRadius="xl"
                variant={isActive ? "solid" : "outline"}
                bg={isActive ? "brand.500" : "transparent"}
                color={isActive ? "white" : useColorModeValue("gray.700", "gray.300")}
                borderColor={isActive ? "brand.500" : useColorModeValue("gray.200", "whiteAlpha.200")}
                boxShadow={isActive ? "0 4px 12px rgba(98,105,255,0.2)" : "none"}
                onClick={() => setSortBy(option.value)}
                transition="all 0.2s ease"
                _hover={{
                  bg: isActive ? "brand.600" : useColorModeValue("gray.50", "whiteAlpha.50"),
                  borderColor: isActive ? "brand.600" : useColorModeValue("gray.300", "whiteAlpha.300"),
                  transform: "translateX(2px)",
                }}
                _active={{ transform: "translateX(0)" }}
              >
                <Box
                  w="31px"
                  h="31px"
                  flexShrink={0}
                  display="grid"
                  placeItems="center"
                  borderRadius="lg"
                  bg={isActive ? "brand.600" : useColorModeValue("brand.50", "whiteAlpha.100")}
                  color={isActive ? "white" : "brand.600"}
                >
                  <Icon as={option.icon} fontSize="sm" />
                </Box>

                <Box ml={2.5} minW={0} flex="1">
                  <Text fontSize="xs" fontWeight="800" lineHeight="1.15">
                    {option.label}
                  </Text>
                  <Text mt={0.5} fontSize="10px" color={isActive ? "whiteAlpha.800" : softText} fontWeight="700">
                    {option.description}
                  </Text>
                </Box>

                <Box
                  w="20px"
                  h="20px"
                  ml={2}
                  flexShrink={0}
                  display="grid"
                  placeItems="center"
                  borderRadius="full"
                  bg={isActive ? "white" : "transparent"}
                  color="brand.500"
                  borderWidth="1px"
                  borderColor={isActive ? "white" : borderColor}
                >
                  {isActive ? <Icon as={FiCheck} fontSize="11px" /> : null}
                </Box>
              </Button>
            );
          })}
        </VStack>
      </Box>
    </VStack>
  );
};
