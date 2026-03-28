import {
    HStack,
    Tab,
    TabList,
    Tabs,
    Text,
} from "@chakra-ui/react";
import { FiUser } from "react-icons/fi";
import { LuBaby } from "react-icons/lu";
import { DentitionType } from "../utils/teethData";

interface DentitionToggleProps {
  value: DentitionType;
  onChange: (value: DentitionType) => void;
}

const TAB_INDEX: Record<DentitionType, number> = {
  adult: 0,
  child: 1,
};

const TAB_VALUE: Record<number, DentitionType> = {
  0: "adult",
  1: "child",
};

export const DentitionToggle = ({
  value,
  onChange,
}: DentitionToggleProps) => {
  return (
    <Tabs
      index={TAB_INDEX[value]}
      onChange={(index) => onChange(TAB_VALUE[index])}
      variant="unstyled"
    >
      <TabList
        bg="gray.100"
        p={1}
        rounded="xl"
        gap={1}
      >
        <Tab
          px={4}
          py={2.5}
          rounded="lg"
          transition="all 0.2s"
          _selected={{
            bg: "white",
            color: "gray.800",
            boxShadow: "sm",
          }}
          _hover={{
            color: "gray.800",
          }}
        >
          <HStack spacing={2}>
            <FiUser />
            <Text fontSize="sm" fontWeight="medium">
              Adult (32 Teeth)
            </Text>
          </HStack>
        </Tab>

        <Tab
          px={4}
          py={2.5}
          rounded="lg"
          transition="all 0.2s"
          _selected={{
            bg: "white",
            color: "gray.800",
            boxShadow: "sm",
          }}
          _hover={{
            color: "gray.800",
          }}
        >
          <HStack spacing={2}>
            <LuBaby />
            <Text fontSize="sm" fontWeight="medium">
              Child (20 Teeth)
            </Text>
          </HStack>
        </Tab>
      </TabList>
    </Tabs>
  );
};
