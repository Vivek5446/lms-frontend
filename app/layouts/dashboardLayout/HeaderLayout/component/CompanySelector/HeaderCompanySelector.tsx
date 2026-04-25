"use client";

import {
  Box,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  Image,
  Avatar,
  Button,
  Divider,
  Badge,
  Flex,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { 
  FiBriefcase, 
  FiChevronDown, 
  FiSearch, 
  FiCheck, 
  FiStar,
} from "react-icons/fi";
import stores from "../../../../../store/stores";

const HeaderCompanySelector = observer(() => {
  const { auth, companyStore } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isSuperadmin = role === "superadmin";
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgHover = useColorModeValue("gray.50", "gray.700");
  const companies = companyStore.companies.data || [];
  const selectedCompanyId = companyStore.getActiveCompanyId();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Get selected company details
  const selectedCompany = useMemo(() => {
    return companies.find((company: any) => company._id === selectedCompanyId);
  }, [companies, selectedCompanyId]);

  // Filter companies based on search
  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return companies;
    return companies.filter((company: any) =>
      company.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.companyEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [companies, searchQuery]);

  useEffect(() => {
    if (isSuperadmin) {
      if (!companyStore.companies.data?.length) {
        companyStore.getManagedCompanies().catch(() => undefined);
      } else {
        companyStore.initializeCompanyContext();
      }
      return;
    }

    companyStore.initializeCompanyContext();
  }, [companyStore, isSuperadmin]);

  const handleCompanySelect = (companyId: string) => {
    companyStore.setSelectedCompanyId(companyId);
    setSearchQuery("");
    setIsPopoverOpen(false); // Close the popover after selection
  };

  if (!isSuperadmin && !selectedCompany) {
    return null;
  }

  // Render company info (used in both dropdown and static view)
  const CompanyInfo = ({ company, showEmail = false, isSelected = false }) => (
    <HStack spacing={3} w="full">
      {company?.logo?.url ? (
        <Image
          src={company.logo.url}
          alt={company.company_name}
          boxSize={showEmail ? "40px" : "32px"}
          borderRadius="lg"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/40?text=Logo"
        />
      ) : (
        <Avatar
          size={showEmail ? "sm" : "xs"}
          name={company?.company_name}
          bgGradient="linear(to-br, brand.500, purple.500)"
          color="white"
          fontWeight="bold"
          borderRadius="lg"
          icon={<FiBriefcase size={showEmail ? 20 : 16} />}
        />
      )}
      <VStack spacing={0} align="start" flex={1}>
        <HStack spacing={2}>
          <Text 
            fontSize={showEmail ? "md" : "sm"} 
            fontWeight="600" 
            noOfLines={1}
            color={useColorModeValue("gray.800", "white")}
          >
            {company?.company_name || "Unnamed Company"}
          </Text>
          {isSelected && (
            <Badge 
              colorScheme="green" 
              variant="solid" 
              size="sm" 
              borderRadius="full"
              px={2}
            >
              Active
            </Badge>
          )}
          {company?.isPremium && (
            <Icon as={FiStar} color="yellow.500" boxSize={3} />
          )}
        </HStack>
        {showEmail && company?.companyEmail && (
          <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")} noOfLines={1}>
            {company.companyEmail}
          </Text>
        )}
      </VStack>
      {isSelected && (
        <Icon as={FiCheck} color="green.500" boxSize={4} />
      )}
    </HStack>
  );

  return (
    <HStack spacing={0} mx={4} display={{ base: "none", lg: "flex" }}>
      {isSuperadmin ? (
        <Popover 
          placement="bottom-start" 
          isLazy
          closeOnBlur={true}
          isOpen={isPopoverOpen}
          onOpen={() => setIsPopoverOpen(true)}
          onClose={() => setIsPopoverOpen(false)}
        >
          <PopoverTrigger>
            <Button
              variant="ghost"
              rightIcon={<FiChevronDown />}
              p={2}
              height="auto"
              borderRadius="lg"
              _hover={{ bg: bgHover }}
              transition="all 0.2s"
              aria-label="Select company"
            >
              <HStack spacing={2}>
                {selectedCompany?.logo?.url ? (
                  <Image
                    src={selectedCompany.logo.url}
                    alt={selectedCompany.company_name}
                    boxSize="28px"
                    borderRadius="lg"
                    objectFit="cover"
                  />
                ) : (
                  <Avatar
                    size="xs"
                    name={selectedCompany?.company_name}
                    bgGradient="linear(to-br, brand.500, purple.500)"
                    color="white"
                    fontWeight="bold"
                    borderRadius="lg"
                    icon={<FiBriefcase size={14} />}
                  />
                )}
                <VStack spacing={0} align="start" display={{ base: "none", xl: "flex" }}>
                  <Text 
                    fontSize="xs" 
                    color={useColorModeValue("gray.500", "gray.400")} 
                    fontWeight="600" 
                    textTransform="uppercase" 
                    letterSpacing="0.5px"
                  >
                    Active Company
                  </Text>
                  <Text 
                    fontSize="sm" 
                    fontWeight="600" 
                    noOfLines={1} 
                    maxW="180px"
                    color={useColorModeValue("gray.800", "white")}
                  >
                    {selectedCompany?.company_name || "Select Company"}
                  </Text>
                </VStack>
              </HStack>
            </Button>
          </PopoverTrigger>
          
          <PopoverContent
            maxW="360px"
            bg={useColorModeValue("white", "gray.800")}
            borderColor={borderColor}
            boxShadow="2xl"
            borderRadius="xl"
            overflow="hidden"
          >
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody p={0}>
              <VStack spacing={0} align="stretch">
                {/* Header */}
                <Box px={4} pt={4} pb={2}>
                  <Text 
                    fontSize="sm" 
                    fontWeight="600" 
                    mb={2}
                    color={useColorModeValue("gray.800", "white")}
                  >
                    Switch Company
                  </Text>
                  <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search companies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      borderRadius="lg"
                      bg={useColorModeValue("gray.50", "gray.700")}
                      borderColor={useColorModeValue("gray.200", "gray.600")}
                      color={useColorModeValue("gray.800", "white")}
                      _placeholder={{ color: useColorModeValue("gray.400", "gray.500") }}
                    />
                  </InputGroup>
                </Box>

                <Divider borderColor={borderColor} />

                {/* Company List */}
                <Box maxH="400px" overflowY="auto" px={2} py={2}>
                  {filteredCompanies.length > 0 ? (
                    <VStack spacing={1} align="stretch">
                      {filteredCompanies.map((company: any) => (
                        <Button
                          key={company._id}
                          variant="ghost"
                          onClick={() => handleCompanySelect(company._id)}
                          bg={selectedCompanyId === company._id ? bgHover : "transparent"}
                          borderRadius="lg"
                          px={3}
                          py={3}
                          height="auto"
                          justifyContent="flex-start"
                          _hover={{ bg: bgHover }}
                          transition="all 0.2s"
                          w="full"
                        >
                          <CompanyInfo 
                            company={company} 
                            showEmail={true}
                            isSelected={selectedCompanyId === company._id}
                          />
                        </Button>
                      ))}
                    </VStack>
                  ) : (
                    <VStack py={8} spacing={2}>
                      <Icon as={FiBriefcase} boxSize={8} color="gray.400" />
                      <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
                        No companies found
                      </Text>
                    </VStack>
                  )}
                </Box>

                {/* Footer with stats */}
                <Divider borderColor={borderColor} />
                <Box 
                  px={4} 
                  py={2} 
                  bg={useColorModeValue("gray.50", "gray.700")}
                >
                  <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
                    Total: {companies.length} company{companies.length !== 1 ? 'ies' : ''}
                  </Text>
                </Box>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : (
        <HStack 
          spacing={2} 
          px={3} 
          py={2} 
          borderRadius="lg" 
          bg={bgHover}
          cursor="default"
        >
          {selectedCompany?.logo?.url ? (
            <Image
              src={selectedCompany.logo.url}
              alt={selectedCompany?.company_name}
              boxSize="28px"
              borderRadius="lg"
              objectFit="cover"
            />
          ) : (
            <Avatar
              size="xs"
              name={selectedCompany?.company_name}
              bgGradient="linear(to-br, brand.500, purple.500)"
              color="white"
              fontWeight="bold"
              borderRadius="lg"
              icon={<FiBriefcase size={14} />}
            />
          )}
          <VStack spacing={0} align="start" display={{ base: "none", xl: "flex" }}>
            <Text 
              fontSize="xs" 
              color={useColorModeValue("gray.500", "gray.400")} 
              fontWeight="600" 
              textTransform="uppercase" 
              letterSpacing="0.5px"
            >
              Current Company
            </Text>
            <Text 
              fontSize="sm" 
              fontWeight="600" 
              noOfLines={1} 
              maxW="180px"
              color={useColorModeValue("gray.800", "white")}
            >
              {selectedCompany?.company_name || "Current company"}
            </Text>
          </VStack>
        </HStack>
      )}
    </HStack>
  );
});

export default HeaderCompanySelector;