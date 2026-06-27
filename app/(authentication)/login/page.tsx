"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Link as ChakraLink,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowLeft, Smartphone } from "lucide-react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDefaultAuthenticatedRoute } from "../../config/utils/roleAccess";
import stores from "../../store/stores";

const DUMMY_OTP = "123456";

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

type LoginStep = "phone" | "otp";

const Login = observer(() => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, openNotification, requestOtp } = stores.auth;
  const requestedRedirect = String(searchParams.get("redirect") || "").trim();
  const wasRegistered = searchParams.get("registered") === "1";
  const redirectTarget =
    requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "";
  const [step, setStep] = useState<LoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    if (wasRegistered) {
      openNotification({
        title: "Account created",
        message: "Sign in with your phone number and OTP to continue.",
        type: "success",
      });
    }
  }, [openNotification, wasRegistered]);

  const normalizedPhone = phone.trim();
  const normalizedOtp = otp.trim();

  const requestLoginOtp = async () => {
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
        purpose: "login",
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
        title: "Unable to send OTP",
        message: error?.message || error?.error || "We could not start the login flow.",
        type: "error",
      });
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleRequestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    await requestLoginOtp();
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
      const response: any = await login({
        phone: normalizedPhone,
        otp: normalizedOtp,
      });

      openNotification({
        title: "Signed in",
        message: response?.message || "Welcome back.",
        type: "success",
        duration: 3000,
      });

      router.replace(
        redirectTarget ||
          getDefaultAuthenticatedRoute(
            stores.auth.user || {
              userType: response?.data?.userType,
              role: response?.data?.role,
            }
          )
      );
    } catch (error: any) {
      openNotification({
        title: "Login failed",
        message: error?.message || error?.error || "Unable to verify that OTP.",
        type: "error",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <VStack spacing={0} align="stretch">
      <Box mb={6}>
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
          Sign in
        </Heading>
        <Text color="gray.500" fontSize="13px">
          {step === "phone"
            ? "Continue with your phone number."
            : `Enter the OTP sent to ${normalizedPhone}.`}
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
      ) : (
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
              onClick={requestLoginOtp}
              isDisabled={requestingOtp}
            >
              Resend OTP
            </Button>
          </VStack>
        </form>
      )}

      <HStack justify="center" spacing={1.5} mt={5}>
        <Text color="gray.500" fontSize="13px">Need an account?</Text>
        <ChakraLink
          as={NextLink}
          href={redirectTarget ? `/register?redirect=${encodeURIComponent(redirectTarget)}` : "/register"}
          color="#D84315"
          fontSize="13px"
          fontWeight="600"
        >
          Create account
        </ChakraLink>
      </HStack>
    </VStack>
  );
});

export default Login;
