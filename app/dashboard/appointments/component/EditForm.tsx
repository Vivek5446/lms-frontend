"use client";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  IconButton,
  SimpleGrid,
  Switch,
  Text,
  Tooltip,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { tablePageLimit } from "../../../component/config/utils/variable";
import { replaceLabelValueObjects } from "../../../config/utils/function";
import { readFileAsBase64 } from "../../../config/utils/utils";
import stores from "../../../store/stores";
import AddPatientDrawer from "../../patients/component/patient/component/AddPatientDrawer";
import { appointStatus } from "../constant";
import { appointmentReason } from "../utils/constant";
import ScrollToFormikError from "../../../component/common/ScrollToFormikError/ScrollToFormikError";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { format } from "date-fns";
import Loader from "../../../component/common/Loader/Loader";
import DentistScheduler from "../../daily-report/component/DentistScheduler/DentistScheduler";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";
import { keyframes } from "@emotion/react";

const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.12); }
`

const ring = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(56, 178, 172, 0.7); }
  70%  { box-shadow: 0 0 0 10px rgba(56, 178, 172, 0); }
  100% { box-shadow: 0 0 0 0 rgba(56, 178, 172, 0); } `

const validationSchema = Yup.object().shape({
  primaryDoctor: Yup.mixed().required("Primary doctor is required"),
  patient: Yup.mixed().required("Patient is required"),
  appointmentDate: Yup.string().required("Appointment date is required"),
  startTime: Yup.string().required("Start time is required"),
  title: Yup.mixed(),
  mode: Yup.string().required("Mode is required"),
  meetingLink: Yup.string().when("mode", {
    is: "online",
    then: (schema) =>
      schema.required("Meeting link is required for online appointments"),
    otherwise: (schema) => schema.notRequired(),
  }),
  location: Yup.string(),
  status: Yup.string()
    .oneOf(
      [
        "scheduled",
        "in-progress",
        "completed",
        "cancelled",
        "shift",
        "no-show",
        "arrived",
      ],
      "Invalid status",
    )
    .required("Status is required"),
  followUp: Yup.object().shape({
    isFollowUp: Yup.boolean(),
    referenceAppointmentId: Yup.string().when("isFollowUp", {
      is: true,
      then: (schema) => schema.required("Reference appointment is required"),
    }),
  }),
  doctorNote: Yup.string().notRequired(),
});

