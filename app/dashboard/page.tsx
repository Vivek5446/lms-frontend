"use client";

import { Box, Center, Container, Spinner, Text, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../store/stores";
import AdminLMS from "./components/LMS/AdminLMS";
import SuperAdminLMS from "./components/LMS/SuperAdminLMS";

const Page = observer(() => {
  const { auth } = stores;
  
  // Normalized role check
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isLoading = auth.isLoading;

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="gray.500" fontWeight="medium">Loading your dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  const RenderDashboard = () => {
    if (role === "superadmin") {
      return <SuperAdminLMS />;
    }
    
    if (role === "admin") {
      return <AdminLMS />;
    }

    return (
      <Center h="70vh">
        <VStack spacing={2}>
          <Text fontSize="xl" fontWeight="bold">Access Denied</Text>
          <Text color="gray.500">You don't have permission to view this dashboard.</Text>
        </VStack>
      </Center>
    );
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.2xl" py={8}>
        <RenderDashboard />
      </Container>
    </Box>
  );
});

export default Page;
