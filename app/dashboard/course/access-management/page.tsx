"use client";

import { Box, Stack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "@/app/store/stores";
import CourseAccessGrantFlow from "./components/CourseAccessGrantFlow";
import CourseAssignmentWorkspace from "./components/CourseAssignmentWorkspace";
import AssignedCoursesPanel from "./components/AssignedCoursesPanel";

const AccessManagementPage = observer(() => {
  const role = String(stores.auth.userType || stores.auth.user?.role || "").toLowerCase();

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        {role === "superadmin" ? <CourseAccessGrantFlow /> : null}
        {["admin", "departmenthead"].includes(role) ? <CourseAssignmentWorkspace /> : null}
        {role === "user" ? <AssignedCoursesPanel /> : null}
      </Stack>
    </Box>
  );
});

export default AccessManagementPage;
