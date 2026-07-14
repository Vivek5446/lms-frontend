"use client";

import {
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
  Icon,
  Input,
  Select,
  Text,
  useColorModeValue,
  useDisclosure,
  IconButton,
} from "@chakra-ui/react";
import CustomInput from "../../../../../component/config/component/customInput/CustomInput";
import { Filter, RotateCcw, SlidersHorizontal, ArrowLeft } from "lucide-react";
import {
  DashboardFiltersValue,
  FilterOption,
} from "./types";

function FilterField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
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

const batchOptions: FilterOption[] = [
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

const activityOptions: FilterOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

type DashboardFiltersProps = {
  value: DashboardFiltersValue;
  companies: FilterOption[];
  roles: FilterOption[];
  courses: FilterOption[];
  isLoading: boolean;
  onChange: (next: DashboardFiltersValue) => void;
  onApply: () => void;
  onReset: () => void;
};

const filterFields = [
  { key: "from", label: "From", type: "date" },
  { key: "to", label: "To", type: "date" },
] as const;

export function DashboardFilters({
  value,
  companies,
  roles,
  courses,
  isLoading,
  onChange,
  onApply,
  onReset,
}: DashboardFiltersProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.600", "gray.400");

  const setField = (key: keyof DashboardFiltersValue, fieldValue: string) => {
    onChange({ ...value, [key]: fieldValue });
  };

  const fields = (
    <Grid
      templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }}
      gap={4}
    >
      <CustomInput
        type="date"
        name="from"
        label="From Date"
        inputVariant="outline"
        value={value.from}
        onChange={(event: any) => setField("from", event.target.value)}
      />
      <CustomInput
        type="date"
        name="to"
        label="To Date"
        inputVariant="outline"
        value={value.to}
        onChange={(event: any) => setField("to", event.target.value)}
      />
      <FilterField
        label="Company"
        value={value.companyId}
        options={companies}
        placeholder="All companies"
        onChange={(nextValue) => setField("companyId", nextValue)}
      />
      <FilterField
        label="Role"
        value={value.role}
        options={roles}
        placeholder="All roles"
        onChange={(nextValue) => setField("role", nextValue)}
      />
      <FilterField
        label="Course"
        value={value.courseId}
        options={courses}
        placeholder="All courses"
        onChange={(nextValue) => setField("courseId", nextValue)}
      />
      <FilterField
        label="Batch status"
        value={value.batchStatus}
        options={batchOptions}
        placeholder="All batches"
        onChange={(nextValue) => setField("batchStatus", nextValue)}
      />
      <FilterField
        label="User status"
        value={value.activityStatus}
        options={activityOptions}
        placeholder="All users"
        onChange={(nextValue) => setField("activityStatus", nextValue)}
      />
    </Grid>
  );

  const actions = (
    <HStack w="100%" spacing={3} justify={{ base: "space-between", md: "flex-end" }}>
      <Button flex={{ base: 1, md: "none" }} variant="outline" size={{ base: "lg", md: "md" }} borderRadius="xl" onClick={onReset} leftIcon={<RotateCcw size={18} />}>
        Reset
      </Button>
      <Button
        flex={{ base: 1, md: "none" }}
        colorScheme="purple"
        size={{ base: "lg", md: "md" }}
        borderRadius="xl"
        isLoading={isLoading}
        onClick={() => {
          onApply();
          onClose();
        }}
        boxShadow="0 4px 14px 0 rgba(98, 105, 255, 0.39)"
        _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(98, 105, 255, 0.23)" }}
      >
        Apply filters
      </Button>
    </HStack>
  );

  return (
    <>
      <Box
        bg={bg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="2xl"
        p={4}
        boxShadow="sm"
      >
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Icon as={SlidersHorizontal} color="purple.500" boxSize={4} />
            <Text fontSize="sm" fontWeight="semibold">
              Analytics filters
            </Text>
          </HStack>
          <Button
            display={{ base: "inline-flex", xl: "none" }}
            size="sm"
            variant="outline"
            leftIcon={<Filter size={15} />}
            onClick={onOpen}
          >
            Filters
          </Button>
        </HStack>

        <Box display={{ base: "none", xl: "block" }} mt={3}>
          {fields}
          <HStack justify="flex-end" mt={3}>
            {actions}
          </HStack>
        </Box>
      </Box>

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
                icon={<ArrowLeft size={17} />}
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
