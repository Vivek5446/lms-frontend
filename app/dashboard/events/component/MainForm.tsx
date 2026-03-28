'use client';
import {  Button, Flex, VStack, Card, SimpleGrid, Box } from "@chakra-ui/react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Form, Formik } from "formik";
import { useState } from "react";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import testimonialValidation from "../utils/validation";
import { removeDataByIndex } from "../../../config/utils/utils";
import ShowFileUploadFile from "../../../component/common/ShowFileUploadFile/ShowFileUploadFile";

const MainForm = ({ initialValues, onSubmit, close, isEdit } : any) => {
  const [showError, setShowError] = useState(false);

  return (
    <Card p={8} borderRadius={10} bg="white" boxShadow="lg">
      <Formik
        initialValues={initialValues}
        validationSchema={testimonialValidation}
        onSubmit={(values, actions) => {
          onSubmit({ ...values }, actions);
        }}
      >
        {({ handleChange, values, errors, isSubmitting, setFieldValue } : any) => (
          <Form>
            <VStack spacing={4} align="center">
              {/* Image Upload Section */}
              <Box width="100%">
                  {values?.image?.file?.length === 0 ? (
                    <CustomInput
                      type="file-drag"
                      name="image"
                      value={values.image}
                      isMulti={true}
                      accept="image/*"
                      onChange={(e: any) => {
                        setFieldValue("image", {
                          ...values.image,
                          file: e.target.files[0],
                          isAdd: 1,
                        });
                      }}
                      showError={showError}
                      error={errors.image}
                    />
                  ) : (
                    <Box mt={-5} width="100%">
                      <ShowFileUploadFile
                        files={values.image?.file}
                        removeFile={() => {
                          setFieldValue("image", {
                            ...values.image,
                            file: removeDataByIndex(values.image, 0),
                            isDeleted: 1,
                          });
                        }}
                        edit={isEdit}
                      />
                    </Box>
                  )}
                </Box>

              {/* Form Fields */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                <CustomInput
                  name="title"
                  placeholder="Enter the Title"
                  label="Title"
                  onChange={handleChange}
                  value={values.title}
                  error={errors.title}
                  showError={showError}
                />
                <CustomInput
                  name="price"
                  placeholder="Enter the price"
                  label="Price"
                  onChange={handleChange}
                  value={values.price}
                  error={errors.price}
                  showError={showError}
                />
                <CustomInput
                  name="category"
                  placeholder="Enter the category"
                  label="Category"
                  onChange={handleChange}
                  value={values.category}
                  error={errors.category}
                  showError={showError}
                />
                <CustomInput
                  name="target"
                  placeholder="Enter the target"
                  label="Target"
                  onChange={handleChange}
                  value={values.target}
                  error={errors.target}
                  showError={showError}
                />
                <CustomInput
                  name="eventDate"
                  placeholder="Enter the Event Date"
                  label="Event Date"
                  type = "dateAndTime"
                  onChange={(e : any) => setFieldValue('eventDate',e.target?.value)}
                  value={values.eventDate}
                  error={errors.eventDate}
                  showError={showError}
                />
              </SimpleGrid>

              {/* Description Field */}
              <CustomInput
                name="description"
                placeholder="Description"
                label="Description"
                type="textarea"
                error={errors.description}
                onChange={handleChange}
                value={values.description}
                rows={4}
                showError={showError}
              />

<CustomInput
                name="trigger"
                placeholder="Action"
                label="Action"
                error={errors.trigger}
                onChange={handleChange}
                value={values.trigger}
                rows={4}
                showError={showError}
              />

              {/* Action Buttons */}
              <Flex justifyContent="end" w="full" mt={4}>
                <Button leftIcon={<FaTimes />} mr={3} onClick={close} variant="outline" colorScheme="red">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftIcon={<FaCheck />}
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  onClick={() => setShowError(true)}
                >
                  Save
                </Button>
              </Flex>
            </VStack>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default MainForm;