const toLocalDate = (utcString: string) => {
  if (!utcString) return "";
  const date = new Date(utcString);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

const toLocalTime = (utcString: string) => {
  if (!utcString) return "";
  const date = new Date(utcString);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[1].slice(0, 5);
};

const toUtcISOString = (date: string, time: string) => {
  if (!date || !time) return null;
  const localDateTime = new Date(`${date}T${time}`);
  return new Date(
    localDateTime.getTime() + localDateTime.getTimezoneOffset() * 60000,
  ).toISOString();
};

const SectionCard = ({ title, children }: { title: string; children: any }) => (
  <Card
    variant="outline"
    borderRadius="2xl"
    shadow="md"
    p={1}
  // _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
  // transition="all 0.2s ease"
  >
    <CardHeader pb={2}>
      <Text fontSize="xl" fontWeight="semibold" color="blue.600">
        {title}
      </Text>
    </CardHeader>
    <Divider mb={4} />
    <CardBody>{children}</CardBody>
  </Card>
);

const EditAppointmentForm = observer(
  ({
    isPatient,
    patientDetails,
    close,
    selectedDateAndTime,
    applyGetAllRecords,
  }: any) => {
    const {
      DoctorAppointment: { getAppointmentById, updateAppointment },
      auth: { openNotification },
      userStore: { getAllUsers },
      chairsStore: { getChairs },
    } = stores;
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isSchedulerDrawerOpen, setIsSchedulerDrawerOpen] = useState(false);
    const [appointment, setAppointment] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<any>({
      isOpen: false,
      type: "add",
      data: null,
    });

    const [thumbnail, setThumbnail] = useState([]);
    const toast = useToast();
    const [formLoading, setFormLoading] = useState(false);
    const [chairsData, setChairsData] = useState<any>([]);

    const getAppointDetailsData = async () => {
      try {
        let dts = await getAppointmentById({
          appointmentId: selectedDateAndTime.data?._id,
        });
        if (dts.status === "success") {
          setAppointment(dts?.data?.data);
          // Initialize selectedDate for the scheduler from the appointment date
          if (dts?.data?.data?.appointmentDate) {
            setSelectedDate(new Date(dts.data.data.appointmentDate));
          }
        } else {
          openNotification({
            type: "error",
            title: "Error",
            message: "No Such Appointment Exists",
          });
        }
      } catch (err: any) {
        openNotification({
          type: "error",
          title: "Error",
          message: err?.message,
        });
      }
    };

    useEffect(() => {
      if (selectedDateAndTime?.data?._id) {
        getAppointDetailsData();
      }
    }, [selectedDateAndTime?.data]);

    const onSubmit = (data: any, setSubmitting: any) => {
      const startUTC = toUtcISOString(data.appointmentDate, data.startTime);
      const endUTC = toUtcISOString(data.appointmentDate, data.endTime);

      const formattedData = {
        ...data,
        startTimeUTC: startUTC,
        endTimeUTC: endUTC,
        created_At: new Date().toISOString(),
        updated_At: new Date().toISOString(),
        doctorNote: data.doctorNote,
        chair: data?.chair?.value,
      };

      updateAppointment(
        replaceLabelValueObjects({
          ...formattedData,
          _id: selectedDateAndTime?.data?._id,
        }),
      )
        .then(() => {
          openNotification({
            type: "success",
            title: "Updated Successfully",
            message: "Appointment has been Updated Successfully",
          });
          if (close && applyGetAllRecords) {
            applyGetAllRecords({});
            close();
          }
        })
        .catch((err) => {
          openNotification({
            type: "error",
            title: "Failed to Update Appointment",
            message: err?.message,
          });
        })
        .finally(() => {
          setSubmitting(false);
        });
    };

    const handleAddSubmit = async (formData: any) => {
      try {
        setFormLoading(true);
        const values = { ...formData };
        if (values.pic?.file && values.pic?.file?.length !== 0) {
          const buffer = await readFileAsBase64(values.pic?.file);
          const fileData = {
            buffer: buffer,
            filename: values.pic?.file?.name,
            type: values.pic?.file?.type,
            isAdd: values.pic?.isAdd || 1,
          };
          formData.pic = fileData;
        }

        updateAppointment({
          ...values,
          _id: selectedDateAndTime?.data?._id,
          ...(replaceLabelValueObjects(values) || {}),
          pic: formData?.pic || {},
          title: formData?.data,
          mobileNumber:
            formData.phones.find((it: any) => it.primary === true).number ||
            undefined,
          username:
            formData.emails.find((it: any) => it.primary === true).email ||
            undefined,
          gender: formData?.gender?.value || 1,
          type: "patient",
        })
          .then(() => {
            getAllUsers({ page: 1, limit: tablePageLimit, type: "patient" });
            setFormLoading(false);
            setIsDrawerOpen({ isOpen: false, type: "add", data: null });
            toast({
              title: "Patient Added.",
              description: `${formData.name} has been successfully added.`,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
          })
          .catch((err: any) => {
            setFormLoading(false);
            toast({
              title: "failed to create",
              description: `${err?.message}`,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          });
      } catch (err: any) {
        setFormLoading(false);
        toast({
          title: "failed to create",
          description: `${err?.message}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchChairs = async () => {
      const resposne = await getChairs({
        page: 1,
        limit: 200,
        // search: debouncedSearch,
      });
      setChairsData(resposne.data);
    };

    useEffect(() => {
      fetchChairs();
    }, []);
    // const chairsData = getChairs({ page: 1, limit: 1000 })
    const chairsOptions = chairsData.map((item: any) => ({
      value: item._id,
      label: item.chairName,
    }));

    if (!appointment) {
      return <Loader fullPage message="Loading Appointment Details" />;
    }

    return (
      <>
        <Formik
          initialValues={{
            primaryDoctor: appointment?.primaryDoctor
              ? {
                label: appointment.primaryDoctor.name,
                value: appointment.primaryDoctor._id,
              }
              : null,

            additionalDoctors: Array.isArray(appointment?.additionalDoctors)
              ? appointment?.additionalDoctors?.map((it: any) => ({
                label: it.name,
                value: it._id,
              }))
              : [],

            additionalStaff: [],

            showCompleteData: appointment?.showCompleteData,

            patient: appointment?.patient
              ? {
                label: `${appointment.patient.name} (${appointment.patient.code})`,
                value: appointment.patient._id,
              }
              : null,

            appointmentDate: appointment?.appointmentDate
              ? toLocalDate(appointment.appointmentDate)
              : "",

            startTime: appointment?.startTime || "",

            endTime: appointment?.endTime || "",

            title: appointment?.title
              ? { label: appointment?.title, value: appointment?.title }
              : undefined,

            description: appointment?.description || "",

            mode: appointment?.mode || {
              label: appointment?.mode,
              value: appointment?.mode,
            },

            meetingLink: appointment?.meetingLink || "",

            location: appointment?.location || "",

            status: appointment?.status || {
              label: appointment?.status,
              value: appointment?.status,
            },

            followUp: {
              isFollowUp: false,
              referenceAppointmentId: "",
            },

            doctorNote: appointment?.doctorNotes || undefined,

            chair: appointment?.chair
              ? {
                label: appointment.chair.chairName,
                value: appointment.chair._id,
              }
              : null,

            shiftOrCancelledReason: appointment?.shiftOrCancelledReason || "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) =>
            onSubmit(values, setSubmitting)
          }
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }: any) => {
            return (
              <>
                <ScrollToFormikError />
                <Form>
                  <VStack spacing={2} align="stretch">
                    {/* === Patient & Doctors === */}
                    <SectionCard title="Patient & Doctors">
                      <Grid
                        gap={4}
                        gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
                      >
                        <Flex align="end" gap={3} alignItems="center">
                          <CustomInput
                            name="patient"
                            placeholder="Search Patient"
                            type="real-time-user-search"
                            label="Patient"
                            required
                            value={values.patient}
                            onChange={(val: any) =>
                              setFieldValue("patient", val)
                            }
                            options={
                              isPatient
                                ? [
                                  {
                                    label: `${patientDetails?.name}${patientDetails?.code ? ` (${patientDetails.code})` : ""}`,
                                    value: patientDetails?._id,
                                  },
                                ]
                                : values?.patient
                                  ? [values?.patient]
                                  : []
                            }
                            error={errors.patient as string}
                            showError={touched.patient}
                            query={{ type: "patient" }}
                          />

                          {!isPatient && (
                            <Text
                              as="button"
                              type="button"
                              fontSize="sm"
                              fontWeight="medium"
                              color="blue.600"
                              _hover={{
                                color: "blue.700",
                                textDecoration: "underline",
                              }}
                              onClick={() => setIsDrawerOpen({ isOpen: true })}
                              whiteSpace="nowrap"
                              mt={4}
                            >
                              + Add new
                            </Text>
                          )}
                        </Flex>

                        <CustomInput
                          name="primaryDoctor"
                          placeholder="Search Doctor"
                          type="real-time-user-search"
                          label="Primary Doctor"
                          required
                          value={values.primaryDoctor}
                          onChange={(val: any) =>
                            setFieldValue("primaryDoctor", val)
                          }
                          options={
                            values?.primaryDoctor ? [values?.primaryDoctor] : []
                          }
                          error={errors.primaryDoctor as string}
                          showError={touched.primaryDoctor}
                          query={{ type: "doctor" }}
                        />
                      </Grid>
                      <Flex gap={4} mt={4}>
                        <CustomInput
                          name="additionalDoctors"
                          placeholder="Select Assisted By"
                          type="real-time-user-search"
                          label="Assisted By Doctor"
                          isMulti
                          value={values.additionalDoctors}
                          onChange={(val: any) =>
                            setFieldValue("additionalDoctors", val)
                          }
                          query={{ type: "doctor" }}
                        />
                        <CustomInput
                          name="additionalStaff"
                          placeholder="Select Assisted By"
                          type="real-time-user-search"
                          label="Assisted By Staff"
                          isMulti
                          value={values.additionalStaff}
                          onChange={(val: any) =>
                            setFieldValue("additionalStaff", val)
                          }
                          query={{ type: "staff" }}
                        />
                      </Flex>
                      <Flex gap={4} mt={4} align="flex-end">
                        {/* Chair */}
                        <Box flex="1">
                          <CustomInput
                            name="chair"
                            placeholder="Select Chair"
                            type="select"
                            label="Chair"
                            options={chairsOptions}
                            value={values?.chair}
                            onChange={(val: any) => setFieldValue("chair", val)}
                          />
                        </Box>

                        {/* Status */}
                        <Box flex="1">
                          <Flex align="flex-end" gap={2}>
                            {/* Status Select */}
                            <Box flex="1">
                              <CustomInput
                                name="status"
                                label="Appointment Status"
                                type="select"
                                isPortal
                                required
                                options={appointStatus}
                                value={{
                                  label:
                                    values.status.charAt(0).toUpperCase() +
                                    values.status.slice(1).replace("-", " "),
                                  value: values.status,
                                }}
                                onChange={(opt: any) =>
                                  setFieldValue("status", opt?.value)
                                }
                                error={errors.status as string}
                                showError={touched.status}
                              />
                            </Box>

                            {/* Calendar Button (Separate Element) */}
                            {values.status === "shift" && (
                              <Tooltip label="Choose time from scheduler" placement="left">
                                <IconButton
                                  aria-label="Open scheduler"
                                  icon={<CalendarIcon />}
                                  size="md"
                                  colorScheme="teal"
                                  variant="outline"
                                  onClick={() => setIsSchedulerDrawerOpen(true)}
                                  alignSelf="flex-end"
                                  animation={`${breathe} 2.8s ease-in-out infinite, ${ring} 2.2s ease-out infinite`}
                                  _hover={{
                                    bg: "teal.50",
                                    transform: "translateY(-2px) scale(1.1)",
                                    boxShadow: "0 0 0 12px rgba(56, 178, 172, 0.45)",
                                  }}
                                  transition="all 0.3s ease"
                                />
                              </Tooltip>
                            )}
                          </Flex>
                        </Box>
                      </Flex>
                      <Box mt={3}>
                        {(values.status === "shift" || values.status === "cancelled") && (
                          <CustomInput
                            name="shiftOrCancelledReason"
                            label={values.status === "shift" ? "Shift Reason" : "Cancellation Reason"}
                            type="text"
                            placeholder={values.status === "shift" ? "Enter reason for shift..." : "Enter reason for cancellation..."}
                            value={values.shiftOrCancelledReason}
                            onChange={(e: any) =>
                              setFieldValue("shiftOrCancelledReason", e.target.value)
                            }
                            error={errors.shiftOrCancelledReason as string}
                            showError={touched.shiftOrCancelledReason}
                          />
                        )}
                      </Box>
                    </SectionCard>

                    {/* === Appointment Details === */}
                    <SectionCard title="Appointment Details">
                      <VStack spacing={4}>
                        <SimpleGrid
                          columns={{ base: 1, md: 3 }}
                          spacing={4}
                          w="full"
                        >
                          <Flex gap={4} alignItems="center">
                            <CustomInput
                              name="appointmentDate"
                              label="Date"
                              type="date"
                              required
                              value={values.appointmentDate}
                              onChange={(e: any) =>
                                setFieldValue("appointmentDate", e.target.value)
                              }
                              error={errors.appointmentDate as string}
                              showError={touched.appointmentDate}
                            />
                          </Flex>
                          <CustomInput
                            name="startTime"
                            label="Start Time"
                            type="timeOnly"
                            required
                            value={values.startTime}
                            onChange={(e: any) =>
                              setFieldValue("startTime", e.target.value)
                            }
                            error={errors.startTime as string}
                            showError={touched.startTime}
                          />
                          <CustomInput
                            name="endTime"
                            label="End Time"
                            type="timeOnly"
                            value={values.endTime}
                            onChange={(e: any) =>
                              setFieldValue("endTime", e.target.value)
                            }
                          />
                        </SimpleGrid>
                        <CustomInput
                          name="description"
                          label="Cause"
                          type="textarea"
                          placeholder="Enter Cause"
                          value={values.description}
                          onChange={(e: any) =>
                            setFieldValue("description", e.target.value)
                          }
                        />
                        <CustomInput
                          name="title"
                          label="Treatment Head"
                          type="select"
                          value={values.title}
                          onChange={(e: any) => setFieldValue("title", e)}
                          options={appointmentReason}
                          error={errors.title}
                          showError={touched.title}
                        />
                      </VStack>
                    </SectionCard>
                    <Flex
                      align="center"
                      justify="space-between"
                      p={3}
                      borderRadius="md"
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <Text fontSize="md" fontWeight="semibold">
                        Show Other Appointment Details
                      </Text>

                      {/* Arrow + Switch */}
                      <Flex align="center" gap={2}>
                        {/* Arrow */}
                        <Flex
                          w="32px"
                          h="32px"
                          align="center"
                          justify="center"
                          cursor="pointer"
                          onClick={() =>
                            setFieldValue(
                              "showCompleteData",
                              !values.showCompleteData,
                            )
                          }
                        >
                          {values.showCompleteData ? (
                            <ChevronUpIcon boxSize={8} color="gray.700" />
                          ) : (
                            <ChevronDownIcon boxSize={8} color="gray.700" />
                          )}
                        </Flex>

                        {/* Switch */}
                        <Switch
                          colorScheme="teal"
                          size="md"
                          isChecked={values.showCompleteData}
                          onChange={(e) =>
                            setFieldValue("showCompleteData", e.target.checked)
                          }
                        />
                      </Flex>
                    </Flex>
                    <Flex
                      flexDirection="column"
                      gap={4}
                      display={values?.showCompleteData ? undefined : "none"}
                    >
                      {/* === Mode & Location === */}
                      <SectionCard title="Online & Offline">
                        <VStack spacing={4}>
                          <CustomInput
                            name="mode"
                            label="Online & Offline"
                            type="select"
                            options={[
                              { label: "Offline", value: "offline" },
                              { label: "Online", value: "online" },
                            ]}
                            value={{
                              label:
                                values.mode.charAt(0).toUpperCase() +
                                values.mode.slice(1),
                              value: values.mode,
                            }}
                            onChange={(opt: any) =>
                              setFieldValue("mode", opt?.value)
                            }
                          />

                          {values.mode === "online" ? (
                            <CustomInput
                              name="meetingLink"
                              label="Meeting Link"
                              type="url"
                              required
                              placeholder="https://meet.google.com/..."
                              value={values.meetingLink}
                              onChange={(e: any) =>
                                setFieldValue("meetingLink", e.target.value)
                              }
                              error={errors.meetingLink as string}
                              showError={touched.meetingLink}
                            />
                          ) : (
                            <CustomInput
                              name="location"
                              label="Location"
                              type="text"
                              placeholder="Clinic Room 203, XYZ Hospital"
                              value={values.location}
                              onChange={(e: any) =>
                                setFieldValue("location", e.target.value)
                              }
                              error={errors.location as string}
                              showError={touched.location}
                            />
                          )}
                        </VStack>
                      </SectionCard>

                      {/* === Status & Follow-up === */}
                      <SectionCard title="Status & Follow-up">
                        <VStack spacing={4}>
                          <FormControl>
                            <HStack align="center">
                              <FormLabel mb="0" fontWeight="medium">
                                Is this a follow-up appointment?
                              </FormLabel>
                              <Switch
                                isChecked={values.followUp.isFollowUp}
                                onChange={(e) =>
                                  setFieldValue(
                                    "followUp.isFollowUp",
                                    e.target.checked,
                                  )
                                }
                              />
                            </HStack>
                          </FormControl>

                          {values.followUp.isFollowUp && (
                            <CustomInput
                              name="followUp.referenceAppointmentId"
                              label="Reference Appointment"
                              placeholder="Search previous appointment"
                              type="text"
                              value={values.followUp.referenceAppointmentId}
                              onChange={(val: any) =>
                                setFieldValue(
                                  "followUp.referenceAppointmentId",
                                  val?._id || val,
                                )
                              }
                              error={
                                errors.followUp
                                  ?.referenceAppointmentId as string
                              }
                              showError={
                                touched.followUp?.referenceAppointmentId
                              }
                            />
                          )}
                        </VStack>
                      </SectionCard>
                      {/* === Doctor Notes === */}
                      <SectionCard title="Additional Notes">
                        <CustomInput
                          name="doctorNote"
                          label="Doctor Notes (optional)"
                          type="textarea"
                          placeholder="Any consultation notes, patient history, or setup instructions..."
                          value={values.doctorNote}
                          onChange={(e: any) =>
                            setFieldValue("doctorNote", e.target.value)
                          }
                        />
                      </SectionCard>
                    </Flex>
                    {/* === Submit === */}
                    <Button
                      colorScheme="blue"
                      type="submit"
                      isLoading={isSubmitting}
                      size="lg"
                      width="full"
                      mt={2}
                      borderRadius="xl"
                      shadow="md"
                    >
                      Save Appointment
                    </Button>
                  </VStack>
                </Form>
                <CustomDrawer
                  open={isSchedulerDrawerOpen}
                  close={() => setIsSchedulerDrawerOpen(false)}
                  title={
                    <Flex
                      align="center"
                      gap={3}
                      width="100%"
                      justify="space-between"
                    >
                      <Flex align="center" gap={3}>
                        <CalendarIcon boxSize={6} />
                        <Text>Select New Appointment Time</Text>
                      </Flex>

                      {/* Date Navigation Arrows */}
                      <Flex align="center" gap={4} mr={8}>
                        <IconButton
                          aria-label="Previous Day"
                          icon={<ChevronLeftIcon boxSize={6} />}
                          onClick={() => {
                            const prev = new Date(selectedDate);
                            prev.setDate(prev.getDate() - 1);
                            setSelectedDate(prev);
                          }}
                          size="sm"
                          variant="ghost"
                        />
                        <Text fontWeight="bold" fontSize="md">
                          {selectedDate.toDateString()}
                        </Text>
                        <IconButton
                          aria-label="Next Day"
                          icon={<ChevronRightIcon boxSize={6} />}
                          onClick={() => {
                            const next = new Date(selectedDate);
                            next.setDate(next.getDate() + 1);
                            setSelectedDate(next);
                          }}
                          size="sm"
                          variant="ghost"
                        />
                      </Flex>
                    </Flex>
                  }
                  width="80vw"
                >
                  <DentistScheduler
                    appointments={appointment}
                    isPatient={isPatient}
                    showEditButton={false}
                    patientDetails={patientDetails}
                    shouldNotEditIcon={true}
                    applyGetAllRecords={applyGetAllRecords}
                    handleTimeSlots={(dt: any) => {
                      // dt = { open: true, time, chair, selectedDate }
                      setFieldValue(
                        "appointmentDate",
                        format(dt.selectedDate, "yyyy-MM-dd"),
                      );
                      setFieldValue("startTime", dt.time);

                      // Calculate endTime (startTime + 30 mins)
                      if (dt.time) {
                        const [hours, minutes] = dt.time.split(":").map(Number);
                        const startDate = new Date();
                        startDate.setHours(hours, minutes);
                        startDate.setMinutes(startDate.getMinutes() + 30);

                        const endHours = String(startDate.getHours()).padStart(
                          2,
                          "0",
                        );
                        const endMinutes = String(
                          startDate.getMinutes(),
                        ).padStart(2, "0");
                        setFieldValue("endTime", `${endHours}:${endMinutes}`);
                      }

                      if (dt.chair) {
                        setFieldValue("chair", {
                          label: dt.chair.name,
                          value: dt.chair.id,
                        });
                      }
                      setIsSchedulerDrawerOpen(false);
                    }}
                    createdAppointmentByCalender={true}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                </CustomDrawer>
              </>
            );
          }}
        </Formik>
        <AddPatientDrawer
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          handleAddSubmit={handleAddSubmit}
          thumbnail={thumbnail}
          setThumbnail={setThumbnail}
          formLoading={formLoading}
        />
      </>
    );
  },
);

export default EditAppointmentForm;