"use client";

import {
  Box,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  Image,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Divider,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { FiBriefcase, FiChevronDown } from "react-icons/fi";
import stores from "../../../../../store/stores";

const HeaderCompanySelector = observer(() => {
  const { auth, companyStore } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isSuperadmin = role === "superadmin";
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgHover = useColorModeValue("gray.50", "gray.700");
  const companies = companyStore.companies.data || [];
  const selectedCompanyId = companyStore.getActiveCompanyId();

  // Get selected company details
  const selectedCompany = useMemo(() => {
    return companies.find((company: any) => company._id === selectedCompanyId);
  }, [companies, selectedCompanyId]);

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

  if (!isSuperadmin && !selectedCompany) {
    return null;
  }

  return (
    <HStack spacing={0} mx={4} display={{ base: "none", lg: "flex" }}>
      {isSuperadmin ? (
        <Menu isLazy>
          <MenuButton
            as={Button}
            variant="ghost"
            rightIcon={<FiChevronDown />}
            p={2}
            height="auto"
            borderRadius="lg"
            _hover={{ bg: bgHover }}
            transition="all 0.2s"
          >
            <HStack spacing={2}>
              {selectedCompany?.logo?.url ? (
                <Image
                  src={selectedCompany.logo.url}
                  alt={selectedCompany.company_name}
                  boxSize="24px"
                  borderRadius="md"
                  objectFit="cover"
                />
              ) : (
                <Avatar
                  size="sm"
                  name={selectedCompany?.company_name}
                  bgGradient="linear(to-br, blue.500, teal.500)"
                  color="white"
                  fontWeight="bold"
                  borderRadius="md"
                />
              )}
              <VStack spacing={0} align="start" display={{ base: "none", xl: "flex" }}>
                <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="0.5px">
                  Company
                </Text>
                <Text fontSize="sm" fontWeight="600" noOfLines={1} maxW="150px">
                  {selectedCompany?.company_name || "Select Company"}
                </Text>
              </VStack>
            </HStack>
          </MenuButton>
          <MenuList
            maxW="320px"
            maxH="400px"
            overflowY="auto"
            bg={useColorModeValue("white", "gray.800")}
            borderColor={borderColor}
            boxShadow="lg"
          >
            {companies.length > 0 ? (
              companies.map((company: any) => (
                <MenuItem
                  key={company._id}
                  onClick={() => companyStore.setSelectedCompanyId(company._id)}
                  bg={selectedCompanyId === company._id ? bgHover : "transparent"}
                  borderRadius="md"
                  mx={2}
                  my={1}
                  px={3}
                  py={3}
                  _hover={{ bg: bgHover }}
                  transition="all 0.2s"
                >
                  <HStack spacing={3} w="full">
                    {company.logo?.url ? (
                      <Image
                        src={company.logo.url}
                        alt={company.company_name}
                        boxSize="32px"
                        borderRadius="md"
                        objectFit="cover"
                      />
                    ) : (
                      <Avatar
                        size="sm"
                        name={company.company_name}
                        bgGradient="linear(to-br, blue.500, teal.500)"
                        color="white"
                        fontWeight="bold"
                        borderRadius="md"
                      />
                    )}
                    <VStack spacing={0} align="start" flex={1}>
                      <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                        {company.company_name}
                      </Text>
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>
                        {company.companyEmail || "No email"}
                      </Text>
                    </VStack>
                  </HStack>
                </MenuItem>
              ))
            ) : (
              <MenuItem isDisabled>No companies available</MenuItem>
            )}
          </MenuList>
        </Menu>
      ) : (
        <HStack spacing={2} px={3} py={2} borderRadius="lg" bg={bgHover}>
          {selectedCompany?.logo?.url ? (
            <Image
              src={selectedCompany.logo.url}
              alt={selectedCompany?.company_name}
              boxSize="24px"
              borderRadius="md"
              objectFit="cover"
            />
          ) : (
            <Avatar
              size="sm"
              name={selectedCompany?.company_name}
              bgGradient="linear(to-br, blue.500, teal.500)"
              color="white"
              fontWeight="bold"
              borderRadius="md"
            />
          )}
          <VStack spacing={0} align="start" display={{ base: "none", xl: "flex" }}>
            <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="0.5px">
              Company
            </Text>
            <Text fontSize="sm" fontWeight="600" noOfLines={1} maxW="150px">
              {selectedCompany?.company_name || "Current company"}
            </Text>
          </VStack>
        </HStack>
      )}
    </HStack>
  );
});

export default HeaderCompanySelector;
