"use client";

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  Text,
  Textarea,
  useToast,
  VStack,
  Badge,
  Stack,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  EmailIcon,
  PhoneIcon,
  EditIcon,
} from "@chakra-ui/icons";
import stores from "@/app/store/stores";

function splitName(value?: string) {
  const parts = String(value || "")
    .trim()
    .split(/\s+/);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}

// Safely converts any value to string — prevents {} crashing React render
function s(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return "";
  return String(value);
}

const ProfilePage: React.FC = observer(() => {
  const toast = useToast();
  const user = stores.auth.user;
  const personalInfo = user?.profile_details?.personalInfo || {};

  const resolvedPhone = s(
    user?.mobileNumber ||
      personalInfo?.mobileNumber ||
      personalInfo?.phoneNumber ||
      personalInfo?.phoneNo ||
      personalInfo?.mobileNo,
  );

  const role = s(user?.role).toLowerCase().replace(/_/g, " ");

  const [editing, setEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    city: "",
    state: "",
    bio: "",
  });

  useEffect(() => {
    if (!user) return;
    const nameParts = splitName(s(user?.name || personalInfo?.name));
    setForm({
      firstName: s(nameParts.firstName),
      lastName: s(nameParts.lastName),
      title: s(user?.title || personalInfo?.title),
      city: s(user?.city || personalInfo?.city),
      state: s(user?.state || personalInfo?.state),
      bio: s(user?.bio || personalInfo?.bio),
    });
  }, [user]);

  const avatarName = useMemo(() => {
    const full = `${form.firstName} ${form.lastName}`.trim();
    return s(full || user?.name || user?.username) || "Learner";
  }, [form.firstName, form.lastName, user?.name, user?.username]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((c) => ({ ...c, [field]: value }));
  };

  const handleSave = async () => {
    if (!user?._id) return;
    setSaving(true);
    const fullName = `${form.firstName} ${form.lastName}`.trim();

    try {
      await stores.userStore.updateUser({
        _id: user._id,
        name: s(fullName || user?.name),
        title: s(form.title),
        city: s(form.city),
        state: s(form.state),
        bio: s(form.bio),
        username: s(user?.username),
        mobileNumber: s(resolvedPhone),
        role: s(user?.role),
        code: s(user?.code || personalInfo?.code),
        company: s(user?.company || user?.companyId || personalInfo?.company), // ✅ required by store
      });
      await stores.auth.fetchUser();
      toast({
        title: "Profile updated!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditing(false);
    } catch (err: any) {
      const msg =
        typeof err === "string"
          ? err
          : typeof err?.message === "string"
            ? err.message
            : "Please try again.";
      toast({
        title: "Save failed",
        description: msg,
        status: "error",
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    const nameParts = splitName(s(user?.name || personalInfo?.name));
    setForm({
      firstName: s(nameParts.firstName),
      lastName: s(nameParts.lastName),
      title: s(user?.title || personalInfo?.title),
      city: s(user?.city || personalInfo?.city),
      state: s(user?.state || personalInfo?.state),
      bio: s(user?.bio || personalInfo?.bio),
    });
    setEditing(false);
  };

  const labelStyle = {
    fontSize: "11px",
    textTransform: "uppercase" as const,
    letterSpacing: "wider",
    color: "gray.600",
    fontWeight: "600",
    mb: "5px",
  };

  const inputStyle = {
    bg: "gray.50",
    border: "0.5px solid",
    borderColor: "gray.300",
    borderRadius: "8px",
    fontSize: "13px",
    color: "gray.800",
    _placeholder: { color: "gray.400" },
    _focus: { borderColor: "gray.500", bg: "white", boxShadow: "none" },
  };

  const cardStyle = {
    bg: "white",
    border: "0.5px solid",
    borderColor: "gray.200",
    borderRadius: "12px",
  };

  return (
    <Box
      maxW={{ base: "100%", md: "none" }}
      mx="auto"
      py={{ base: 4, md: 6 }}
      px={{ base: 3, sm: 4, md: 6 }}
    >
      {/* ── Page Header ── */}
      <Stack
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        spacing={{ base: 3, sm: 0 }}
        mb={{ base: 4, md: 6 }}
      >
        <Box>
          <Text
            fontSize={{ base: "17px", md: "20px" }}
            fontWeight="700"
            color="gray.900"
          >
            Profile
          </Text>
          <Text
            fontSize={{ base: "12px", md: "13px" }}
            color="gray.500"
            mt="2px"
          >
            you can update your profile anytime
          </Text>
        </Box>

        <HStack spacing={2} w={{ base: "100%", sm: "auto" }}>
          {editing && (
            <Button
              variant="outline"
              borderColor="gray.300"
              color="gray.600"
              borderRadius="8px"
              fontSize="13px"
              fontWeight="500"
              onClick={handleCancel}
              w={{ base: "50%", sm: "auto" }}
            >
              Cancel
            </Button>
          )}
          <Button
            bg={editing ? "gray.800" : "white"}
            color={editing ? "white" : "gray.700"}
            border="0.5px solid"
            borderColor={editing ? "gray.800" : "gray.300"}
            borderRadius="8px"
            fontSize="13px"
            fontWeight="500"
            px={{ base: 4, md: 5 }}
            _hover={{ bg: editing ? "gray.700" : "gray.50" }}
            leftIcon={editing ? <CheckCircleIcon /> : <EditIcon />}
            isLoading={saving}
            onClick={editing ? handleSave : () => setEditing(true)}
            w={{ base: editing ? "50%" : "100%", sm: "auto" }}
          >
            {editing ? "Save Changes" : "Edit Profile"}
          </Button>
        </HStack>
      </Stack>

      {/* ── Profile Info Card ── */}
      <Box {...cardStyle} p={{ base: 4, md: 5 }} mb={4}>
        <Stack
          direction={{ base: "column", sm: "row" }}
          align={{ base: "center", sm: "flex-start" }}
          spacing={{ base: 4, md: 5 }}
        >
          {/* Avatar + Role Badge */}
          <VStack spacing={3} align="center" flexShrink={0}>
            <Box position="relative" display="inline-block">
              <Avatar
                h={{ base: "80px", md: "100px" }}
                w={{ base: "80px", md: "100px" }}
                name={avatarName}
                src={s(user?.pic?.url)}
                bg="blue.500"
                color="white"
              />
              <Box
                position="absolute"
                bottom="4px"
                right="4px"
                w="11px"
                h="11px"
                borderRadius="full"
                bg="green.400"
                border="2px solid white"
              />
            </Box>

            {role && (
              <Badge
                bg="gray.100"
                color="gray.700"
                border="0.5px solid"
                borderColor="gray.300"
                borderRadius="6px"
                px={3}
                py={1}
                fontSize="12px"
                fontWeight="600"
                textTransform="capitalize"
                letterSpacing="0.04em"
              >
                {role}
              </Badge>
            )}
          </VStack>

          {/* Name, Email, Phone, Bio */}
          <Box flex={1} w="100%" textAlign={{ base: "center", sm: "left" }}>
            <Text
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight="700"
              color="gray.900"
              mb={2}
            >
              {avatarName}
            </Text>

            <Stack
              direction={{ base: "column", sm: "row" }}
              spacing={{ base: 1, sm: 4 }}
              mb={3}
              align={{ base: "center", sm: "flex-start" }}
            >
              <HStack
                spacing={2}
                justify={{ base: "center", sm: "flex-start" }}
              >
                <EmailIcon w="13px" h="13px" color="gray.500" />
                <Text
                  fontSize={{ base: "12px", md: "13px" }}
                  color="gray.700"
                  fontWeight="500"
                >
                  {s(user?.username) || "—"}
                </Text>
              </HStack>

              <HStack
                spacing={2}
                justify={{ base: "center", sm: "flex-start" }}
              >
                <PhoneIcon w="13px" h="13px" color="gray.500" />
                <Text
                  fontSize={{ base: "12px", md: "13px" }}
                  color="gray.700"
                  fontWeight="500"
                >
                  {resolvedPhone || "—"}
                </Text>
              </HStack>
            </Stack>

            {form.bio && (
              <Box
                bg="gray.50"
                border="0.5px solid"
                borderColor="gray.200"
                borderRadius="8px"
                p={3}
                textAlign="left"
              >
                <Text
                  fontSize={{ base: "12px", md: "13px" }}
                  color="gray.700"
                  lineHeight="1.6"
                >
                  {form.bio}
                </Text>
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      {/* ── Edit Form Card ── Always visible ── */}
      <Box {...cardStyle} p={{ base: 4, md: 5 }}>
        <Text
          fontSize="11px"
          fontWeight="600"
          textTransform="uppercase"
          letterSpacing="wider"
          color="gray.600"
          mb={4}
        >
          Edit profile
        </Text>

        <Grid
          templateColumns={{ base: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }}
          gap={{ base: 3, md: 4 }}
        >
          <FormControl>
            <FormLabel {...labelStyle}>First Name</FormLabel>
            <Input
              {...inputStyle}
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="First name"
              isReadOnly={!editing}
            />
          </FormControl>

          <FormControl>
            <FormLabel {...labelStyle}>Last Name</FormLabel>
            <Input
              {...inputStyle}
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Last name"
              isReadOnly={!editing}
            />
          </FormControl>

          <FormControl>
            <FormLabel {...labelStyle}>Job Title</FormLabel>
            <Input
              {...inputStyle}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Senior Engineer"
              isReadOnly={!editing}
            />
          </FormControl>

          <FormControl>
            <FormLabel {...labelStyle}>City</FormLabel>
            <Input
              {...inputStyle}
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Enter your city"
              isReadOnly={!editing}
            />
          </FormControl>

          <FormControl>
            <FormLabel {...labelStyle}>State</FormLabel>
            <Input
              {...inputStyle}
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="Enter your state"
              isReadOnly={!editing}
            />
          </FormControl>

          <GridItem colSpan={{ base: 1, sm: 2, md: 3 }}>
            <FormControl>
              <FormLabel {...labelStyle}>Bio</FormLabel>
              <Textarea
                {...inputStyle}
                rows={4}
                value={form.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                isReadOnly={!editing}
              />
            </FormControl>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
});

export default ProfilePage;
