"use client";

import {
  Stack,
  Link as ChakraLink,
  Button,
  useColorModeValue,
  Flex,
  Heading,
  Text,
  Box,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import DashPageHeader from "../../component/common/DashPageHeader/DashPageHeader";
import stores from "../../store/stores";
import * as Yup from "yup";
import CustomInput from "../../component/config/component/customInput/CustomInput";
import { authentication } from "../../config/utils/routes";

const ForgotEmailValidation = Yup.object().shape({
  username: Yup.string()
    .email("Invalid email format")
    .required("Username is required"),
});

interface ForgotPasswordFormValues {
  username: string;
}

const ForgotPassword = observer(() => {
  const [showError, setShowError] = useState(false);
  const {
    auth: { openNotification, forgotPasswordStore },
  } = stores;

  const router = useRouter();

  return (
    <>
      <DashPageHeader title="Forgot Password" showMainTitle={false} />
      <Flex
        flexDir="column"
        justifyContent="center"
        alignItems="center"
        minH={{ base: "90vh", md: "80vh" }}
        // px={4}
      >
        <Box
          rounded="lg"
          flexDir="column"
          justifyContent="center"
          bg={useColorModeValue("white", "gray.700")}
          // boxShadow="xl"
          // maxW="md"
          w="full"
        >
          <Stack align="center" mb={8}>
            <Heading
              textAlign="center"
              fontSize="2xl"
              fontWeight="bold"
              color={useColorModeValue("blue.600", "blue.300")}
              mb={2}
            >
              Forgot Your Password?
            </Heading>
            <Text
              fontSize="md"
              textAlign="center"
              color={useColorModeValue("gray.500", "gray.400")}
            >
              {`No worries! Enter your email below, and we'll send you
              instructions to reset your password.`}
            </Text>
          </Stack>

          <Formik<ForgotPasswordFormValues>
            initialValues={{ username: "" }}
            validationSchema={ForgotEmailValidation}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const data = await forgotPasswordStore(values);
                openNotification({
                  title: "Mail Sent Successfully",
                  message: data,
                  type: "success",
                });
                router.push("/");
              } catch (err: any) {
                openNotification({
                  title: "Request Failed",
                  message: err.message,
                  type: "error",
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, handleSubmit, handleChange, isSubmitting, errors }) => (
              <Form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <CustomInput
                    type="text"
                    name="username"
                    label="Email Address"
                    placeholder="Enter your email address"
                    required
                    value={values.username}
                    onChange={handleChange}
                    error={errors.username}
                    showError={showError}
                  />
                  <Stack spacing={6}>
                    <Flex
                      justifyContent="space-between"
                      align="center"
                      fontSize="sm"
                    >
                      <Text color="gray.600" mr={1}>
                        Remembered your password?
                      </Text>
                      <ChakraLink
                        color="blue.400"
                        fontWeight="medium"
                        onClick={() => router.push(authentication.login)}
                        cursor="pointer"
                      >
                        Sign in
                      </ChakraLink>
                    </Flex>
                    <Button
                      type="submit"
                      bg="blue.500"
                      color="white"
                      _hover={{
                        bg: "blue.600",
                      }}
                      isLoading={isSubmitting}
                      onClick={() => setShowError(true)}
                      w="full"
                      py={6}
                      fontSize="lg"
                    >
                      Send Reset Link
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            )}
          </Formik>
        </Box>
      </Flex>
    </>
  );
});

export default ForgotPassword;
