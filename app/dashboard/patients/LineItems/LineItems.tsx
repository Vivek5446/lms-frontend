import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  useDisclosure,
  Text,
  ModalFooter,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  SimpleGrid,
  VStack,
  HStack,
  useToast,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { GiPsychicWaves } from "react-icons/gi";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import stores from "../../../store/stores";
import useDebounce from "../../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../../component/config/utils/variable";
import { formatDate } from "../../../component/config/utils/dateUtils";
import { replaceLabelValueObjects } from "../../../config/utils/function";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";
import ViewLineItems from "./component/ViewLineItems";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import FormModel from "../../../component/common/FormModel/FormModel";
import { FiTrash2 } from "react-icons/fi";

const validationSchema = Yup.object().shape({
  lab: Yup.mixed().required("Lab is Required"),
  itemName: Yup.string().required("Item Name is required"),
  quantity: Yup.number().required("Quantity required").positive(),
  price: Yup.number().required("Price required").positive(),
});

const LineItems = observer(({ data }: any) => {
  const {
    labStore: {
      getPatientLabLineItems,
      patientItems,
      createLabItem,
      updateLabItem,
      deleteLabItem,
    },
    auth:{userType}
  } = stores;

  const toast = useToast();

  // Table + drawer states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Add/Edit Modal states
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();
  const [editData, setEditData] = useState<any>(null);

  // Delete confirm states
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef<any>(null);

  // Loader for form submit
  const [formLoading, setFormLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const appGetAllData = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit, lab: data?._id };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      getPatientLabLineItems({ ...query, id: data?._id }).catch((err) => {
        toast({
          title: "Failed to get line items",
          description: err?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
    },
    [debouncedSearchQuery, getPatientLabLineItems, toast, data]
  );

  useEffect(() => {
    appGetAllData({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, appGetAllData]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    appGetAllData({ reset: true });
  };

  const handleRowClick = (labs: any) => {
    setSelectedUser(labs);
    onOpen();
  };

  const TherapistTableColumns = [
    { headerName: "S.No.", key: "sno" },
    {
      headerName: "Lab Name",
      key: "labDetails.name",
      type: "component",
      metaData: {
        component: (dt: any) => <Box>{dt?.labDetails?.name || "-"}</Box>,
      },
    },
    { headerName: "Item Name", key: "itemName" },
    { headerName: "Item Code", key: "itemCode" },
    { headerName: "Quantity", key: "quantity" },
    { headerName: "Price", key: "price" },
    { headerName: "Total", key: "total" },
    {
      headerName: "Patient Name",
      key: "patientDetails.name",
      type: "component",
      metaData: {
        component: (dt: any) => <Box>{dt?.patientDetails?.name || "-"}</Box>,
      },
    },
    {
      headerName: "Created At",
      key: "createdAt",
      type: "component",
      metaData: {
        component: (dt: any) => <Box>{formatDate(dt?.createdAt)}</Box>,
      },
    },
    { headerName: "Actions", key: "table-actions", type: "table-actions" },
  ];

  // Handle Add
  const handleAdd = () => {
    setEditData(null);
    onFormOpen();
  };

  // Handle Edit
  const handleEdit = (row: any) => {
    setEditData({
      ...row,
      patientDetails: {
        label: `${row?.patientDetails?.name}-${row?.patientDetails?.code}`,
        value: row?.patientDetails?._id,
      },
      labDetails: {
        label: `${row?.labDetails?.name}`,
        value: row?.labDetails?._id,
      },
    });
    onFormOpen();
  };

  // Handle Save
  const handleSave = async (formData: any) => {
    try {
      if (editData?._id) {
        setFormLoading(true);
        const values = { ...formData };
        await updateLabItem({
          ...values,
          id: editData?._id,
          ...(replaceLabelValueObjects(values) || {}),
        });

        setEditData(null);
        getPatientLabLineItems({
          page: 1,
          limit: tablePageLimit,
          id: data?._id,
        });
        setFormLoading(false);

        toast({
          title: "Line Item Saved",
          description: `${formData.itemName} has been successfully saved.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        onFormClose();
      } else {
        setFormLoading(true);
        const values = { ...formData };
        await createLabItem({
          ...values,
          ...(replaceLabelValueObjects(values) || {}),
          patientName: data?._id,
        });

        getPatientLabLineItems({
          page: 1,
          limit: tablePageLimit,
          id: data?._id,
        });
        setFormLoading(false);

        toast({
          title: "Line Item Saved",
          description: `${formData.itemName} has been successfully saved.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        onFormClose();
      }
    } catch (err: any) {
      setFormLoading(false);
      toast({
        title: "Failed to save line item",
        description: err?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Delete
  const handleDelete = (row: any) => {
    setDeleteItem(row);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    try {
      setFormLoading(true);
      await deleteLabItem({
        id: deleteItem?._id,
      });

      toast({
        title: "Line Item deleted Successfully",
        description: `${deleteItem.name} has been successfully deleted.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onDeleteClose();
      setDeleteItem(null);
      appGetAllData({ page: currentPage, limit: tablePageLimit });
      setFormLoading(false);

      onFormClose();
    } catch (err: any) {
      setFormLoading(false);
      toast({
        title: "Failed to save line item",
        description: err?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <CustomTable
        title="Line Items"
        data={
          patientItems.data?.map((t: any, index: number) => ({
            ...t,
            sno: index + 1,
          })) || []
        }
        columns={TherapistTableColumns}
        actions={{
          actionBtn: {
            addKey: { showAddButton: false, function: handleAdd },
            editKey: { showEditButton: ['admin','superAdmin'].includes(userType) ? true : false, function: handleEdit },
            viewKey: {
              showViewButton: true,
              function: (e: any) => handleRowClick(e),
            },
            deleteKey: { showDeleteButton: ['admin','superAdmin'].includes(userType) ? true : false, function: handleDelete },
          },
          search: {
            show: true,
            searchValue: searchQuery,
            onSearchChange: (e: any) => setSearchQuery(e.target.value),
          },
          resetData: { show: false, function: resetTableData },
          pagination: {
            show: true,
            onClick: handleChangePage,
            currentPage,
            totalPages: patientItems.TotalPages || 1,
          },
        }}
        loading={patientItems.loading}
      />

      {/* Drawer for viewing details */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent minW={{ md: "60vw", sm: "100vw" }}>
          <DrawerCloseButton />
          <DrawerHeader bg="blue.500" color="white">
            <Flex align="center" gap={3}>
              <GiPsychicWaves size="24px" />
              Line Item Details
            </Flex>
          </DrawerHeader>
          {selectedUser && (
            <DrawerBody>
              <ViewLineItems data={selectedUser} />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>

      {/* Modal for Add/Edit Line Item */}
      <FormModel
        footer={false}
        title={editData ? "Edit Line Item" : "Add Line Item"}
        isOpen={isFormOpen}
        onClose={onFormClose}
        size="lg"
        isCentered
      >
        <Formik
          initialValues={{
            patientName: editData?.patientDetails || "",
            itemName: editData?.itemName || "",
            itemCode: editData?.itemCode || "",
            quantity: editData?.quantity || "",
            price: editData?.price || "",
            total: editData?.total || "",
            lab: editData?.labDetails || "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => handleSave(values)}
        >
          {({ values, setFieldValue, errors }: any) => {
            return (
              <Form>
                <Box mb={6}>
                  <VStack spacing={4} align="stretch">
                    <CustomInput
                      name="lab"
                      label="Lab"
                      value={values.lab}
                      options={editData ? [values?.lab || {}] : []}
                      type="real-time-search"
                      onChange={(e: any) => setFieldValue("lab", e)}
                      error={errors.lab}
                      showError={errors.lab}
                      params={{
                        key: "name",
                        functionName: "getLabs",
                        entityName: "labStore",
                      }}
                    />
                    <HStack spacing={4}>
                      <Box flex="1">
                        <CustomInput
                          name="itemName"
                          label="Item Name"
                          value={values.itemName}
                          onChange={(e: any) =>
                            setFieldValue("itemName", e.target.value)
                          }
                          error={errors.itemName}
                          showError={errors.itemName}
                        />
                      </Box>
                      <Box flex="1">
                        <CustomInput
                          name="itemCode"
                          label="Item Code"
                          value={values.itemCode}
                          onChange={(e: any) =>
                            setFieldValue("itemCode", e.target.value)
                          }
                        />
                      </Box>
                    </HStack>
                  </VStack>
                </Box>

                {/* Pricing */}
                <Box>
                  <SimpleGrid columns={2} spacing={4}>
                    <CustomInput
                      name="quantity"
                      label="Quantity"
                      type="number"
                      value={values.quantity}
                      onChange={(e: any) => {
                        const qty = e.target.value
                          ? parseInt(e.target.value)
                          : "";
                        setFieldValue("quantity", qty);
                        setFieldValue(
                          "total",
                          qty && values.price ? qty * values.price : ""
                        );
                      }}
                      error={errors.quantity}
                      showError={errors.quantity}
                    />
                    <CustomInput
                      name="price"
                      label="Price"
                      type="number"
                      value={values.price}
                      onChange={(e: any) => {
                        const price = e.target.value
                          ? parseFloat(e.target.value)
                          : "";
                        setFieldValue("price", price);
                        setFieldValue(
                          "total",
                          price && values.quantity
                            ? price * values.quantity
                            : ""
                        );
                      }}
                      error={errors.price}
                      showError={errors.price}
                    />
                  </SimpleGrid>

                  {/* Total */}
                  <Box
                    mt={5}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="teal.50"
                    textAlign="center"
                  >
                    <Text fontSize="sm" color="gray.600">
                      Total
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                      {values.total || 0}
                    </Text>
                  </Box>
                </Box>
                <Divider mt={4} />
                <ModalFooter borderTopWidth="1px" py={4} px={6}>
                  <Button onClick={onFormClose} variant="outline" mr={3}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="teal"
                    type="submit"
                    isLoading={formLoading}
                    loadingText="Saving..."
                  >
                    {editData ? "Update" : "Add"}
                  </Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </FormModel>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl" p={2}>
            <AlertDialogHeader>
              <HStack spacing={3} align="center">
                <Box
                  bg="red.100"
                  p={2}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiTrash2} w={5} h={5} color="red.500" />
                </Box>
                <Text fontSize="xl" fontWeight="bold">
                  Delete Line Item
                </Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody fontSize="md" color="gray.600" pt={2}>
              Are you sure you want to delete this line item? <br />
              <Text as="span" fontWeight="semibold" color="red.500">
                This action cannot be undone.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button
                ref={cancelRef}
                onClick={onDeleteClose}
                variant="outline"
                borderRadius="lg"
              >
                Cancel
              </Button>
              <Button
                isLoading={formLoading}
                colorScheme="red"
                borderRadius="lg"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
});

export default LineItems;