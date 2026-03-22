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
} from "@chakra-ui/react";
import { GiPsychicWaves } from "react-icons/gi";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import stores from "../../../../store/stores";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { formatDate } from "../../../../component/config/utils/dateUtils";
import ViewLineItems from "./component/ViewLineItems";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import FormModel from "../../../../component/common/FormModel/FormModel";
import { replaceLabelValueObjects } from "../../../../config/utils/function";

const validationSchema = Yup.object().shape({
  patientName: Yup.mixed().required("Patient Name is required"),
  itemName: Yup.string().required("Item Name is required"),
  quantity: Yup.number().required("Quantity required").positive(),
  price: Yup.number().required("Price required").positive(),
});

const LineItems = observer(({ data }: any) => {
  const {
    labStore: {
      getLabLineItems,
      lineItems,
      createLabItem,
      updateLabItem,
      deleteLabItem,
    },
    auth:{
      userType
    }
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

  const applyGetAllTherapists = useCallback(
  ({ page = 1, limit = tablePageLimit, reset = false }) => {
    const query: any = { page, limit };

    if (debouncedSearchQuery?.trim()) {
      query.search = debouncedSearchQuery.trim();
    }

    if (reset) {
      query.page = 1;
      query.limit = tablePageLimit;
    }

    // 👇 condition: pass patientId OR lab
    if (data?.isPatient) {
      query.patientId = data?.patientData?._id;
    } else {
      query.lab = data?._id;
    }

    getLabLineItems(query).catch((err) => {
      toast({
        title: "Failed to get line items",
        description: err?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    });
  },
  [debouncedSearchQuery, getLabLineItems, toast, data]
);


  useEffect(() => {
    applyGetAllTherapists({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, applyGetAllTherapists]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllTherapists({ reset: true });
  };

  const handleRowClick = (labs: any) => {
    setSelectedUser(labs);
    onOpen();
  };

  const TherapistTableColumns = [
    { headerName: "S.No.", key: "sno" },
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
          lab: data?._id,
          id: editData?._id,
          ...(replaceLabelValueObjects(values) || {}),
        });

        setEditData(null);
        getLabLineItems({ page: 1, limit: tablePageLimit, lab: data?._id });
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
          lab: data?._id,
          ...(replaceLabelValueObjects(values) || {}),
        });

        getLabLineItems({ page: 1, limit: tablePageLimit, lab: data?._id });
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
      applyGetAllTherapists({ page: currentPage, limit: tablePageLimit });
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
          lineItems.data?.map((t: any, index: number) => ({
            ...t,
            sno: index + 1,
          })) || []
        }
        columns={TherapistTableColumns}
        actions={{
          actionBtn: {
            addKey: { showAddButton: ['admin','superAdmin'].includes(userType) ? true : false, function: handleAdd },
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
            totalPages: lineItems.TotalPages || 1,
          },
        }}
        loading={lineItems.loading}
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
                      name="patientName"
                      label="Patient Name"
                      value={values.patientName}
                      options={editData ? [values?.patientName || {}] : []}
                      type="real-time-user-search"
                      onChange={(e: any) => setFieldValue("patientName", e)}
                      error={errors.patientName}
                      showError={errors.patientName}
                      query={{ userType: "patient" }}
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
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Line Item
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this line item? This action cannot
              be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                isLoading={formLoading}
                colorScheme="red"
                ml={3}
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