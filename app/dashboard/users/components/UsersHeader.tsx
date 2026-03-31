"use client";

import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import CustomInput from "../../../component/config/component/customInput/CustomInput";

type Props = {
  onOpenBulk: () => void;
  onOpenCreate: () => void;
  borderColor: string;
  muted: string;
  isSuperadmin: boolean;
  selectedCompanyId: string;
  onCompanyChange: (value: string) => void;
  companies: any[];
};

const UsersHeader = ({
  onOpenBulk,
  onOpenCreate,
  borderColor,
  muted,
  isSuperadmin,
  selectedCompanyId,
  onCompanyChange,
  companies,
}: Props) => {
  return (
    <Box
      bg="white"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      p={{ base: 5, md: 6 }}
      boxShadow="sm"
    >
      <Flex
        justify="space-between"
        align={{ base: "start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
            Users Management
          </Text>
          <Text color={muted} mt={1}>
            Manage users, managers, hierarchy and onboarding
          </Text>
        </Box>

        <HStack
          spacing={3}
          alignSelf={{ base: "stretch", md: "auto" }}
          flexWrap="wrap"
          justify={{ base: "stretch", md: "flex-end" }}
        >
          {isSuperadmin ? (
            <Box minW={{ base: "full", md: "280px" }}>
              <CustomInput
                type="select"
                name="companyId"
                placeholder="Select company"
                value={
                  companies
                    .map((company: any) => ({
                      label: company.company_name,
                      value: company._id,
                    }))
                    .find((option: any) => option.value === selectedCompanyId) || null
                }
                onChange={(option: any) => onCompanyChange(option?.value || "")}
                options={companies.map((company: any) => ({
                  label: company.company_name,
                  value: company._id,
                }))}
                isSearchable
              />
            </Box>
          ) : null}
          <Button colorScheme="purple" variant="outline" onClick={onOpenBulk}>
            Excel Upload
          </Button>
          <Button colorScheme="blue" onClick={onOpenCreate}>
            Add User
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default UsersHeader;
