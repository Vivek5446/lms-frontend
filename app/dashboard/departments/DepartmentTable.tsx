import { departmentStore } from "@/app/store/departmentStore/departmentStore";
import {
  AddIcon,
  ChevronRightIcon,
  DeleteIcon,
  EditIcon,
} from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  HStack,
  Icon,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronLeftIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FiHash, FiTrash2, FiEdit2, FiPlus } from "react-icons/fi";
import AddDepartmentModal from "./AddDepartment";

type DepartmentTableProps = {
  companyId?: string;
  companyName?: string;
};

const DepartmentTable = ({ companyId, companyName }: DepartmentTableProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 5;

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("gray.800", "gray.900");
  const rowHoverBg = useColorModeValue("blue.50", "blue.900");
  const statTextColor = useColorModeValue("gray.500", "gray.400");
  const statNumberColor = useColorModeValue("blue.600", "blue.400");
  const statNumberPurple = useColorModeValue("purple.600", "purple.400");
  const statNumberOrange = useColorModeValue("orange.600", "orange.400");
  const emptyStateBg = useColorModeValue("gray.50", "gray.700");
  const emptyStateBorder = useColorModeValue("gray.200", "gray.600");
  const emptyStateText = useColorModeValue("gray.600", "gray.300");
  const emptyStateSubtext = useColorModeValue("gray.500", "gray.400");
  const modalBg = useColorModeValue("white", "gray.800");
  const modalCloseBtnColor = useColorModeValue("gray.500", "gray.400");
  const modalDeleteBg = useColorModeValue("red.50", "red.900");
  const modalDeleteColor = useColorModeValue("red.500", "red.400");
  const modalTextColor = useColorModeValue("gray.500", "gray.400");
  const paginationTextColor = useColorModeValue("gray.500", "gray.400");
  const tableRowEvenBg = useColorModeValue("white", "gray.800");
  const tableRowOddBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    if (companyId) {
      departmentStore
        .fetchDepartments(companyId, page, limit)
        .catch(() => undefined);
    }
  }, [companyId, page]);

  const totalPages = Math.max(
    1,
    Math.ceil((departmentStore.pagination?.total || 0) / limit),
  );

  const handleEdit = (dept: any) => {
    setSelectedDept(dept);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedDept(null);
    onOpen();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    onDeleteOpen();
  };

  const handleSaved = async (mode: "create" | "update") => {
    if (!companyId) {
      return;
    }

    if (mode === "create" && page !== 1) {
      setPage(1);
      return;
    }

    await departmentStore.fetchDepartments(companyId, page, limit);
  };

  const confirmDelete = async () => {
    if (!deleteId || !companyId) {
      return;
    }

    const moveToPreviousPage =
      page > 1 && departmentStore.departments.length === 1;

    try {
      await departmentStore.deleteDepartment(deleteId);
      setDeleteId(null);
      onDeleteClose();

      if (moveToPreviousPage) {
        setPage((currentPage) => currentPage - 1);
        return;
      }

      await departmentStore.fetchDepartments(companyId, page, limit);
    } catch {}
  };

  // Calculate statistics
  const stats = {
    total: departmentStore.pagination?.total || 0,
    currentPage: departmentStore.departments.length,
    totalPages: totalPages,
  };

  return (
    <Box>
      {/* Statistics Cards */}
      {companyId && departmentStore.departments.length > 0 && (
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={6}>
          <Box
            bg={cardBg}
            p={4}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
          >
            <Stat>
              <StatLabel color={statTextColor} fontSize="sm">
                Total Departments
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color={statNumberColor}>
                {stats.total}
              </StatNumber>
              <StatHelpText fontSize="xs" color={statTextColor}>
                <Icon as={FiHash} mr={1} />
                Across organization
              </StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={4}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
          >
            <Stat>
              <StatLabel color={statTextColor} fontSize="sm">
                Current Page
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color={statNumberPurple}>
                {stats.currentPage}
              </StatNumber>
              <StatHelpText fontSize="xs" color={statTextColor}>
                <Icon as={FiHash} mr={1} />
                Showing {stats.currentPage} departments
              </StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={4}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
          >
            <Stat>
              <StatLabel color={statTextColor} fontSize="sm">
                Page Navigation
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color={statNumberOrange}>
                {page} / {stats.totalPages}
              </StatNumber>
              <StatHelpText fontSize="xs" color={statTextColor}>
                Page {page} of {stats.totalPages}
              </StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>
      )}

      {/* Main Card */}
      <Box
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="lg"
        transition="all 0.2s"
        _hover={{ boxShadow: "xl" }}
        position="relative"
      >
        {/* Decorative gradient bar */}
        <Box
          h="1"
          bgGradient="linear(to-r, blue.400, purple.500, pink.400)"
          position="absolute"
          top="0"
          left="0"
          right="0"
        />

        <Box p={6}>
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
            gap={4}
            mb={6}
          >
            <Box>
              <Flex align="center" gap={3} mb={2}>
                <Box
                  p={2}
                  borderRadius="xl"
                  bgGradient="linear(to-br, blue.500, purple.600)"
                  color="white"
                >
                  <Icon as={FiHash} boxSize={5} />
                </Box>
                <Box>
                  <Text 
                    fontSize={{ base: "xl", md: "2xl" }} 
                    fontWeight="bold"
                    color={useColorModeValue("gray.800", "white")}
                  >
                    Departments
                  </Text>
                  <Text 
                    fontSize="sm" 
                    color={statTextColor} 
                    mt={1}
                  >
                    {companyName
                      ? `Managing departments for ${companyName}`
                      : "Select a company to view and manage departments"}
                  </Text>
                </Box>
              </Flex>
            </Box>

            <Tooltip
              label={!companyId ? "Please select a company first" : "Add new department"}
              hasArrow
            >
              <Button
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="blue"
                size="md"
                width={{ base: "100%", md: "auto" }}
                onClick={handleCreate}
                isDisabled={!companyId}
                bgGradient="linear(to-r, blue.500, purple.600)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, blue.600, purple.700)",
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
              >
                Add Department
              </Button>
            </Tooltip>
          </Flex>

          {departmentStore.isLoading ? (
            <Flex justify="center" py={16}>
              <Spinner
                size="xl"
                color="blue.500"
                thickness="3px"
                speed="0.65s"
              />
            </Flex>
          ) : departmentStore.error ? (
            <Box
              p={4}
              bg={useColorModeValue("red.50", "red.900")}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={useColorModeValue("red.200", "red.700")}
            >
              <Text color={useColorModeValue("red.600", "red.300")} textAlign="center">
                {departmentStore.error}
              </Text>
            </Box>
          ) : departmentStore.departments.length === 0 ? (
            <Box
              p={12}
              textAlign="center"
              bg={emptyStateBg}
              borderRadius="xl"
              borderWidth="2px"
              borderColor={emptyStateBorder}
              borderStyle="dashed"
            >
              <Icon as={FiHash} boxSize={12} color={statTextColor} mb={3} />
              <Text fontSize="lg" fontWeight="semibold" color={emptyStateText}>
                No departments found
              </Text>
              <Text fontSize="sm" color={emptyStateSubtext} mt={2}>
                {companyName
                  ? `No departments have been created for ${companyName} yet`
                  : "Please select a company to view its departments"}
              </Text>
              {companyId && (
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  size="sm"
                  mt={4}
                  onClick={handleCreate}
                >
                  Create your first department
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TableContainer
                borderRadius="xl"
                overflowX="auto"
                maxH="500px"
                overflowY="auto"
                sx={{
                  "&::-webkit-scrollbar": {
                    width: "8px",
                    height: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: useColorModeValue("#f1f1f1", "#2d3748"),
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: useColorModeValue("#888", "#4a5568"),
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: useColorModeValue("#555", "#718096"),
                  },
                }}
              >
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead bg={headerBg} position="sticky" top={0} zIndex={1}>
                    <Tr>
                      <Th color="white" fontSize="sm" borderTopRadius="xl">
                        Department Name
                      </Th>
                      <Th color="white" fontSize="sm">
                        Code
                      </Th>
                      <Th textAlign="right" color="white" fontSize="sm">
                        Actions
                      </Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {departmentStore.departments.map((dept, index) => (
                      <Tr
                        key={dept._id}
                        bg={index % 2 === 0 ? tableRowEvenBg : tableRowOddBg}
                        _hover={{
                          bg: rowHoverBg,
                          transition: "background 0.2s",
                        }}
                        transition="all 0.2s"
                      >
                        <Td>
                          <HStack spacing={3}>
                            <Box
                              w={8}
                              h={8}
                              borderRadius="lg"
                              bgGradient={`linear(to-br, ${
                                ["blue", "purple", "green", "orange", "pink"][
                                  index % 5
                                ]
                              }.400, ${
                                ["blue", "purple", "green", "orange", "pink"][
                                  index % 5
                                ]
                              }.600)`}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="white"
                              fontWeight="bold"
                            >
                              {dept.departmentName?.charAt(0).toUpperCase()}
                            </Box>
                            <Text 
                              fontWeight="600" 
                              fontSize={{ base: "sm", md: "md" }}
                              color={useColorModeValue("gray.800", "white")}
                            >
                              {dept.departmentName}
                            </Text>
                          </HStack>
                        </Td>

                        <Td>
                          <Badge
                            variant="subtle"
                            colorScheme="purple"
                            borderRadius="full"
                            px={3}
                            py={1.5}
                            fontSize={{ base: "xs", md: "sm" }}
                            fontWeight="medium"
                          >
                            <HStack spacing={1}>
                              <Icon as={FiHash} boxSize={3} />
                              <Text>{dept.code}</Text>
                            </HStack>
                          </Badge>
                        </Td>

                        <Td>
                          <Flex justify="flex-end" gap={2}>
                            <Tooltip label="Edit department" hasArrow>
                              <IconButton
                                aria-label="Edit"
                                icon={<Icon as={FiEdit2} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => handleEdit(dept)}
                                _hover={{
                                  bg: useColorModeValue("blue.100", "blue.900"),
                                  transform: "scale(1.1)",
                                }}
                                transition="all 0.2s"
                              />
                            </Tooltip>

                            <Tooltip label="Delete department" hasArrow>
                              <IconButton
                                aria-label="Delete"
                                icon={<Icon as={FiTrash2} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteClick(dept._id)}
                                _hover={{
                                  bg: useColorModeValue("red.100", "red.900"),
                                  transform: "scale(1.1)",
                                }}
                                transition="all 0.2s"
                              />
                            </Tooltip>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Flex
                align="center"
                justify="space-between"
                mt={6}
                pt={4}
                borderTopWidth="1px"
                borderColor={borderColor}
                gap={4}
                direction={{ base: "column", sm: "row" }}
              >
                <Text fontSize="sm" color={paginationTextColor}>
                  Showing page {page} of {totalPages} • Total{" "}
                  {departmentStore.pagination?.total || 0} departments
                </Text>

                <HStack spacing={3}>
                  <Button
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    isDisabled={page === 1}
                    leftIcon={<ChevronLeftIcon size={16} />}
                    variant="outline"
                    colorScheme="blue"
                    _hover={{
                      transform: "translateX(-2px)",
                      boxShadow: "sm",
                    }}
                    transition="all 0.2s"
                  >
                    Previous
                  </Button>

                  <HStack spacing={2}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={page === pageNum ? "solid" : "outline"}
                          colorScheme="blue"
                          onClick={() => setPage(pageNum)}
                          minW="36px"
                          _hover={{
                            transform: "translateY(-2px)",
                          }}
                          transition="all 0.2s"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </HStack>

                  <Button
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    isDisabled={page >= totalPages}
                    rightIcon={<ChevronRightIcon />}
                    variant="outline"
                    colorScheme="blue"
                    _hover={{
                      transform: "translateX(2px)",
                      boxShadow: "sm",
                    }}
                    transition="all 0.2s"
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Box>

      {/* Add/Edit Modal */}
      <AddDepartmentModal
        isOpen={isOpen}
        onClose={() => {
          setSelectedDept(null);
          onClose();
        }}
        initialData={selectedDept}
        companyId={companyId}
        companyName={companyName}
        onSaved={handleSaved}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" bg={modalBg}>
          <ModalHeader bgGradient="linear(to-r, red.500, pink.500)" bgClip="text">
            Delete Department
          </ModalHeader>
          <ModalCloseButton color={modalCloseBtnColor} />

          <ModalBody>
            <Flex align="center" justify="center" direction="column" py={4}>
              <Box
                p={4}
                borderRadius="full"
                bg={modalDeleteBg}
                color={modalDeleteColor}
                mb={4}
              >
                <Icon as={FiTrash2} boxSize={8} />
              </Box>
              <Text fontSize="lg" fontWeight="semibold" textAlign="center" color={useColorModeValue("gray.800", "white")}>
                Are you sure you want to delete this department?
              </Text>
              <Text fontSize="sm" color={modalTextColor} mt={2} textAlign="center">
                This action cannot be undone. All related data will be permanently removed.
              </Text>
            </Flex>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onDeleteClose}>
              Cancel
            </Button>

            <Button
              colorScheme="red"
              onClick={confirmDelete}
              isLoading={departmentStore.isSubmitting}
              leftIcon={<Icon as={FiTrash2} />}
            >
              Delete Department
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default observer(DepartmentTable);