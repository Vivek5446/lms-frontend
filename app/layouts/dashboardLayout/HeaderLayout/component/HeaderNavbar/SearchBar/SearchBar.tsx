"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  InputGroup,
  Input,
  InputLeftElement,
  List,
  ListItem,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import debounce from "lodash.debounce";
import Link from "next/link";
import { sidebarDatas } from "../../../../SidebarLayout/utils/SidebarItems";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSearchDebounced = debounce((query: string) => handleSearch(query), 100);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query) {
      setResults([]);
      return;
    }

    const filtered = sidebarDatas.filter((item: any) =>
      item?.name?.toLowerCase()?.includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  // Function to highlight the searched term
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));

    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <Text as="span" key={index} color="yellow.500" fontWeight="bold">
          {part}
        </Text>
      ) : (
        <Text as="span" key={index}>
          {part}
        </Text>
      )
    );
  };


  return (
    <Box position="relative" width="300px" ref={dropdownRef}>
      <InputGroup>
        <InputLeftElement>
          <FaSearch color={useColorModeValue("brand.500", "brand.200")} />
        </InputLeftElement>
        <Input
          placeholder="Start typing to search..."
          bg={useColorModeValue("white", "darkBrand.50")}
          border="1px solid"
          borderColor={useColorModeValue("brand.200", "darkBrand.200")}
          _focus={{ borderColor: "brand.500", boxShadow: "0 0 4px brand.500" }}
          _hover={{ borderColor: "brand.300" }}
          borderRadius="full"
          px={4}
          py={2}
          value={searchQuery}
          onChange={(e) => handleSearchDebounced(e.target.value)}
        />
      </InputGroup>

      {results.length > 0 && (
        <List
          bg={useColorModeValue("white", "darkBrand.100")}
          mt={2}
          borderRadius="lg"
          boxShadow="xl"
          position="absolute"
          width="100%"
          zIndex={100}
          border="1px solid"
          borderColor={useColorModeValue("brand.200", "darkBrand.200")}
          maxHeight="300px"
          overflowY="auto"
          overflowX="hidden"
        >
          {results.map((result: any, index: number) => (
            <ListItem
              key={result.url}
              px={4}
              py={3}
              _hover={{
                bg: useColorModeValue("brand.50", "darkBrand.200"),
                cursor: "pointer",
                transform: "scale(1.01)",
                transition: "transform 0.2s ease-in-out",
              }}
              borderBottom={index < results.length - 1 ? "1px solid" : "none"}
              borderColor={useColorModeValue("brand.100", "darkBrand.200")}
            >
              <Link
                href={result.url}
                onClick={() => {
                  setSearchQuery("");
                  setResults([]);
                }}
              >
                <Flex align="center" gap={4}>
                  <Box fontSize="24px" color="brand.500">
                    {result.icon}
                  </Box>
                  <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("gray.700", "white")}>
                    {highlightText(result.name, searchQuery)}
                  </Text>
                </Flex>
              </Link>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SearchBar;
