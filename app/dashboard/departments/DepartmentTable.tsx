import {
  Box,
  Flex,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Spinner,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@chakra-ui/react";
import {
  EditIcon,
  DeleteIcon,
  AddIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { ChevronLeftIcon } from "lucide-react";
import { departmentStore } from "@/app/store/departmentStore/departmentStore";
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

  useEffect(() => {
    departmentStore
      .fetchDepartments(companyId, page, limit)
      .catch(() => undefined);
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

  return (
    <Box bg="white" borderWidth="1px" borderRadius="2xl" p={6} boxShadow="sm">
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        gap={3}
        mb={4}
      >
        <Box>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold">
            Departments
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {companyName
              ? `Showing departments for ${companyName}`
              : "Select a company to view departments"}
          </Text>
        </Box>

        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          size={{ base: "sm", md: "sm" }}
          width={{ base: "100%", md: "auto" }}
          onClick={handleCreate}
          isDisabled={!companyId}
        >
          Add Department
        </Button>
      </Flex>

      {departmentStore.isLoading ? (
        <Flex justify="center" py={10}>
          <Spinner size="lg" color="blue.500" />
        </Flex>
      ) : departmentStore.error ? (
        <Text color="red.500">{departmentStore.error}</Text>
      ) : departmentStore.departments.length === 0 ? (
        <Text>No departments found for the selected company</Text>
      ) : (
        <>
          <TableContainer
            borderRadius="xl"
            overflowX="auto"
            maxH="400px" // ✅ vertical scroll only for table
            overflowY="auto"
          >
            <Table variant="simple" size={{ base: "sm", md: "md" }}>
              <Thead bg="gray.700">
                <Tr>
                  <Th color="white">Department Name</Th>
                  <Th color="white">Code</Th>
                  <Th textAlign="right" color="white">
                    Actions
                  </Th>
                </Tr>
              </Thead>

              <Tbody>
                {departmentStore.departments.map((dept, index) => (
                  <Tr
                    key={dept._id}
                    bg={index % 2 === 0 ? "white" : "gray.50"}
                    _hover={{ bg: "blue.50" }}
                  >
                    <Td fontWeight="500" fontSize={{ base: "sm", md: "md" }}>
                      {dept.departmentName}
                    </Td>

                    <Td>
                      <Badge
                        colorScheme="purple"
                        borderRadius="full"
                        px={2}
                        fontSize={{ base: "xs", md: "sm" }}
                      >
                        {dept.code}
                      </Badge>
                    </Td>

                    <Td>
                      <Flex justify="flex-end" gap={2}>
                        <IconButton
                          aria-label="Edit"
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(dept)}
                        />

                        <IconButton
                          aria-label="Delete"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDeleteClick(dept._id)}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Flex align="center" justify="space-between" mt={4} gap={2}>
            <Button
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              isDisabled={page === 1}
            >
              <Flex align="center" gap={1}>
                <ChevronLeftIcon />
                <Text display={{ base: "none", md: "block" }}>Previous</Text>
              </Flex>
            </Button>

            <Text fontSize="sm">
              Page {page} of {totalPages}
            </Text>

            <Button
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              isDisabled={page >= totalPages}
            >
              <Flex align="center" gap={1}>
                <Text display={{ base: "none", md: "block" }}>Next</Text>
                <ChevronRightIcon />
              </Flex>
            </Button>
          </Flex>
        </>
      )}

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

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Department</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            Are you sure you want to delete this department?
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>

            <Button
              colorScheme="red"
              onClick={confirmDelete}
              isLoading={departmentStore.isSubmitting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default observer(DepartmentTable);
