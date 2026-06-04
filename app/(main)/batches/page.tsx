"use client";

import { isLearnerRole } from "@/app/config/utils/roleAccess";
import BatchesWorkspace from "@/app/dashboard/batches/components/BatchesWorkspace";
import stores from "@/app/store/stores";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import Link from "next/link";

const MainBatchesPage = observer(() => {
  const role = String(stores.auth.userType || stores.auth.user?.role || "").toLowerCase();
  const isLearner = Boolean(stores.auth.user) && isLearnerRole(role);

  if (!isLearner) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center" px={4} py={12}>
        <Stack spacing={4} maxW="xl" textAlign="center">
          <Heading size="lg">Batches are available after login</Heading>
          <Text color="gray.600">
            Sign in with your learner account to view the batches assigned to you and open the courses inside them.
          </Text>
          <Button as={Link} href="/login" colorScheme="blue" alignSelf="center">
            Go to login
          </Button>
        </Stack>
      </Box>
    );
  }

  return <BatchesWorkspace courseBasePath="/course" />;
});

export default MainBatchesPage;
