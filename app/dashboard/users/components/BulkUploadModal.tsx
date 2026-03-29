"use client";

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";

const COLORS = ["blue", "purple", "orange", "green", "pink", "cyan"];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  bulkForm: any;
  setBulkForm: any;
  isSuperadmin: boolean;
  managedCompanies: any[];
  filteredCompanies: any[];
  borderColor: string;
  tableHeadBg: string;
  muted: string;

  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;

  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;

  preview: any[];
  loading: boolean;

  onUpload: () => void;
};

const BulkUploadModal = ({
  isOpen,
  onClose,
  bulkForm,
  setBulkForm,
  isSuperadmin,
  filteredCompanies,
  borderColor,
  tableHeadBg,
  muted,
  getRootProps,
  getInputProps,
  isDragActive,
  selectedFile,
  setSelectedFile,
  preview,
  loading,
  onUpload,
}: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay backdropFilter="blur(6px)" />

      <ModalContent borderRadius="2xl">
        <ModalHeader>Bulk Upload Users</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack align="stretch" spacing={5}>
            
            {/* ================= COMPANY ================= */}
            {isSuperadmin && (
              <Box borderWidth="1px" borderColor={borderColor} p={4} borderRadius="xl">
                <VStack align="stretch" spacing={4}>
                  <Checkbox
                    isChecked={bulkForm.createCompany}
                    onChange={(e) =>
                      setBulkForm((p: any) => ({
                        ...p,
                        createCompany: e.target.checked,
                        companyId: "",
                      }))
                    }
                  >
                    Create company for upload
                  </Checkbox>

                  {bulkForm.createCompany ? (
                    <Flex gap={4}>
                      <FormControl isRequired>
                        <FormLabel>Company Name</FormLabel>
                        <Input
                          value={bulkForm.companyName}
                          onChange={(e) =>
                            setBulkForm((p: any) => ({
                              ...p,
                              companyName: e.target.value,
                            }))
                          }
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Manager Levels</FormLabel>
                        <Input
                          type="number"
                          min={1}
                          value={bulkForm.companyManagerLevels}
                          onChange={(e) =>
                            setBulkForm((p: any) => ({
                              ...p,
                              companyManagerLevels:
                                Number(e.target.value) || 1,
                            }))
                          }
                        />
                      </FormControl>
                    </Flex>
                  ) : (
                    <FormControl isRequired>
                      <FormLabel>Select Company</FormLabel>
                      <Select
                        placeholder="Choose company"
                        value={bulkForm.companyId}
                        onChange={(e) =>
                          setBulkForm((p: any) => ({
                            ...p,
                            companyId: e.target.value,
                          }))
                        }
                      >
                        {filteredCompanies.map((c: any) => (
                          <option key={c._id} value={c._id}>
                            {c.company_name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </VStack>
              </Box>
            )}

            {/* ================= DROPZONE ================= */}
            <Box
              {...getRootProps()}
              borderWidth="2px"
              borderStyle="dashed"
              borderColor={isDragActive ? "blue.400" : borderColor}
              borderRadius="2xl"
              p={8}
              textAlign="center"
              cursor="pointer"
              bg={isDragActive ? "blue.50" : "transparent"}
            >
              <input {...getInputProps()} />

              <Text fontWeight="bold">
                Drag & drop Excel file here
              </Text>

              <Text fontSize="sm" color={muted} mt={2}>
                Upload `.xlsx` / `.xls` with columns like Employee Code, Employee Name, Email ID, Branch, City, State, Designation and manager email fields.
              </Text>

              {selectedFile && (
                <Text mt={3} color="blue.500" fontSize="sm">
                  {selectedFile.name}
                </Text>
              )}
            </Box>

            {/* ================= PREVIEW ================= */}
            <Box>
              <Text fontWeight="bold" mb={3}>
                Preview
              </Text>

              <TableContainer
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                maxH="400px"
                overflowY="auto"
              >
                <Table size="sm">
                  <Thead bg={tableHeadBg}>
                    <Tr>
                      <Th>Row</Th>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Branch</Th>
                      <Th>City</Th>
                      <Th>State</Th>
                      <Th>Role</Th>
                      <Th>Company</Th>
                      <Th>Managers</Th>
                      <Th>Action</Th>
                      <Th>Errors</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {loading ? (
                      <Tr>
                        <Td colSpan={11} textAlign="center" py={6}>
                          Loading preview...
                        </Td>
                      </Tr>
                    ) : preview.length === 0 ? (
                      <Tr>
                        <Td colSpan={11} textAlign="center" py={6}>
                          No preview data
                        </Td>
                      </Tr>
                    ) : (
                      preview.map((row: any) => (
                        <Tr key={row.rowNumber}>
                          <Td>{row.rowNumber}</Td>
                          <Td>{row.name}</Td>
                          <Td>{row.email}</Td>
                          <Td>{row.branch || "--"}</Td>
                          <Td>{row.city || "--"}</Td>
                          <Td>{row.state || "--"}</Td>
                          <Td>{row.role}</Td>

                          <Td>
                            <Badge
                              colorScheme={
                                row.companyStatus === "EXISTS"
                                  ? "green"
                                  : "purple"
                              }
                            >
                              {row.company}
                            </Badge>
                          </Td>

                          <Td>
                            <VStack align="start">
                              {(row.managers || []).map((m: any) => (
                                <Text key={m.level} fontSize="sm">
                                  L{m.level}: {m.managerEmail}
                                </Text>
                              ))}
                            </VStack>
                          </Td>

                          <Td>
                            <Badge
                              colorScheme={
                                row.action === "CREATE" ? "blue" : "red"
                              }
                            >
                              {row.action}
                            </Badge>
                          </Td>

                          <Td>
                            {row.errors?.length > 0 ? (
                              <Text color="red.500" fontSize="sm">
                                {row.errors.join(", ")}
                              </Text>
                            ) : (
                              <Text fontSize="sm" color={muted}>
                                No errors
                              </Text>
                            )}
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              setSelectedFile(null);
            }}
          >
            Cancel
          </Button>

          <Button
            colorScheme="purple"
            onClick={onUpload}
            isLoading={loading}
          >
            Upload Users
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkUploadModal;
