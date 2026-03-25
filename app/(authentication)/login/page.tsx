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
  Select,
  Spinner,
  Text,
  VStack
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import CustomButton from "../../component/common/CustomButton/CustomButton";
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

    const inputStyles = {
    bg: "white",
    border: "1px solid",
    borderColor: "gray.200",
    borderRadius: "8px",
    fontSize: "sm",
    h: "44px",
    color: "gray.700",
    _placeholder: { color: "gray.400", fontSize: "13px" },
    _focus: {
      borderColor: "#D84315",
      boxShadow: "0 0 0 2px rgba(216,67,21,0.1)",
    },
    _hover: { borderColor: "gray.300" },
  };
 
  const labelStyles = {
    fontSize: "13px",
    fontWeight: "500",
    color: "gray.700",
    mb: 1,
  };
 
  return (
    <VStack spacing={0} align="stretch">
      {/* Heading */}
      <Box mb={5}>
        <Heading fontSize="2xl" fontWeight="600" color="gray.800" mb={1}>
          Login
        </Heading>
        <Text fontSize="13px" color="gray.400">
          Enter your credentials to login to your account
        </Text>
      </Box>
 
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          {/* Login Type */}
          <FormControl>
            <FormLabel {...labelStyles}>Login using</FormLabel>
            <Select
              name="loginType"
              value={formData.loginType}
              onChange={handleInputChange}
              {...inputStyles}
            >
              <option value="email">Email</option>
              <option value="code">User Code</option>
            </Select>
          </FormControl>
 
          {/* Email / Code */}
          <FormControl>
            <FormLabel {...labelStyles}>
              {formData.loginType === "email" ? "Email" : "User Code"}
            </FormLabel>
            <Input
              type="text"
              name="username"
              placeholder={
                formData.loginType === "email"
                  ? "example.educationpro@gmail.com"
                  : "Enter your user code"
              }
              value={formData.username}
              onChange={handleInputChange}
              required
              {...inputStyles}
            />
          </FormControl>
 
          {/* Password */}
          <FormControl>
            <FormLabel {...labelStyles}>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                {...inputStyles}
                pr="44px"
              />
              <InputRightElement h="44px" cursor="pointer" onClick={handleTogglePassword}>
                {showPassword ? (
                  <RiEyeOffLine size={16} color="#9CA3AF" />
                ) : (
                  <RiEyeLine size={16} color="#9CA3AF" />
                )}
              </InputRightElement>
            </InputGroup>
          </FormControl>
 
          {/* Remember me + Forgot */}
          <Flex justify="space-between" align="center" mt={-1}>
            <Checkbox
              size="sm"
              colorScheme="orange"
              sx={{
                ".chakra-checkbox__label": { fontSize: "13px", color: "gray.500" },
                ".chakra-checkbox__control": { borderRadius: "3px", borderColor: "gray.300" },
              }}
            >
              Remember me
            </Checkbox>
            <Link href="/forgot-password">
              <Text fontSize="13px" color="#D84315" fontWeight="500" _hover={{ textDecoration: "underline" }}>
                Forgot Password?
              </Text>
            </Link>
          </Flex>
 
          {/* Sign In */}
          <CustomButton
            type="submit"
            size="md"
            width="100%"
            mt={1}
            borderRadius="8px"
            bg="#D84315"
            color="white"
            fontWeight="500"
            fontSize="sm"
            h="44px"
            _hover={{ bg: "#BF360C" }}
            _active={{ bg: "#BF360C", transform: "scale(0.99)" }}
            isDisabled={!formData.username || !formData.password || isLoading}
          >
            {isLoading ? <Spinner size="sm" color="white" /> : "Sign In"}
          </CustomButton>
 
          {/* Google */}
          <Button
            size="md"
            width="100%"
            leftIcon={<FcGoogle size="18px" />}
            fontSize="13px"
            fontWeight="400"
            bg="white"
            color="gray.600"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="8px"
            h="44px"
            _hover={{ bg: "gray.50" }}
          >
            Sign in with google
          </Button>
        </VStack>
      </form>
    </VStack>
  );
});
 
export default Login;
