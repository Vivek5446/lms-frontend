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
  IconButton,
  Collapse,
} from "@chakra-ui/react";
import { Filter, RotateCcw, SlidersHorizontal, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
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
  const { isOpen: isMobileOpen, onOpen: onMobileOpen, onClose: onMobileClose } = useDisclosure();
  const { isOpen: isDesktopOpen, onToggle: onDesktopToggle } = useDisclosure({ defaultIsOpen: false });

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
    onMobileClose();
  };

  const handleClear = () => {
    onClear();
  };

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

      {role === "admin" ? (
        <FilterField
          label="Learner"
          value={value.userId}
          options={options?.users || []}
          placeholder="All learners"
          onChange={(nextValue) => update("userId", nextValue)}
        />
      ) : null}

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
    <HStack w="100%" spacing={3} justify={{ base: "space-between", md: "flex-end" }}>
      <Button flex={{ base: 1, md: "none" }} variant="outline" size={{ base: "lg", md: "md" }} borderRadius="xl" onClick={handleClear} isDisabled={!activeCount || isLoading} leftIcon={<RotateCcw size={18} />}>
        Clear
      </Button>
      <Button
        flex={{ base: 1, md: "none" }}
        colorScheme="purple"
        size={{ base: "lg", md: "md" }}
        borderRadius="xl"
        isLoading={isLoading}
        loadingText="Applying"
        onClick={handleApply}
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
        bg={panelBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="2xl"
        p={4}
        boxShadow="sm"
      >
        <HStack justify="space-between" cursor="pointer" onClick={onDesktopToggle} userSelect="none">
          <HStack spacing={2}>
            <Icon as={SlidersHorizontal} color="purple.500" boxSize={4} />
            <Text fontSize="sm" fontWeight="semibold" color={headingColor}>
              Dashboard filters
            </Text>
            {activeCount > 0 && (
              <Badge ml={2} colorScheme="purple" borderRadius="full">
                {activeCount}
              </Badge>
            )}
          </HStack>
          
          <Button
            display={{ base: "inline-flex", xl: "none" }}
            size="sm"
            variant="outline"
            leftIcon={<Filter size={15} />}
            onClick={(e) => {
              e.stopPropagation();
              onMobileOpen();
            }}
          >
            Filters
            {activeCount > 0 && (
              <Badge ml={2} colorScheme="purple" borderRadius="full">
                {activeCount}
              </Badge>
            )}
          </Button>
          
          <Box display={{ base: "none", xl: "block" }}>
            <Icon as={isDesktopOpen ? ChevronUp : ChevronDown} color="gray.500" boxSize={5} />
          </Box>
        </HStack>

        <Box display={{ base: "none", xl: "block" }}>
          <Collapse in={isDesktopOpen} animateOpacity>
            <Box mt={4} pt={4} borderTopWidth="1px" borderColor={borderColor}>
              {fields}
              <HStack justify="flex-end" mt={3}>
                {actions}
              </HStack>
            </Box>
          </Collapse>
        </Box>
      </Box>

      <Drawer isOpen={isMobileOpen} placement="bottom" onClose={onMobileClose} size="full">
        <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <DrawerContent borderTopRadius="none" h="100vh" position="relative" bg={panelBg}>
          <Box
            position="sticky"
            top={0}
            zIndex={10}
            bg={panelBg}
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
                onClick={onMobileClose}
                variant="solid"
                borderRadius="full"
                w={{ base: "36px", md: "42px" }} h={{ base: "36px", md: "42px" }}
                bg={useColorModeValue("gray.100", "gray.750")}
                color={useColorModeValue("gray.700", "gray.200")}
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.600")}
                boxShadow="sm"
                _hover={{ bg: useColorModeValue("gray.200", "gray.700"), transform: "scale(1.05)" }}
              />
              <Box>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="800" color={headingColor}>
                  Filters
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color={mutedColor} fontWeight="600" mt={0.5}>
                  Refine the dashboard information
                </Text>
              </Box>
            </HStack>
          </Box>

          <DrawerBody px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }}>
            <Box maxW="800px" mx="auto">
              {fields}
            </Box>
          </DrawerBody>

          <Box
            position="sticky"
            bottom={0}
            zIndex={10}
            bg={panelBg}
            borderTopWidth="1px"
            borderColor={borderColor}
            px={{ base: 5, md: 8 }}
            py={{ base: 4, md: 6 }}
          >
            <Box maxW="800px" mx="auto">
              {actions}
            </Box>
          </Box>
        </DrawerContent>
      </Drawer>
    </>
  );
}
