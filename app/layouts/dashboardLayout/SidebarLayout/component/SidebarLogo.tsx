"use client";

import { Box, Flex, Text, useColorModeValue, Tooltip, Avatar } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { headerHeight } from "../../../../component/config/utils/variable";
import stores from "../../../../store/stores";
import { dashboard } from "../../../../config/utils/routes";
import { useRouter } from "next/navigation";

const SidebarLogo: React.FC = observer(() => {
  const router = useRouter();
  const {
    layout: { isCallapse },
    themeStore: { themeConfig },
    auth:{user}
  } = stores;

  const bg = useColorModeValue(
    themeConfig.colors.custom.light.primary,
    themeConfig.colors.custom.dark.primary
  );


  return (
    <Flex
      bgColor={bg}
      justifyContent={isCallapse ? "center" : "flex-start"}
      flexDirection={isCallapse ? "column" : "row"}
      alignItems="center"
      height={headerHeight}
      px={isCallapse ? 0 : 3}
      transition="all 0.3s ease-in-out"
      borderBottom="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      zIndex={99999999}
    >
      <Box
        cursor="pointer"
        display="flex"
        alignItems="center"
        justifyContent="center"
        onClick={() => router.push(dashboard.home)}
      >
        {isCallapse ? (
          <Text
            fontWeight="bold"
            fontSize="xl"
            color={useColorModeValue("gray.800", "gray.100")}
            letterSpacing="wide"
          >
            {`${user?.companyDetails?.company_name?.charAt(0).toUpperCase()}.${user?.companyDetails?.company_name?.slice(
              -1
            ).toUpperCase()}`}
          </Text>
        ) : (
          <Flex alignItems="center" columnGap={3} maxW="100%">
            {/* Company Logo */}
            <Box
              position="relative"
              width="40px"
              height="40px"
              borderRadius="full"
              overflow="hidden"
              bg={useColorModeValue("white", "gray.800")}
              boxShadow="sm"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Avatar
                src={user?.companyDetails?.logo?.url || "/images/whiteLogo.png"}
                style={{ objectFit: "contain" }}
              />
            </Box>

            {/* Company Name with Tooltip */}
            <Tooltip
              label={user?.companyDetails?.company_name}
              hasArrow
              placement="right"
              bg={useColorModeValue("gray.700", "gray.900")}
              color="white"
              px={3}
              py={1}
              borderRadius="md"
              fontSize="sm"
              openDelay={200}
            >
              <Text
                textAlign="center"
                fontSize="lg"
                fontWeight="bold"
                noOfLines={1}
                isTruncated
                color={useColorModeValue("gray.800", "gray.100")}
                _hover={{ color: useColorModeValue("red.600", "red.300") }}
                transition="color 0.2s ease-in-out"
              >
                {user?.companyDetails?.company_name}
              </Text>
            </Tooltip>
          </Flex>
        )}
      </Box>
    </Flex>
  );
});

export default SidebarLogo;
