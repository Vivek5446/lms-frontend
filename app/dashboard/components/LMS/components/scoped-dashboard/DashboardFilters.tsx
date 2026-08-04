"use client";

import CustomInput from "@/app/component/config/component/customInput/CustomInput";
import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  HStack,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiChevronDown,
  FiFilter,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import {
  DashboardOption,
  ScopedDashboardFilters,
  ScopedDashboardSummary,
} from "./types";

type DashboardFiltersProps = {
  role: "admin" | "departmenthead";
  value: ScopedDashboardFilters;
  options: ScopedDashboardSummary["filterOptions"];
  isLoading: boolean;
  onChange: (next: ScopedDashboardFilters) => void;
  onApply: () => void;
  onClear: () => void;
};

const batchOptions: DashboardOption[] = [
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

const completionOptions: DashboardOption[] = [
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In progress" },
  { value: "not_started", label: "Not started" },
  { value: "pending", label: "Pending" },
];

const activityOptions: DashboardOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

type FilterFieldProps = {
  label: string;
  value: string;
  options: DashboardOption[];
  placeholder: string;
  onChange: (value: string) => void;
};

function FilterField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: FilterFieldProps) {
  return (
    <CustomInput
      type="select"
      name={label}
      label={label}
      value={
        value
          ? options.find((option) => option.value === value) || null
          : null
      }
      onChange={(selected: DashboardOption | null) =>
        onChange(selected?.value || "")
      }
      options={options}
      placeholder={placeholder}
      isClear
    />
  );
}

