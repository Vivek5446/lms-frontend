"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import AuthenticationLayout from "../../layouts/authenticationLayout/AuthenticationLayout";
import stores from "../../store/stores";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { userStore } = stores;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = searchParams.get("token") || "";

  const handleSubmit = async () => {
    if (!token) {
      toast({
        title: "Invalid link",
        description: "This password setup link is missing its token.",
        status: "error",
        duration: 3500,
      });
      return;
    }

    if (!password || password.length < 8) {
      toast({
        title: "Weak password",
        description: "Use at least 8 characters for the new password.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please enter the same password in both fields.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await userStore.setPassword({ token, password });
      toast({
        title: "Password set",
        description: "Your account is ready. You can log in now.",
        status: "success",
        duration: 3500,
      });
      router.push("/login");
    } catch (err: any) {
      toast({
        title: "Unable to set password",
        description: err?.error || err?.message || "This setup link may have expired.",
        status: "error",
        duration: 4000,
      });
    }
  };

  return (
    <AuthenticationLayout>
      <Box maxW="420px" w="100%">
        <Heading size="lg" mb={3}>
          Set Your Password
        </Heading>
        <Text color="gray.500" mb={8}>
          Create a password to activate your LMS account. If your managers are already assigned, your account will become active right away.
        </Text>

        <VStack spacing={5} align="stretch">
          <FormControl isRequired>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              size="lg"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              size="lg"
            />
          </FormControl>

          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleSubmit}
            isLoading={userStore.submitting}
          >
            Save Password
          </Button>
        </VStack>
      </Box>
    </AuthenticationLayout>
  );
}
