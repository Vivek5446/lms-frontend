"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link as ChakraLink,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowLeft, BadgeCheck, Eye, EyeOff, Mail, Smartphone } from "lucide-react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getDefaultAuthenticatedRoute } from "../../config/utils/roleAccess";
import stores from "../../store/stores";
import type { GlobalLoginPayload } from "../../store/authStore/authStore";

type LoginMode = GlobalLoginPayload["loginType"];

const loginModes: Array<{
  value: LoginMode;
  label: string;
  icon: typeof Mail;
}> = [
  { value: "phone", label: "Phone", icon: Smartphone },
  { value: "email", label: "Email", icon: Mail },
  { value: "code", label: "User code", icon: BadgeCheck },
];

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

function getIdentifierMeta(loginType: LoginMode) {
  if (loginType === "phone") {
    return {
      label: "Phone number",
      placeholder: "9876543210",
      inputMode: "tel" as const,
      autoComplete: "tel",
    };
  }

  if (loginType === "code") {
    return {
      label: "User code",
      placeholder: "Enter your user code",
      inputMode: "text" as const,
      autoComplete: "username",
    };
  }

  return {
    label: "Email",
    placeholder: "you@example.com",
    inputMode: "email" as const,
    autoComplete: "email",
  };
}

const Login = observer(() => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, openNotification } = stores.auth;
  const [formData, setFormData] = useState<GlobalLoginPayload>({
    username: "",
    password: "",
    loginType: "phone",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const identifierMeta = getIdentifierMeta(formData.loginType);
  const requestedRedirect = String(searchParams.get("redirect") || "").trim();
  const redirectTarget =
    requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "";

  const setLoginMode = (loginType: LoginMode) => {
    setFormData((current) => ({ ...current, loginType, username: "" }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const username = formData.username.trim();

    if (formData.loginType === "email" && !/^\S+@\S+\.\S+$/.test(username)) {
      openNotification({ title: "Check your email", message: "Enter a valid email address.", type: "error" });
      return;
    }

    if (formData.loginType === "phone" && !/^\d{10}$/.test(username)) {
      openNotification({
        title: "Check your phone number",
        message: "Enter a valid 10-digit phone number.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response: any = await login({ ...formData, username });

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
        message: error?.message || error?.error || "Invalid credentials.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
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
          Continue to your learning workspace.
        </Text>
      </Box>

      <form onSubmit={handleSubmit} noValidate>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel {...labelStyles}>Sign in with</FormLabel>
            <Flex bg="gray.100" borderRadius="8px" p="4px" gap="4px">
              {loginModes.map((mode) => {
                const ModeIcon = mode.icon;
                const selected = formData.loginType === mode.value;

                return (
                  <Button
                    key={mode.value}
                    type="button"
                    flex="1"
                    minW={0}
                    h="36px"
                    px={2}
                    borderRadius="6px"
                    bg={selected ? "white" : "transparent"}
                    color={selected ? "#D84315" : "gray.500"}
                    boxShadow={selected ? "sm" : "none"}
                    fontSize="12px"
                    fontWeight={selected ? "600" : "500"}
                    leftIcon={<ModeIcon size={14} />}
                    onClick={() => setLoginMode(mode.value)}
                    _hover={{ bg: selected ? "white" : "gray.200" }}
                    aria-pressed={selected}
                  >
                    {mode.label}
                  </Button>
                );
              })}
            </Flex>
          </FormControl>

          <FormControl isRequired>
            <FormLabel {...labelStyles}>{identifierMeta.label}</FormLabel>
            <Input
              name="username"
              type={formData.loginType === "email" ? "email" : "text"}
              inputMode={identifierMeta.inputMode}
              autoComplete={identifierMeta.autoComplete}
              placeholder={identifierMeta.placeholder}
              maxLength={formData.loginType === "phone" ? 10 : undefined}
              value={formData.username}
              onChange={(event) => setFormData((current) => ({ ...current, username: event.target.value }))}
              {...inputStyles}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel {...labelStyles}>Password</FormLabel>
            <InputGroup>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                pr="44px"
                {...inputStyles}
              />
              <InputRightElement h="44px">
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  onClick={() => setShowPassword((current) => !current)}
                  size="sm"
                  variant="ghost"
                  color="gray.500"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Flex justify="flex-end" mt={-1}>
            <ChakraLink
              as={NextLink}
              href="/forgot-password"
              color="#D84315"
              fontSize="13px"
              fontWeight="500"
              _hover={{ textDecoration: "underline" }}
            >
              Forgot password?
            </ChakraLink>
          </Flex>

          <Button
            type="submit"
            h="44px"
            borderRadius="8px"
            bg="#D84315"
            color="white"
            fontSize="sm"
            fontWeight="600"
            isDisabled={!formData.username.trim() || !formData.password || isLoading}
            _hover={{ bg: "#BF360C" }}
            _active={{ bg: "#BF360C", transform: "scale(0.99)" }}
          >
            {isLoading ? <Spinner size="sm" /> : "Sign in"}
          </Button>
        </VStack>
      </form>

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
