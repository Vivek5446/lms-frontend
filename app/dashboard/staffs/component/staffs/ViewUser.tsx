import React from "react";
import {
  Box,
  Text,
  Image,
  Heading,
  Stack,
  Badge,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
  Divider,
} from "@chakra-ui/react";
import { PhoneIcon, EmailIcon } from "@chakra-ui/icons";
import {
  MdAccountBalance,
  MdVaccines,
  MdSecurity,
  MdSchool,
  MdHome,
} from "react-icons/md";

const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <HStack align="start" justify="space-between">
    <Text fontWeight="semibold" minW="140px" color="gray.600">
      {label}:
    </Text>
    <Text flex="1">{value || "—"}</Text>
  </HStack>
);

const SectionCard = ({ icon, title, children }: any) => {
  const bg = useColorModeValue("white", "gray.800");

  // Don’t render empty sections
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return null;
  }

  return (
    <Card
      bg={bg}
      borderWidth="1px"
      borderRadius="lg"
      shadow="sm"
      mb={5}
      _hover={{ shadow: "md" }}
    >
      <CardHeader pb={2}>
        <HStack spacing={2}>
          {icon && <Icon as={icon} boxSize={5} color="teal.500" />}
          <Heading size="sm">{title}</Heading>
        </HStack>
      </CardHeader>
      <CardBody pt={2}>{children}</CardBody>
    </Card>
  );
};

const ViewUser = ({ user }) => {
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const sectionItemBg = useColorModeValue("gray.50", "gray.700");

  if (!user) return <Text>No user data available</Text>;

  const personalInfo = user?.profileDetails?.personalInfo || {};

  return (
    <Box p={4} bg={pageBg}>
      {/* Profile Header */}
      <Card mb={6} shadow="md" borderRadius="lg">
        <CardBody>
          <Stack direction={["column", "row"]} spacing={4} align="center">
            {user.pic?.url && (
              <Image
                src={user.pic.url}
                alt={user.name}
                boxSize="80px"
                borderRadius="full"
                shadow="md"
              />
            )}
            <Box>
              <Heading size="md">{user.name}</Heading>
              <Text fontSize="sm" color="gray.500">
                {user.userType} — {user.code}
              </Text>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      {/* Basic Info */}
      <SectionCard title="Basic Information">
        <VStack align="stretch" spacing={2} divider={<Divider />}>
          <InfoItem label="Username" value={user.username} />
          <InfoItem label="Bio" value={user.bio} />
          <InfoItem label="DOB" value={personalInfo.dob} />
          <InfoItem
            label="Languages"
            value={personalInfo.languages?.join(", ")}
          />
        </VStack>
      </SectionCard>

      {/* Contact Info (only shows if data exists) */}
      {(personalInfo.phones?.length > 0 || personalInfo.emails?.length > 0) && (
        <SectionCard title="Contact Information">
          <VStack align="stretch" spacing={2}>
            {/* Contact Info */}
            {(personalInfo.phones?.some((p) => p.number) ||
              personalInfo.emails?.some((e) => e.email)) && (
              <SectionCard title="Contact Information">
                <VStack align="stretch" spacing={2}>
                  {/* Phones */}
                  {personalInfo.phones
                    ?.filter((p) => p.number) // only keep non-empty
                    .map((p, idx) => (
                      <HStack key={idx}>
                        <PhoneIcon color="teal.500" />
                        <Text>
                          {p.number}{" "}
                          {p.primary && (
                            <Badge ml={1} colorScheme="green">
                              Primary
                            </Badge>
                          )}
                        </Text>
                      </HStack>
                    ))}

                  {/* Emails */}
                  {personalInfo.emails
                    ?.filter((e) => e.email) // only keep non-empty
                    .map((e, idx) => (
                      <HStack key={idx}>
                        <EmailIcon color="teal.500" />
                        <Text>
                          {e.email}{" "}
                          {e.primary && (
                            <Badge ml={1} colorScheme="green">
                              Primary
                            </Badge>
                          )}
                        </Text>
                      </HStack>
                    ))}
                </VStack>
              </SectionCard>
            )}
          </VStack>
        </SectionCard>
      )}

      {/* Addresses */}
      {(personalInfo.addresses?.residential ||
        personalInfo.addresses?.office ||
        personalInfo.addresses?.other) && (
        <SectionCard icon={MdHome} title="Addresses">
          <VStack align="stretch" spacing={2}>
            <InfoItem
              label="Residential"
              value={personalInfo.addresses?.residential}
            />
            <InfoItem label="Office" value={personalInfo.addresses?.office} />
            <InfoItem label="Other" value={personalInfo.addresses?.other} />
          </VStack>
        </SectionCard>
      )}

      {/* Degrees */}
      {personalInfo.degreeInfo?.length > 0 && (
        <SectionCard icon={MdSchool} title="Degrees">
          {personalInfo.degreeInfo.map((d, idx) => (
            <Box
              key={idx}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              mb={2}
              bg={sectionItemBg}
            >
              <InfoItem label="Degree" value={d.name} />
              <InfoItem
                label="University"
                value={d.university || d.universary}
              />
              <InfoItem label="Year" value={d.year} />
            </Box>
          ))}
        </SectionCard>
      )}

      {/* Bank Accounts */}
      {personalInfo.bankAccounts?.length > 0 && (
        <SectionCard icon={MdAccountBalance} title="Bank Accounts">
          {personalInfo.bankAccounts.map((b, idx) => (
            <Box
              key={idx}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              mb={2}
              bg={sectionItemBg}
            >
              <InfoItem label="Account Holder" value={b.accountHolder} />
              <InfoItem label="Bank Name" value={b.bankName} />
              <InfoItem label="Account Number" value={b.accountNumber} />
              <InfoItem label="IFSC" value={b.ifscCode} />
              <InfoItem label="Branch" value={b.branch} />
              {b.primary && <Badge colorScheme="green">Primary</Badge>}
            </Box>
          ))}
        </SectionCard>
      )}

      {/* Vaccinations */}
      {personalInfo.vaccinations?.length > 0 && (
        <SectionCard icon={MdVaccines} title="Vaccinations">
          {personalInfo.vaccinations.map((v, idx) => (
            <Box
              key={idx}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              mb={2}
              bg={sectionItemBg}
            >
              <InfoItem label="Type" value={v.type} />
              <InfoItem label="Date Administered" value={v.dateAdministered} />
              <InfoItem label="Next Due" value={v.nextDueDate || "N/A"} />
              <InfoItem label="Remarks" value={v.remarks || "None"} />
            </Box>
          ))}
        </SectionCard>
      )}

      {/* Insurances */}
      {personalInfo.insurances?.length > 0 && (
        <SectionCard icon={MdSecurity} title="Insurances">
          {personalInfo.insurances.map((i, idx) => (
            <Box
              key={idx}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              mb={2}
              bg={sectionItemBg}
            >
              <InfoItem label="Type" value={i.type} />
              <InfoItem label="Start Date" value={i.startDate} />
              <InfoItem label="Renewal Date" value={i.renewalDate} />
              <InfoItem label="Amount Insured" value={i.amountInsured} />
              <InfoItem label="Amount Paid" value={i.amountPaid} />
              <InfoItem label="Remarks" value={i.remarks || "None"} />
            </Box>
          ))}
        </SectionCard>
      )}
    </Box>
  );
};

export default ViewUser;