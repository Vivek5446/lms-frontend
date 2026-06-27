"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link as ChakraLink,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { ArrowLeft, Building2, Smartphone, UserPlus } from "lucide-react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import * as Yup from "yup";
import { getDefaultAuthenticatedRoute } from "../../config/utils/roleAccess";
import stores from "../../store/stores";

const DUMMY_OTP = "123456";

type AccountType = "learner" | "admin";
type RegisterStep = "phone" | "otp" | "details";

type SignupValues = {
  accountType: AccountType;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companyEmail: string;
  termsAccepted: boolean;
};

const inputStyles = {
  bg: "white",
  border: "1px solid",
  borderColor: "gray.200",
  borderRadius: "8px",
  color: "gray.700",
  fontSize: "sm",
  h: "44px",
  _placeholder: { color: "gray.400", fontSize: "13px" },
  _focus: {
    borderColor: "#D84315",
    boxShadow: "0 0 0 2px rgba(216,67,21,0.1)",
  },
  _hover: { borderColor: "gray.300" },
};

const labelStyles = {
  color: "gray.700",
  fontSize: "13px",
  fontWeight: "500",
  mb: 1,
};

const Register = observer(() => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<RegisterStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const { registerAdmin, registerLearner, openNotification, requestOtp, verifyOtp } = stores.auth;
  const requestedRedirect = String(searchParams.get("redirect") || "").trim();
  const redirectTarget =
    requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "";

  const normalizedPhone = phone.trim();
  const normalizedOtp = otp.trim();

  const initialValues = useMemo<SignupValues>(
    () => ({
      accountType: "learner",
      name: "",
      email: "",
      phone: normalizedPhone,
      companyName: "",
      companyEmail: "",
      termsAccepted: false,
    }),
    [normalizedPhone]
  );

  const validationSchema = useMemo(
    () =>
      Yup.object({
        accountType: Yup.mixed<AccountType>().oneOf(["learner", "admin"]).required(),
        name: Yup.string()
          .trim()
          .min(2, "Enter your full name")
          .max(80, "Name is too long")
          .required("Full name is required"),
        email: Yup.string().trim().lowercase().email("Enter a valid email address"),
        phone: Yup.string()
          .trim()
          .matches(/^\d{10}$/, {
            message: "Enter a valid 10-digit phone number",
          })
          .required("Phone number is required"),
        companyName: Yup.string().when("accountType", {
          is: "admin",
          then: (schema) =>
            schema
              .trim()
              .min(2, "Enter your company name")
              .max(120, "Company name is too long")
              .required("Company name is required"),
          otherwise: (schema) => schema.trim(),
        }),
        companyEmail: Yup.string().when("accountType", {
          is: "admin",
          then: (schema) => schema.trim().lowercase().email("Enter a valid company email address"),
          otherwise: (schema) => schema.trim(),
        }),
        termsAccepted: Yup.boolean().oneOf([true], "Accept the terms to continue"),
      }),
    []
  );

  const requestRegistrationOtp = async () => {
    if (!/^\d{10}$/.test(normalizedPhone)) {
      openNotification({
        title: "Check your phone number",
        message: "Enter a valid 10-digit phone number.",
        type: "error",
      });
      return;
    }
    setRequestingOtp(true);
    try {
      await requestOtp({
        phone: normalizedPhone,
        purpose: "register",
      });

      setOtp("");
      setStep("otp");
      openNotification({
        title: "OTP sent",
        message: `Use ${DUMMY_OTP} while the dummy flow is enabled.`,
        type: "success",
      });
    } catch (error: any) {
      openNotification({
        title: "Unable to continue",
        message: error?.message || error?.error || "We could not start registration.",
        type: "error",
      });
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleRequestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    await requestRegistrationOtp();
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      openNotification({
        title: "Check your OTP",
        message: "Enter the 6-digit OTP.",
        type: "error",
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      const response: any = await verifyOtp({
        phone: normalizedPhone,
        otp: normalizedOtp,
        purpose: "register",
      });

      setVerificationToken(response?.data?.verificationToken || response?.verificationToken || "");
      setStep("details");
      openNotification({
        title: "Phone verified",
        message: "Finish the rest of your account details.",
        type: "success",
      });
    } catch (error: any) {
      openNotification({
        title: "Verification failed",
        message: error?.message || error?.error || "Unable to verify that OTP.",
        type: "error",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (values: SignupValues) => {
    try {
      const response: any =
        values.accountType === "admin"
          ? await registerAdmin({
              name: values.name.trim(),
              phone: normalizedPhone,
              email: values.email.trim().toLowerCase() || undefined,
              verificationToken,
              companyName: values.companyName.trim(),
              companyEmail: values.companyEmail.trim().toLowerCase() || undefined,
            })
          : await registerLearner({
              name: values.name.trim(),
              phone: normalizedPhone,
              email: values.email.trim().toLowerCase() || undefined,
              verificationToken,
            });

      const authenticatedRoute = getDefaultAuthenticatedRoute(
        stores.auth.user || {
          userType: response?.data?.userType,
          role: response?.data?.role,
        }
      );

      openNotification({
        title: values.accountType === "admin" ? "Admin account created" : "Account created",
        message:
          response?.message ||
          (values.accountType === "admin"
            ? "Your admin workspace is ready."
            : "Your learner account is ready."),
        type: "success",
        duration: 4000,
      });

      router.replace(redirectTarget || authenticatedRoute);
    } catch (error: any) {
      openNotification({
        title: "Signup failed",
        message: error?.message || error?.error || "Unable to create your account.",
        type: "error",
      });
    }
  };

  return (
    <VStack spacing={0} align="stretch">
      <Box mb={5}>
        <ChakraLink
          as={NextLink}
          href="/"
          display="inline-flex"
          alignItems="center"
          gap={1.5}
          color="gray.500"
          fontSize="13px"
          fontWeight="500"
          _hover={{ color: "#D84315", textDecoration: "none" }}
        >
          <ArrowLeft size={15} />
          Back to home
        </ChakraLink>
      </Box>

      <Box mb={5}>
        <Heading color="gray.800" fontSize="2xl" fontWeight="600" mb={1}>
          Create your account
        </Heading>
        <Text color="gray.500" fontSize="13px">
          {step === "phone"
            ? "Start with your phone number."
            : step === "otp"
              ? `Verify ${normalizedPhone} to continue.`
              : "Finish your account setup."}
        </Text>
      </Box>

      {step === "phone" ? (
        <form onSubmit={handleRequestOtp} noValidate>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel {...labelStyles}>Phone number</FormLabel>
              <Input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="9876543210"
                maxLength={10}
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
                {...inputStyles}
              />
            </FormControl>

            <Button
              type="submit"
              h="44px"
              borderRadius="8px"
              bg="#D84315"
              color="white"
              fontSize="sm"
              fontWeight="600"
              leftIcon={requestingOtp ? undefined : <Smartphone size={16} />}
              isDisabled={!normalizedPhone || requestingOtp}
              _hover={{ bg: "#BF360C" }}
              _active={{ bg: "#BF360C", transform: "scale(0.99)" }}
            >
              {requestingOtp ? <Spinner size="sm" /> : "Send OTP"}
            </Button>
          </VStack>
        </form>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={handleVerifyOtp} noValidate>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel {...labelStyles}>OTP</FormLabel>
              <Input
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                letterSpacing="0.3em"
                textAlign="center"
                {...inputStyles}
              />
            </FormControl>

            <HStack spacing={3}>
              <Button
                type="button"
                variant="outline"
                borderRadius="8px"
                h="44px"
                flex="1"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                }}
              >
                Change phone
              </Button>
              <Button
                type="submit"
                h="44px"
                borderRadius="8px"
                bg="#D84315"
                color="white"
                fontSize="sm"
                fontWeight="600"
                flex="1"
                isDisabled={!normalizedOtp || verifyingOtp}
                _hover={{ bg: "#BF360C" }}
                _active={{ bg: "#BF360C", transform: "scale(0.99)" }}
              >
                {verifyingOtp ? <Spinner size="sm" /> : "Verify OTP"}
              </Button>
            </HStack>

            <Button
              type="button"
              variant="ghost"
              color="#D84315"
              fontSize="sm"
              onClick={requestRegistrationOtp}
              isDisabled={requestingOtp}
            >
              Resend OTP
            </Button>
          </VStack>
        </form>
      ) : null}

      {step === "details" ? (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, handleBlur, handleChange, isSubmitting, setFieldValue, touched, values }) => (
            <Form noValidate>
              <VStack spacing={3.5} align="stretch">

                <FormControl>
                  <FormLabel {...labelStyles}>Account type</FormLabel>
                  <Flex bg="gray.100" borderRadius="8px" p="4px" gap="4px">
                    {[
                      { value: "learner", label: "Learner", icon: UserPlus },
                      { value: "admin", label: "Admin", icon: Building2 },
                    ].map((option) => {
                      const selected = values.accountType === option.value;
                      const Icon = option.icon;

                      return (
                        <Button
                          key={option.value}
                          type="button"
                          flex="1"
                          h="42px"
                          borderRadius="6px"
                          bg={selected ? "white" : "transparent"}
                          color={selected ? "#D84315" : "gray.600"}
                          boxShadow={selected ? "sm" : "none"}
                          fontSize="sm"
                          fontWeight="600"
                          leftIcon={<Icon size={16} />}
                          onClick={() => setFieldValue("accountType", option.value)}
                          _hover={{ bg: selected ? "white" : "gray.200" }}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </Flex>
                  <HStack spacing={2} mt={2}>
                    <Badge colorScheme={values.accountType === "admin" ? "orange" : "green"} borderRadius="full" px={2.5} py={1}>
                      {values.accountType === "admin" ? "Company setup" : "Personal signup"}
                    </Badge>
                    <Text color="gray.500" fontSize="12px">
                      {values.accountType === "admin"
                        ? "This creates the first admin account for your company."
                        : "Use one learner account across the courses you join."}
                    </Text>
                  </HStack>
                </FormControl>

                <FormControl isInvalid={Boolean(touched.name && errors.name)}>
                  <FormLabel {...labelStyles}>Full name</FormLabel>
                  <Input
                    name="name"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    {...inputStyles}
                  />
                  <FormErrorMessage fontSize="xs">{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyles}>Phone number</FormLabel>
                  <Input name="phone" value={values.phone} isReadOnly {...inputStyles} />
                </FormControl>

                <FormControl isInvalid={Boolean(touched.email && errors.email)}>
                  <FormLabel {...labelStyles}>
                    Email <Text as="span" color="gray.400" fontWeight="400">(optional)</Text>
                  </FormLabel>
                  <Input
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    {...inputStyles}
                  />
                  <FormErrorMessage fontSize="xs">{errors.email}</FormErrorMessage>
                </FormControl>

                {values.accountType === "admin" ? (
                  <>
                    <FormControl isInvalid={Boolean(touched.companyName && errors.companyName)}>
                      <FormLabel {...labelStyles}>Company name</FormLabel>
                      <Input
                        name="companyName"
                        autoComplete="organization"
                        placeholder="Enter your company name"
                        value={values.companyName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        {...inputStyles}
                      />
                      <FormErrorMessage fontSize="xs">{errors.companyName}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={Boolean(touched.companyEmail && errors.companyEmail)}>
                      <FormLabel {...labelStyles}>
                        Company email <Text as="span" color="gray.400" fontWeight="400">(optional)</Text>
                      </FormLabel>
                      <Input
                        name="companyEmail"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="team@company.com"
                        value={values.companyEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        {...inputStyles}
                      />
                      <FormErrorMessage fontSize="xs">{errors.companyEmail}</FormErrorMessage>
                    </FormControl>
                  </>
                ) : null}

                <FormControl isInvalid={Boolean(touched.termsAccepted && errors.termsAccepted)}>
                  <Checkbox
                    name="termsAccepted"
                    isChecked={values.termsAccepted}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    colorScheme="orange"
                    alignItems="flex-start"
                  >
                    <Text color="gray.600" fontSize="12px" lineHeight="18px">
                      I agree to the <Text as="span" color="#D84315" fontWeight="600">terms and conditions</Text>
                    </Text>
                  </Checkbox>
                  <FormErrorMessage fontSize="xs">{errors.termsAccepted}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  h="44px"
                  borderRadius="8px"
                  bg="#D84315"
                  color="white"
                  fontSize="sm"
                  fontWeight="600"
                  leftIcon={isSubmitting ? undefined : <UserPlus size={17} />}
                  isDisabled={isSubmitting || !verificationToken}
                  _hover={{ bg: "#BF360C" }}
                  _active={{ bg: "#BF360C", transform: "scale(0.99)" }}
                >
                  {isSubmitting ? <Spinner size="sm" /> : values.accountType === "admin" ? "Create admin account" : "Create account"}
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      ) : null}

      <HStack justify="center" spacing={1.5} mt={5}>
        <Text color="gray.500" fontSize="13px">Already have an account?</Text>
        <ChakraLink
          as={NextLink}
          href={redirectTarget ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : "/login"}
          color="#D84315"
          fontSize="13px"
          fontWeight="600"
        >
          Sign in
        </ChakraLink>
      </HStack>
    </VStack>
  );
});

export default Register;
