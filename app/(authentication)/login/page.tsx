"use client";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Spinner,
  VStack,
  Divider,
  useBreakpointValue,
  Select,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import CustomButton from "../../component/common/CustomButton/CustomButton";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";

const Login = observer(() => {
  const {
    auth: { login, openNotification },
  } = stores;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    loginType: "email", // username | email | code
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const headingSize = useBreakpointValue({ base: "lg", md: "xl" });
  const cardPadding = useBreakpointValue({ base: 2, md: 3 });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response: any = await login(formData);

      openNotification({
        title: "Login Successful",
        message: `${response.message}!`,
        type: "success",
        duration: 3000,
      });

      if (response?.data?.userType === "superAdmin") {
        router.push("/dashboard/admins");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      openNotification({
        title: "Login Failed",
        message: error.response?.message || "Invalid credentials",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" minH={{ base: "90vh", md: "80vh" }}>
      <Box w="100%" p={cardPadding} borderRadius="xl" animation="fadeIn 0.4s ease">
        <VStack spacing={6} align="stretch">
          {/* Heading */}
          <Box textAlign="center">
            <Heading size={headingSize} mb={2} color="teal.700">
              Welcome Back
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Log in to continue
            </Text>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              {/* LOGIN TYPE + USERNAME */}
              <FormControl id="username">
                <FormLabel fontSize="sm" fontWeight="500">
                  Login Using
                </FormLabel>

                <Select
                  name="loginType"
                  value={formData.loginType}
                  onChange={handleInputChange}
                  size="lg"
                  mb={2}
                >
                  <option value="email">Email</option>
                  <option value="code">User Code</option>
                </Select>

                <Input
                  type="text"
                  name="username"
                  placeholder={
                    formData.loginType === "email"
                      ? "Enter your email"
                      : formData.loginType === "code"
                      ? "Enter your user code"
                      : "Enter your username"
                  }
                  value={formData.username}
                  onChange={handleInputChange}
                  focusBorderColor="teal.500"
                  size="lg"
                  required
                />
              </FormControl>

              {/* Password */}
              <FormControl id="password">
                <FormLabel fontSize="sm" fontWeight="500">
                  Password
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    focusBorderColor="teal.500"
                    size="lg"
                    required
                  />
                  <InputRightElement
                    mt={1}
                    cursor="pointer"
                    onClick={handleTogglePassword}
                  >
                    {showPassword ? (
                      <RiEyeOffLine size={20} />
                    ) : (
                      <RiEyeLine size={20} />
                    )}
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Flex justify="space-between" align="center" fontSize="sm">
                <Checkbox colorScheme="teal" size="sm">
                  Remember me
                </Checkbox>
                <Link href="/forgot-password">
                  <Text
                    color="teal.600"
                    fontWeight="500"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Forgot password?
                  </Text>
                </Link>
              </Flex>

              {/* Sign in button */}
              <CustomButton
                size="lg"
                width="100%"
                type="submit"
                mt={2}
                borderRadius="full"
                isDisabled={
                  !formData.username || !formData.password || isLoading
                }
              >
                {isLoading ? (
                  <Spinner size="sm" color="white" />
                ) : (
                  "Sign in"
                )}
              </CustomButton>

              {/* OR divider */}
              <Flex align="center" gap={2}>
                <Divider />
                <Text fontSize="xs" color="gray.500">
                  OR
                </Text>
                <Divider />
              </Flex>

              {/* Google login */}
              <Button
                size="lg"
                width="100%"
                leftIcon={<FcGoogle size="22px" />}
                fontSize="sm"
                fontWeight="500"
                bg="white"
                color="gray.700"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="full"
                _hover={{ bg: "gray.50" }}
              >
                Sign in with Google
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Flex>
  );
});

export default Login;
