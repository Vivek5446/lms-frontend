"use client";

import {
  Badge,
  Box,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import DocumentTable from "./DocumentTable";
import { ApprovalDocument, ApprovalTabKey, TabStateMap } from "../types";

interface ApprovalTabsProps {
  activeTab: ApprovalTabKey;
  counts: Record<ApprovalTabKey, number>;
  tabs: TabStateMap;
  onTabChange: (tab: ApprovalTabKey) => void;
  onView: (document: ApprovalDocument, sourceTab: ApprovalTabKey) => void;
  onApprove: (document: ApprovalDocument) => void;
  onReject: (document: ApprovalDocument) => void;
}

const TAB_ORDER: ApprovalTabKey[] = ["pending", "approved", "rejected"];

export default function ApprovalTabs({
  activeTab,
  counts,
  tabs,
  onTabChange,
  onView,
  onApprove,
  onReject,
}: ApprovalTabsProps) {
  const tabIndex = TAB_ORDER.indexOf(activeTab);
  const panelBg = useColorModeValue("whiteAlpha.700", "blackAlpha.300");

  return (
    <Tabs
      index={tabIndex === -1 ? 0 : tabIndex}
      onChange={(index) => onTabChange(TAB_ORDER[index])}
      variant="enclosed-colored"
      colorScheme="brand"
      isLazy
    >
      <TabList borderBottom="none" gap={2} flexWrap="wrap">
        {TAB_ORDER.map((tabKey) => (
          <Tab
            key={tabKey}
            roundedTop="xl"
            px={4}
            py={3}
            _selected={{
              color: "brand.900",
              bg: "white",
              shadow: "sm",
            }}
          >
            <HStack spacing={2}>
              <Text textTransform="capitalize">{tabKey}</Text>
              <Badge rounded="full" colorScheme="blue" px={2}>
                {counts[tabKey]}
              </Badge>
            </HStack>
          </Tab>
        ))}
      </TabList>

      <TabPanels mt={4}>
        {TAB_ORDER.map((tabKey) => (
          <TabPanel key={tabKey} p={0}>
            <Box rounded="2xl" bg={panelBg}>
              <DocumentTable
                tabKey={tabKey}
                documents={tabs[tabKey].data}
                loading={tabs[tabKey].loading}
                onView={(document) => onView(document, tabKey)}
                onApprove={onApprove}
                onReject={onReject}
              />
            </Box>
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
