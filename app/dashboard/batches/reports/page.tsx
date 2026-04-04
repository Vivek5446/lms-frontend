"use client";

import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useState } from "react";
import { Box, Input, Select, HStack, Button } from "@chakra-ui/react";
import { batchStore } from "@/app/store/batchStore/batchStore";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable"; // adjust path

const formatTime = (minutes?: number | null) => {
  if (!minutes) return "-";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

const Page = observer(() => {
  // Fetch all batches on component mount
  useEffect(() => {
    batchStore.fetchBatches();
  }, []);

  const batches = batchStore.batches;

  // --- Filters state ---
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    completionPercentage: "",
    status: "",
    courseMin: "",
    courseMax: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // --- Filtered table data ---
  const tableData = useMemo(() => {
    if (!batches.length) return [];

    return batches
      .filter((batch) => {
        // Filter by start date
        if (filters.startDate && batch.startDate) {
          if (new Date(batch.startDate) < new Date(filters.startDate)) return false;
        }

        // Filter by end date
        if (filters.endDate && batch.endDate) {
          if (new Date(batch.endDate) > new Date(filters.endDate)) return false;
        }

        // Filter by status
        if (filters.status && batch.status !== filters.status) return false;

        // Filter by course count
        const courseCount = batch.courseCount || 0;
        if (filters.courseMin && courseCount < Number(filters.courseMin)) return false;
        if (filters.courseMax && courseCount > Number(filters.courseMax)) return false;

        return true;
      })
      .map((batch) => {
        const totalCourses = batch.courseCount || 0;
        const completedCourses = batch.completedCount || 0;
        const completionPercentage = totalCourses
          ? Math.round((completedCourses / totalCourses) * 100)
          : 0;

        // Apply completion % filter
        if (filters.completionPercentage && completionPercentage < Number(filters.completionPercentage)) {
          return null;
        }

        const completionDate =
          completionPercentage === 100 && batch.endDate
            ? new Date(batch.endDate).toLocaleDateString()
            : "-";

        const start = batch.startDate ? new Date(batch.startDate).getTime() : 0;
        const end = batch.endDate ? new Date(batch.endDate).getTime() : 0;

        const timeToComplete =
          completionPercentage === 100 && start && end
            ? Math.floor((end - start) / (1000 * 60))
            : null;

        return {
          name: batch.name,
          status: batch.status,
          completionPercentage: `${completionPercentage}%`,
          completionDate,
          timeToComplete: formatTime(timeToComplete),
          attempts: 1, // Backend support needed
          courses: `${completedCourses}/${totalCourses}`,
          users: batch.userCount || 0, // Added users count
        };
      })
      .filter(Boolean); // remove nulls from completion % filter
  }, [batches, filters]);

  // --- Table columns ---
  const columns = [
    { headerName: "Batch Name", key: "name" },
    { headerName: "Status", key: "status" },
    { headerName: "Completion %", key: "completionPercentage" },
    { headerName: "Completion Date", key: "completionDate" },
    { headerName: "Time Taken", key: "timeToComplete" },
    { headerName: "Attempts", key: "attempts" },
    { headerName: "Courses", key: "courses" },
    { headerName: "Users", key: "users" }, // <-- Users column
  ];

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      {/* --- Filters UI --- */}
      <Box mb={4} p={4} bg="white" borderRadius="md" shadow="sm">
        <HStack spacing={3} flexWrap="wrap">
          <Input
            type="date"
            placeholder="Start Date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            size="sm"
            maxW="140px"
          />
          <Input
            type="date"
            placeholder="End Date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            size="sm"
            maxW="140px"
          />
          <Select
            placeholder="Status"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            size="sm"
            maxW="140px"
          >
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="completed">Completed</option>
            <option value="expiring_soon">Expiring Soon</option>
          </Select>
          <Input
            type="number"
            placeholder="Min Courses"
            value={filters.courseMin}
            onChange={(e) => handleFilterChange("courseMin", e.target.value)}
            size="sm"
            maxW="100px"
          />
          <Input
            type="number"
            placeholder="Max Courses"
            value={filters.courseMax}
            onChange={(e) => handleFilterChange("courseMax", e.target.value)}
            size="sm"
            maxW="100px"
          />
          <Input
            type="number"
            placeholder="Min Completion %"
            value={filters.completionPercentage}
            onChange={(e) => handleFilterChange("completionPercentage", e.target.value)}
            size="sm"
            maxW="120px"
          />
          <Button
            colorScheme="blue"
            size="sm"
            onClick={() =>
              setFilters({
                startDate: "",
                endDate: "",
                completionPercentage: "",
                status: "",
                courseMin: "",
                courseMax: "",
              })
            }
          >
            Reset
          </Button>
        </HStack>
      </Box>

      <CustomTable
        title="Batch Report"
        columns={columns}
        data={tableData}
        loading={batchStore.isLoading}
        serial={{ show: true }}
      />
    </Box>
  );
});

export default Page;