export function DashboardFilters({
  role,
  value,
  options,
  isLoading,
  onChange,
  onApply,
  onClear,
}: DashboardFiltersProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isMobile =
    useBreakpointValue({
      base: true,
      lg: false,
    }) ?? true;

  const panelBg = useColorModeValue("white", "gray.800");
  const softBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const headingColor = useColorModeValue("gray.900", "white");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const triggerBg = useColorModeValue("white", "gray.800");
  const triggerHoverBg = useColorModeValue("purple.50", "whiteAlpha.100");
  const footerBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const activeCount = Object.values(value).filter(Boolean).length;

  const update = (
    key: keyof ScopedDashboardFilters,
    nextValue: string
  ) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleClear = () => {
    onClear();
  };

  const triggerButton = (
    <Button
      size="sm"
      h="38px"
      px={3.5}
      leftIcon={<FiFilter />}
      rightIcon={<FiChevronDown />}
      onClick={onOpen}
      variant="outline"
      borderRadius="full"
      borderColor={borderColor}
      bg={triggerBg}
      color={headingColor}
      fontSize="sm"
      fontWeight="700"
      boxShadow="0 1px 2px rgba(0, 0, 0, 0.04)"
      transition="all 0.2s ease"
      _hover={{
        bg: triggerHoverBg,
        borderColor: "purple.300",
        transform: "translateY(-1px)",
        boxShadow: "0 5px 14px rgba(98, 105, 255, 0.12)",
      }}
      _active={{
        transform: "translateY(0)",
      }}
    >
      <HStack spacing={2}>
        <Text>Filters</Text>

        {activeCount > 0 && (
          <Badge
            minW="20px"
            h="20px"
            px={1.5}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            bgGradient="linear(to-r, #6269FF, #8A2BE2)"
            color="white"
            fontSize="10px"
            fontWeight="800"
          >
            {activeCount}
          </Badge>
        )}
      </HStack>
    </Button>
  );

  const panelHeading = (
    <HStack spacing={3}>
      <Flex
        w="38px"
        h="38px"
        align="center"
        justify="center"
        flexShrink={0}
        borderRadius="xl"
        bgGradient="linear(to-br, #6269FF, #8A2BE2)"
        boxShadow="0 6px 16px rgba(98, 105, 255, 0.25)"
      >
        <Icon as={FiFilter} color="white" boxSize={4} />
      </Flex>

      <Box>
        <Text
          color={headingColor}
          fontSize="sm"
          fontWeight="800"
          lineHeight="1.2"
        >
          Dashboard filters
        </Text>

        <Text mt={0.5} color={mutedColor} fontSize="xs">
          Refine the dashboard information
        </Text>
      </Box>
    </HStack>
  );

  const fields = (
    <Grid
      templateColumns={{
        base: "1fr",
        md: "repeat(2, minmax(0, 1fr))",
      }}
      gap={3}
      sx={{
        "& label": {
          fontSize: "12px",
          fontWeight: "700",
        },
      }}
    >
      <CustomInput
        type="date"
        name="from"
        label="From date"
        inputVariant="outline"
        value={value.from}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          update("from", event.target.value)
        }
      />

      <CustomInput
        type="date"
        name="to"
        label="To date"
        inputVariant="outline"
        value={value.to}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          update("to", event.target.value)
        }
      />

      {role === "admin" ? (
        <>
          <FilterField
            label="Department"
            value={value.departmentId}
            options={options?.departments || []}
            placeholder="All departments"
            onChange={(nextValue) =>
              update("departmentId", nextValue)
            }
          />

          <FilterField
            label="Role"
            value={value.role}
            options={options?.roles || []}
            placeholder="All roles"
            onChange={(nextValue) => update("role", nextValue)}
          />
        </>
      ) : (
        <FilterField
          label="Learner"
          value={value.userId}
          options={options?.users || []}
          placeholder="All learners"
          onChange={(nextValue) => update("userId", nextValue)}
        />
      )}

      <FilterField
        label="Course"
        value={value.courseId}
        options={options?.courses || []}
        placeholder="All courses"
        onChange={(nextValue) => update("courseId", nextValue)}
      />

      <FilterField
        label="Batch"
        value={value.batchStatus}
        options={batchOptions}
        placeholder="All batch states"
        onChange={(nextValue) =>
          update("batchStatus", nextValue)
        }
      />

      <FilterField
        label="Completion"
        value={value.completionStatus}
        options={completionOptions}
        placeholder="All completion states"
        onChange={(nextValue) =>
          update("completionStatus", nextValue)
        }
      />

      <FilterField
        label="Account status"
        value={value.activityStatus}
        options={activityOptions}
        placeholder="All accounts"
        onChange={(nextValue) =>
          update("activityStatus", nextValue)
        }
      />
    </Grid>
  );

  const actions = (
    <Flex
      w="100%"
      align="center"
      justify="space-between"
      gap={3}
    >
      <Button
        size="sm"
        h="40px"
        px={4}
        leftIcon={<FiX />}
        variant="ghost"
        borderRadius="lg"
        color={mutedColor}
        fontWeight="700"
        onClick={handleClear}
        isDisabled={!activeCount || isLoading}
        _hover={{
          bg: softBg,
          color: headingColor,
        }}
      >
        Clear
      </Button>

      <Button
        size="sm"
        h="40px"
        minW={{ base: "150px", md: "130px" }}
        px={5}
        leftIcon={<FiRefreshCw />}
        borderRadius="lg"
        bgGradient="linear(to-r, #6269FF, #8A2BE2)"
        color="white"
        fontWeight="800"
        onClick={handleApply}
        isLoading={isLoading}
        loadingText="Applying"
        boxShadow="0 6px 16px rgba(98, 105, 255, 0.22)"
        transition="all 0.2s ease"
        _hover={{
          bgGradient: "linear(to-r, #555CEB, #7828C8)",
          transform: "translateY(-1px)",
          boxShadow: "0 8px 20px rgba(98, 105, 255, 0.3)",
        }}
        _active={{
          transform: "translateY(0)",
        }}
      >
        Apply filters
      </Button>
    </Flex>
  );

  if (isMobile) {
    return (
      <>
        {triggerButton}

        <Drawer
          isOpen={isOpen}
          placement="bottom"
          onClose={onClose}
        >
          <DrawerOverlay
            bg="blackAlpha.500"
            backdropFilter="blur(5px)"
          />

          <DrawerContent
            maxH="88dvh"
            bg={panelBg}
            borderTopRadius="24px"
            overflow="hidden"
          >
            <DrawerCloseButton
              top={4}
              right={4}
              borderRadius="full"
            />

            <DrawerHeader
              px={5}
              pt={5}
              pb={4}
              borderBottomWidth="1px"
              borderColor={borderColor}
            >
              {panelHeading}
            </DrawerHeader>

            <DrawerBody
              px={5}
              py={5}
              overflowY="auto"
            >
              {fields}
            </DrawerBody>

            <DrawerFooter
              px={5}
              py={4}
              bg={footerBg}
              borderTopWidth="1px"
              borderColor={borderColor}
            >
              {actions}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom-end"
      closeOnBlur
      gutter={10}
    >
      <PopoverTrigger>{triggerButton}</PopoverTrigger>

      <Portal>
        <PopoverContent
          w="520px"
          maxW="calc(100vw - 32px)"
          bg={panelBg}
          borderColor={borderColor}
          borderRadius="2xl"
          overflow="hidden"
          boxShadow="0 18px 50px rgba(15, 23, 42, 0.16)"
          _focusVisible={{
            boxShadow:
              "0 18px 50px rgba(15, 23, 42, 0.16)",
          }}
        >
          <PopoverArrow bg={panelBg} />
          <PopoverCloseButton
            top={4}
            right={4}
            borderRadius="full"
          />

          <PopoverHeader
            px={5}
            py={4}
            border="none"
          >
            {panelHeading}
          </PopoverHeader>

          <Divider borderColor={borderColor} />

          <PopoverBody
            px={5}
            py={4}
            maxH="60vh"
            overflowY="auto"
          >
            {fields}
          </PopoverBody>

          <PopoverFooter
            px={5}
            py={4}
            bg={footerBg}
            border="none"
            borderTopWidth="1px"
            borderColor={borderColor}
          >
            {actions}
          </PopoverFooter>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}