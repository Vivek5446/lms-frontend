"use client";

import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  IconButton,
  Input,
  Select,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { FiFilter, FiRefreshCw, FiX, FiArrowLeft } from "react-icons/fi";
import CustomInput from "@/app/component/config/component/customInput/CustomInput";
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

function FilterField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: DashboardOption[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <CustomInput
      type="select"
      name={label}
      label={label}
      value={value ? options.find(o => o.value === value) || null : null}
      onChange={(selected: any) => onChange(selected ? selected.value : "")}
      options={options}
      placeholder={placeholder}
      isClear={true}
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
  const isCompact = useBreakpointValue({ base: true, lg: false }) ?? true;
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeCount = Object.values(value).filter(Boolean).length;

  const update = (key: keyof ScopedDashboardFilters, nextValue: string) => {
    onChange({ ...value, [key]: nextValue });
  };

  const fields = (
    <Grid
      templateColumns={{
        base: "1fr",
        md: "repeat(2, minmax(0, 1fr))",
        xl: "repeat(4, minmax(0, 1fr))",
      }}
      gap={4}
    >
      <CustomInput
        type="date"
        name="from"
        label="From Date"
        inputVariant="outline"
        value={value.from}
        onChange={(event: any) => update("from", event.target.value)}
      />
      <CustomInput
        type="date"
        name="to"
        label="To Date"
        inputVariant="outline"
        value={value.to}
        onChange={(event: any) => update("to", event.target.value)}
      />
      {role === "admin" ? (
        <>
          <FilterField
            label="Department"
            value={value.departmentId}
            options={options?.departments || []}
            placeholder="All departments"
            onChange={(nextValue) => update("departmentId", nextValue)}
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
        onChange={(nextValue) => update("batchStatus", nextValue)}
      />
      <FilterField
        label="Completion"
        value={value.completionStatus}
        options={completionOptions}
        placeholder="All completion states"
        onChange={(nextValue) => update("completionStatus", nextValue)}
      />
      <FilterField
        label="Account status"
        value={value.activityStatus}
        options={activityOptions}
        placeholder="All accounts"
        onChange={(nextValue) => update("activityStatus", nextValue)}
      />
    </Grid>
  );

  const actions = (
    <HStack justify={{ base: "space-between", lg: "flex-end" }} w="100%" mt={{ base: 2, lg: 6 }} spacing={{ base: 3, lg: 4 }}>
      <Button
        h={{ base: "52px", lg: "44px" }}
        px={{ base: 4, lg: 6 }}
        borderRadius={{ base: "xl", lg: "lg" }}
        variant="outline"
        borderWidth={{ base: "2px", lg: "1.5px" }}
        borderColor={useColorModeValue("red.500", "red.500")}
        color={useColorModeValue("red.500", "red.400")}
        colorScheme="red"
        fontSize="sm"
        fontWeight={{ base: "800", lg: "600" }}
        letterSpacing={{ base: "0.1em", lg: "wide" }}
        leftIcon={!isCompact ? <FiX /> : undefined}
        onClick={onClear}
        isDisabled={!activeCount || isLoading}
        flex={{ base: 0.4, lg: "none" }}
        _hover={{ bg: useColorModeValue("red.50", "rgba(254, 178, 178, 0.1)"), borderColor: useColorModeValue("red.600", "red.400"), transform: !isCompact ? "translateY(-1px)" : "none" }}
        transition="all 0.2s"
      >
        {isCompact ? "CLEAR" : "Clear filters"}
      </Button>
      <Button
        h={{ base: "52px", lg: "44px" }}
        px={{ base: 4, lg: 8 }}
        borderRadius={{ base: "xl", lg: "lg" }}
        colorScheme="purple"
        fontSize="sm"
        fontWeight={{ base: "900", lg: "600" }}
        letterSpacing={{ base: "0.1em", lg: "wide" }}
        leftIcon={!isCompact ? <FiRefreshCw /> : undefined}
        onClick={() => {
          onApply();
          if (isCompact) onClose();
        }}
        isLoading={isLoading}
        flex={{ base: 1, lg: "none" }}
        _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 16px rgba(128,90,213,0.3)" }}
        _active={{ transform: "translateY(0)" }}
        transition="all 0.2s"
      >
        {isCompact ? "APPLY FILTERS" : "Apply filters"}
      </Button>
    </HStack>
  );

  if (isCompact) {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<FiFilter />}
          onClick={onOpen}
          borderRadius="full"
          bg={bg}
          w={{ base: "100%", lg: "auto" }}
        >
          Filters
          {activeCount ? (
            <Badge ml={2} colorScheme="purple" borderRadius="full">
              {activeCount}
            </Badge>
          ) : null}
        </Button>
        <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="full">
          <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <DrawerContent borderTopRadius="none" h="100vh" position="relative" bg={bg}>
            <Box
              position="sticky"
              top={0}
              zIndex={10}
              bg={bg}
              borderBottomWidth="1px"
              borderColor={borderColor}
              px={{ base: 5, md: 8 }}
              pt={{ base: 6, md: 10 }}
              pb={{ base: 4, md: 6 }}
            >
              <HStack spacing={4} align="center">
                <IconButton
                  aria-label="Close"
                  icon={<FiArrowLeft size={17} />}
                  onClick={onClose}
                  variant="solid"
                  borderRadius="full"
                  w={{ base: "36px", md: "42px" }} h={{ base: "36px", md: "42px" }}
                  bg={useColorModeValue("gray.100", "gray.750")}
                  color={useColorModeValue("gray.700", "gray.200")}
                  border="1px solid"
                  borderColor={useColorModeValue("gray.200", "gray.600")}
                  boxShadow="sm"
                  _hover={{ bg: useColorModeValue("gray.200", "gray.700"), transform: "scale(1.05)" }}
                  _active={{ transform: "scale(0.95)" }}
                  transition="all 0.2s"
                  flexShrink={0}
                />
                <Box>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                    <Box as="span" color={useColorModeValue("gray.900", "white")}>DASHBOARD </Box>
                    <Box as="span" bgGradient={useColorModeValue("linear(to-r, purple.500, purple.700)", "linear(to-r, purple.300, purple.500)")} bgClip="text">
                      FILTERS
                    </Box>
                  </Text>
                  <Text fontSize="10px" color={useColorModeValue("gray.600", "gray.400")} fontWeight="700" letterSpacing="0.2em" mt={0.5}>
                    REFINE YOUR DATA
                  </Text>
                </Box>
              </HStack>
            </Box>
            <DrawerBody pb="130px" px={{ base: 5, md: 8 }} pt={{ base: 6, md: 8 }}>
              {fields}
            </DrawerBody>
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg={useColorModeValue(
                "linear-gradient(to top, #ffffff 70%, transparent)",
                "linear-gradient(to top, #1a202c 70%, transparent)"
              )}
              px={5}
              pb={6}
              pt={8}
            >
              <Box maxW={{ base: "100%", md: "600px", lg: "680px" }} mx="auto">
                {actions}
              </Box>
            </Box>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Box
      bg={bg}
      w={'100%'}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
      
      boxShadow="sm"
    >
      <HStack justify="space-between" mb={3}>
        <HStack>
          <FiFilter />
          <Text fontSize="sm" fontWeight="semibold">
            Filters
          </Text>
        </HStack>
        {activeCount ? (
          <Badge colorScheme="purple" borderRadius="full">
            {activeCount} active
          </Badge>
        ) : null}
      </HStack>
      {fields}
      {actions}
    </Box>
  );
}
