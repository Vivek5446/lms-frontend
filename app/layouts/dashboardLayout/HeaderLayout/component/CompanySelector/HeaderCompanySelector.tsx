"use client";

import { Box, HStack, Select, Text, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { FiBriefcase } from "react-icons/fi";
import stores from "../../../../../store/stores";

const HeaderCompanySelector = observer(() => {
  const { auth, companyStore } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isSuperadmin = role === "superadmin";
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const companies = companyStore.companies.data || [];
  const selectedCompanyId = companyStore.getActiveCompanyId();

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

  return (
    <HStack spacing={3} mx={4} display={{ base: "none", lg: "flex" }}>
      <Box color="brand.500">
        <FiBriefcase size={18} />
      </Box>
      <Box minW="260px">
        {/* <Text fontSize="xs" color="gray.500" mb={1}>
          Company context
        </Text> */}
        <Select
          size="sm"
          rounded="full"
          bg={useColorModeValue("white", "gray.700")}
          borderColor={borderColor}
          value={selectedCompanyId}
          isDisabled={!isSuperadmin}
          onChange={(event) => companyStore.setSelectedCompanyId(event.target.value)}
        >
          {!isSuperadmin ? (
            <option value={auth.company || ""}>
              {auth.user?.companyDetails?.company_name || "Current company"}
            </option>
          ) : (
            companies.map((company: any) => (
              <option key={company._id} value={company._id}>
                {company.company_name}
              </option>
            ))
          )}
        </Select>
      </Box>
    </HStack>
  );
});

export default HeaderCompanySelector;
