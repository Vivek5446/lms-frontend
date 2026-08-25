"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Progress,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  Clock3,
  GraduationCap,
  UserRound,
} from "lucide-react";
import { SuperadminDashboardSummary } from "./types";

type DashboardInsightsProps = {
  highlights: NonNullable<SuperadminDashboardSummary["highlights"]>;
};

function Panel({
  title,
  subtitle,
  icon,
  children,
  href,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  children: React.ReactNode;
  href?: string;
}) {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const [firstWord, ...restWords] = title.split(" ");
  const restTitle = restWords.join(" ");

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      p={{ base: 4, md: 6 }}
      boxShadow="sm"
      minW={0}
      transition="all 0.2s"
      _hover={{ boxShadow: "md" }}
    >
      <Flex justify="space-between" align="center" gap={3} mb={6}>
        <Box>
          <Heading size="sm" fontWeight="900" letterSpacing="tight" textTransform="uppercase">
            <Box as="span" color={useColorModeValue("gray.900", "white")}>{firstWord} </Box>
            {restTitle && (
              <Box as="span" bgGradient={useColorModeValue("linear(to-r, purple.500, purple.700)", "linear(to-r, purple.300, purple.500)")} bgClip="text">
                {restTitle}
              </Box>
            )}
          </Heading>
          <Text fontSize="10px" fontWeight="700" color="gray.500" mt={0.5} letterSpacing="wider" textTransform="uppercase">
            {subtitle}
          </Text>
        </Box>
        <HStack>
          {href ? <Button as={Link} href={href} size="xs" variant="ghost" colorScheme="purple">View details</Button> : null}
          <Flex
            align="center"
            justify="center"
            boxSize="38px"
            borderRadius="xl"
            bg={useColorModeValue("purple.50", "purple.900")}
            color={useColorModeValue("purple.600", "purple.300")}
            flexShrink={0}
          >
            <Icon as={icon} boxSize={5} />
          </Flex>
        </HStack>
      </Flex>
      {children}
    </Box>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "Date unavailable";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardInsights({ highlights }: DashboardInsightsProps) {
  const surface = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.100", "gray.600");
  const activity = highlights.recentActivity || [];
  const recentUsers = highlights.recentUsers || [];
  const lowEngagementCompanies = highlights.lowEngagementCompanies || [];
  const expiringBatches = highlights.expiringBatches || [];
  const expiringEnrollments = highlights.expiringEnrollments || [];
  const topPerformingCompanies = highlights.topPerformingCompanies || [];
  const companiesNeedingAttention = highlights.companiesNeedingAttention || [];
  const topCourses = highlights.topCourses || [];
  const coursesNeedingAttention = highlights.coursesNeedingAttention || [];

  return (
    <Grid templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }} gap={4}>
      <Panel title="Recent portal activity" subtitle="Latest companies, users, courses, batches, and certificates" icon={Clock3}>
        <Stack spacing={2}>
          {activity.length ? (
            activity.slice(0, 6).map((item) => (
              <Flex
                key={item.id}
                p={3}
                bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                align="center"
                gap={4}
                transition="all 0.2s"
                _hover={{ transform: "translateX(4px)", bg: useColorModeValue("white", "whiteAlpha.100"), borderColor: useColorModeValue("gray.200", "whiteAlpha.300"), boxShadow: "sm" }}
              >
                <Flex
                  boxSize="36px"
                  align="center"
                  justify="center"
                  borderRadius="lg"
                  bg={useColorModeValue("purple.100", "rgba(98,105,255,0.15)")}
                  color={useColorModeValue("purple.600", "#6269FF")}
                  flexShrink={0}
                >
                  <Icon
                    as={
                      item.type === "company"
                        ? Building2
                        : item.type === "batch"
                          ? GraduationCap
                          : UserRound
                    }
                    boxSize={4}
                  />
                </Flex>
                <Box minW={0} flex={1}>
                  <Text fontSize="sm" fontWeight="700" color={useColorModeValue("gray.800", "gray.100")} noOfLines={1}>
                    {item.title}
                  </Text>
                  <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")} mt={0.5} noOfLines={1}>
                    {item.detail}
                  </Text>
                </Box>
                <Text fontSize="xs" fontWeight="600" color={useColorModeValue("gray.400", "gray.500")} whiteSpace="nowrap">
                  {formatDate(item.createdAt)}
                </Text>
              </Flex>
            ))
          ) : (
            <Text fontSize="sm" color="gray.500">
              No recent activity matches the current filters.
            </Text>
          )}
        </Stack>
      </Panel>

      <Panel title="Recently added users" subtitle="Newest accounts in the selected scope" icon={UserRound} href="/dashboard/users">
        <Stack spacing={2}>
          {recentUsers.length ? (
            recentUsers.slice(0, 6).map((user) => (
              <Flex
                key={user._id}
                p={3}
                bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                align="center"
                gap={4}
                transition="all 0.2s"
                _hover={{ transform: "translateX(4px)", bg: useColorModeValue("white", "whiteAlpha.100"), borderColor: useColorModeValue("gray.200", "whiteAlpha.300"), boxShadow: "sm" }}
              >
                <Avatar size="sm" name={user.name} bg={useColorModeValue("blue.100", "blue.900")} color={useColorModeValue("blue.700", "blue.200")} />
                <Box minW={0} flex={1}>
                  <Text fontSize="sm" fontWeight="700" color={useColorModeValue("gray.800", "gray.100")} noOfLines={1}>
                    {user.name}
                  </Text>
                  <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")} mt={0.5} noOfLines={1}>
                    {user.role} · {user.companyName}
                  </Text>
                </Box>
                <Badge colorScheme={user.isActive ? "green" : "gray"} variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="xs">
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </Flex>
            ))
          ) : (
            <Text fontSize="sm" color="gray.500">
              No users were found for the selected filters.
            </Text>
          )}
        </Stack>
      </Panel>

      <Panel title="Engagement watchlist" subtitle="Learners and companies without recent progress activity" icon={AlertTriangle} href="/dashboard/learner-progress">
        <Stack spacing={4}>
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb={2}>
              Companies
            </Text>
            <Stack spacing={2}>
              {lowEngagementCompanies.length ? (
                lowEngagementCompanies.slice(0, 4).map((company) => (
                  <Box key={company.companyId} p={4} bg={useColorModeValue("gray.50", "whiteAlpha.50")} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                    <Flex justify="space-between" gap={3} mb={3}>
                      <Text fontSize="sm" fontWeight="700" noOfLines={1}>
                        {company.name}
                      </Text>
                      <Text fontSize="xs" color="orange.500" fontWeight="900">
                        {company.engagementRate}% ACTIVE
                      </Text>
                    </Flex>
                    <Progress
                      value={company.engagementRate}
                      colorScheme={company.engagementRate < 30 ? "red" : "orange"}
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                ))
              ) : (
                <Text fontSize="sm" color="gray.500">
                  No company engagement risks detected.
                </Text>
              )}
            </Stack>
          </Box>
        </Stack>
      </Panel>

      <Panel title="Expiring soon" subtitle="Batches and course access ending within 30 days" icon={CalendarClock} href="/dashboard/batches">
        <Stack spacing={3}>
          {expiringBatches.map((batch) => (
            <Flex
              key={batch._id}
              p={3}
              bg={useColorModeValue("gray.50", "whiteAlpha.50")}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              align="center"
              justify="space-between"
              gap={3}
            >
              <Box minW={0}>
                <Text fontSize="sm" fontWeight="700" noOfLines={1}>
                  {batch.name}
                </Text>
                <Text fontSize="xs" color="gray.500" mt={0.5} noOfLines={1}>
                  {batch.companyName} · {batch.userCount} learners
                </Text>
              </Box>
              <Badge colorScheme="orange" variant="subtle" borderRadius="md" px={2} py={0.5} alignSelf="center">
                {formatDate(batch.endDate)}
              </Badge>
            </Flex>
          ))}
          {expiringEnrollments.map((item) => (
            <Flex
              key={item._id}
              p={3}
              bg={useColorModeValue("gray.50", "whiteAlpha.50")}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              align="center"
              justify="space-between"
              gap={3}
            >
              <Text fontSize="sm" fontWeight="700" noOfLines={1}>
                {item.courseTitle}
              </Text>
              <Badge colorScheme="yellow" variant="subtle" borderRadius="md" px={2} py={0.5} alignSelf="center">
                {formatDate(item.validTill)}
              </Badge>
            </Flex>
          ))}
          {!expiringBatches.length && !expiringEnrollments.length ? (
            <Text fontSize="sm" color="gray.500">
              Nothing is due to expire in the next 30 days.
            </Text>
          ) : null}
        </Stack>
      </Panel>

      <Panel title="Company performance" subtitle="Highest and lowest completion rates with real enrollments" icon={Building2} href="/dashboard/admins">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>Performing well</Text>
            <Stack spacing={2}>
              {topPerformingCompanies.slice(0, 4).map((company) => (
                <Flex key={company.companyId} justify="space-between" gap={3} p={3} bg={surface} borderRadius="xl">
                  <Box minW={0}><Text fontSize="sm" fontWeight="700" noOfLines={1}>{company.name}</Text><Text fontSize="xs" color="gray.500">{company.enrollments} enrollments</Text></Box>
                  <Badge colorScheme="green" borderRadius="full">{company.completionRate ?? 0}%</Badge>
                </Flex>
              ))}
            </Stack>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>Needs attention</Text>
            <Stack spacing={2}>
              {companiesNeedingAttention.slice(0, 4).map((company) => (
                <Flex key={company.companyId} justify="space-between" gap={3} p={3} bg={surface} borderRadius="xl">
                  <Box minW={0}><Text fontSize="sm" fontWeight="700" noOfLines={1}>{company.name}</Text><Text fontSize="xs" color="gray.500">{company.averageProgress ?? 0}% avg progress</Text></Box>
                  <Badge colorScheme="orange" borderRadius="full">{company.completionRate ?? 0}%</Badge>
                </Flex>
              ))}
            </Stack>
          </Box>
        </Grid>
      </Panel>

      <Panel title="Course performance" subtitle="Most engaged courses and those with incomplete learning" icon={GraduationCap} href="/dashboard/course">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
          {[{ label: "Most engaged", items: topCourses, scheme: "teal" }, { label: "Needs attention", items: coursesNeedingAttention, scheme: "orange" }].map((group) => (
            <Box key={group.label}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>{group.label}</Text>
              <Stack spacing={3}>
                {group.items.slice(0, 4).map((course) => (
                  <Box key={course._id}>
                    <Flex justify="space-between" gap={3}><Text fontSize="sm" fontWeight="700" noOfLines={1}>{course.title}</Text><Text fontSize="xs" fontWeight="bold">{course.completionRate ?? 0}%</Text></Flex>
                    <Progress value={course.averageProgress || 0} size="sm" borderRadius="full" colorScheme={group.scheme} mt={1} />
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Grid>
      </Panel>
    </Grid>
  );
}
