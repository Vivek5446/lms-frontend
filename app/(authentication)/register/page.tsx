"use client";

import { Autocomplete, GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { Form, Formik, getIn } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Loader2,
  LocateFixed,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { AuthLayout } from "../../../components/auth/AuthLayout";
import { OtpInput } from "../../../components/auth/OtpInput";
import { StepDots } from "../../../components/auth/StepDots";
import { getDefaultAuthenticatedRoute } from "../../config/utils/roleAccess";
import stores from "../../store/stores";

const DUMMY_OTP = "123456";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const hasGoogleMapsKey = Boolean(GOOGLE_MAPS_API_KEY.trim());
const GOOGLE_MAP_LIBRARIES: ("places")[] = ["places"];

type AccountType = "learner" | "admin";
type Step = "phone" | "otp" | "profile" | "company" | "location" | "review";

type SignupLocation = {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  placeId: string;
  lat: number | null;
  lng: number | null;
  formattedAddress: string;
};

type SignupValues = {
  accountType: AccountType;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companyEmail: string;
  location: SignupLocation;
  termsAccepted: boolean;
};

const emptyLocation: SignupLocation = {
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  placeId: "",
  lat: null,
  lng: null,
  formattedAddress: "",
};

const defaultMapCenter = { lat: 20.5937, lng: 78.9629 };
const mapContainerStyle = { width: "100%", height: "100%" };
const mapOptions = { disableDefaultUI: true, clickableIcons: false, gestureHandling: "greedy" };

function getAddressPart(components: any[] = [], types: string[]) {
  const part = components.find((component) => types.some((type) => component.types?.includes(type)));
  return part?.long_name || "";
}

function buildLocationFromPlace(place: any, fallbackPoint?: { lat: number; lng: number }): SignupLocation {
  const components = place?.address_components || [];
  const geometryLocation = place?.geometry?.location;
  const lat = typeof geometryLocation?.lat === "function" ? geometryLocation.lat() : fallbackPoint?.lat ?? null;
  const lng = typeof geometryLocation?.lng === "function" ? geometryLocation.lng() : fallbackPoint?.lng ?? null;

  return {
    address: place?.formatted_address || place?.name || "",
    formattedAddress: place?.formatted_address || "",
    placeId: place?.place_id || "",
    city:
      getAddressPart(components, ["locality", "postal_town"]) ||
      getAddressPart(components, ["administrative_area_level_3", "administrative_area_level_2"]) ||
      getAddressPart(components, ["sublocality", "sublocality_level_1"]),
    state: getAddressPart(components, ["administrative_area_level_1"]),
    country: getAddressPart(components, ["country"]),
    postalCode: getAddressPart(components, ["postal_code"]),
    lat,
    lng,
  };
}

function applyLocationToFormik(setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void, location: SignupLocation) {
  Object.entries(location).forEach(([key, value]) => {
    setFieldValue(`location.${key}`, value, true);
  });
}

const Register = observer(() => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerAdmin, registerLearner, openNotification, requestOtp, verifyOtp } = stores.auth;
  const requestedRedirect = String(searchParams.get("redirect") || "").trim();
  const redirectTarget = requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : "";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const [locationBusy, setLocationBusy] = useState(false);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState(defaultMapCenter);
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState("Search, tap the map, or use current location.");

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "AIzaSyDUMMY_KEY_FOR_DISABLED_MAP",
    libraries: GOOGLE_MAP_LIBRARIES,
    preventGoogleFontsLoading: true,
  });

  useEffect(() => {
    if (!resendIn) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const normalizedPhone = phone.trim();
  const normalizedOtp = otp.trim();

  const initialValues = useMemo<SignupValues>(
    () => ({
      accountType: "learner",
      name: "",
      email: "",
      phone: "",
      companyName: "",
      companyEmail: "",
      location: emptyLocation,
      termsAccepted: false,
    }),
    []
  );

  const validationSchema = useMemo(
    () =>
      Yup.object({
        accountType: Yup.mixed<AccountType>().oneOf(["learner", "admin"]).required(),
        name: Yup.string().trim().min(2, "Enter your full name").max(80, "Name is too long").required("Full name is required"),
        email: Yup.string().trim().lowercase().email("Enter a valid email address"),
        phone: Yup.string().trim().matches(/^\d{10}$/, { message: "Enter a valid 10-digit phone number" }).required("Phone number is required"),
        companyName: Yup.string().when("accountType", {
          is: "admin",
          then: (schema) => schema.trim().min(2, "Enter your company name").max(120, "Company name is too long").required("Company name is required"),
          otherwise: (schema) => schema.trim(),
        }),
        companyEmail: Yup.string().when("accountType", {
          is: "admin",
          then: (schema) => schema.trim().lowercase().email("Enter a valid company email address"),
          otherwise: (schema) => schema.trim(),
        }),
        location: Yup.object({
          address: Yup.string().trim().min(3, "Enter a complete address").required("Address is required"),
          city: Yup.string().trim().required("City is required"),
          state: Yup.string().trim().required("State is required"),
          country: Yup.string().trim().required("Country is required"),
          postalCode: Yup.string().trim().required("Pincode is required"),
          placeId: Yup.string().trim(),
          lat: Yup.number().nullable(),
          lng: Yup.number().nullable(),
          formattedAddress: Yup.string().trim(),
        }),
        termsAccepted: Yup.boolean().oneOf([true], "Accept the terms to continue"),
      }),
    []
  );

  const sendOtp = async () => {
    if (!/^\d{10}$/.test(normalizedPhone)) {
      openNotification({ title: "Check your phone number", message: "Enter a valid 10-digit phone number.", type: "error" });
      return;
    }
    setBusy(true);
    try {
      await requestOtp({ phone: normalizedPhone, purpose: "register" });
      setOtp("");
      setResendIn(30);
      setStep("otp");
      openNotification({ title: "OTP sent", message: `Use ${DUMMY_OTP} while dummy flow is on.`, type: "success" });
    } catch (error: any) {
      openNotification({ title: "Unable to continue", message: error?.message || error?.error || "We could not start registration.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (normalizedOtp.length !== 6) {
      openNotification({ title: "Check your OTP", message: "Enter the 6-digit OTP.", type: "error" });
      return;
    }
    setBusy(true);
    try {
      const response: any = await verifyOtp({ phone: normalizedPhone, otp: normalizedOtp, purpose: "register" });
      setVerificationToken(response?.data?.verificationToken || response?.verificationToken || "");
      setStep("profile");
      openNotification({ title: "Phone verified", message: "Finish the rest of your account details.", type: "success" });
    } catch (error: any) {
      openNotification({ title: "Verification failed", message: error?.message || error?.error || "Unable to verify that OTP.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (values: SignupValues) => {
    const location = {
      address: values.location.address.trim(),
      city: values.location.city.trim(),
      state: values.location.state.trim(),
      country: values.location.country.trim(),
      postalCode: values.location.postalCode.trim(),
      placeId: values.location.placeId || undefined,
      lat: values.location.lat,
      lng: values.location.lng,
      formattedAddress: values.location.formattedAddress || values.location.address.trim(),
    };

    try {
      const response: any =
        values.accountType === "admin"
          ? await registerAdmin({
              name: values.name.trim(),
              phone: normalizedPhone,
              email: values.email.trim().toLowerCase() || undefined,
              verificationToken,
              companyName: values.companyName.trim(),
              companyEmail: values.companyEmail.trim().toLowerCase() || undefined,
              location,
            })
          : await registerLearner({
              name: values.name.trim(),
              phone: normalizedPhone,
              email: values.email.trim().toLowerCase() || undefined,
              verificationToken,
              location,
            });

      const authenticatedRoute = getDefaultAuthenticatedRoute(
        stores.auth.user || { userType: response?.data?.userType, role: response?.data?.role }
      );

      openNotification({
        title: values.accountType === "admin" ? "Business workspace created" : "Learner account created",
        message: response?.message || (values.accountType === "admin" ? "Your company workspace is ready." : "Your learner account is ready."),
        type: "success",
        duration: 4000,
      });

      router.replace(redirectTarget || authenticatedRoute);
    } catch (error: any) {
      openNotification({ title: "Signup failed", message: error?.message || error?.error || "Unable to create your account.", type: "error" });
    }
  };

  const geocodePoint = async (point: { lat: number; lng: number }, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
    if (!isLoaded || !(window as any).google?.maps) {
      setLocationBusy(false);
      setLocationStatus("Pin selected. Fill the address fields manually.");
      return;
    }
    setLocationBusy(true);
    setLocationStatus("Resolving address from map pin...");
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ location: point }, (results: any[], status: string) => {
      setLocationBusy(false);
      if (status === "OK" && results?.[0]) {
        applyLocationToFormik(setFieldValue, buildLocationFromPlace(results[0], point));
        setLocationStatus("Address filled from the selected map point.");
      } else {
        setLocationStatus("Pin selected. Fill the address fields manually.");
      }
    });
  };

  const handlePlaceChanged = (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
    const place = autocomplete?.getPlace?.();
    const geometryLocation = place?.geometry?.location;
    if (!geometryLocation) {
      setLocationStatus("Choose a suggestion from the search list.");
      return;
    }
    const point = { lat: geometryLocation.lat(), lng: geometryLocation.lng() };
    const location = buildLocationFromPlace(place, point);
    setSelectedPoint(point);
    setMapCenter(point);
    applyLocationToFormik(setFieldValue, location);
    setLocationStatus("Location details filled from Google Places.");
  };

  const detectCurrentLocation = (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
    if (!navigator.geolocation) {
      openNotification({ title: "Location unavailable", message: "Your browser does not support current location detection.", type: "error" });
      return;
    }
    setLocationBusy(true);
    setLocationStatus("Requesting current location permission...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        setSelectedPoint(point);
        setMapCenter(point);
        setFieldValue("location.lat", point.lat);
        setFieldValue("location.lng", point.lng);
        await geocodePoint(point, setFieldValue);
      },
      () => {
        setLocationBusy(false);
        setLocationStatus("Permission was blocked. Search or fill the location manually.");
        openNotification({ title: "Could not read current location", message: "Please allow location access or search for the address.", type: "error" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const stepTitles: Record<Step, { eyebrow: string; title: string; sub: string }> = {
    phone: { eyebrow: "Step 1", title: "Let's start with your phone", sub: "We'll verify it with a one-time code." },
    otp: { eyebrow: "Step 2", title: "Verify your phone", sub: `Enter the code sent to +91 ${phone}.` },
    profile: { eyebrow: "About you", title: "Tell us who you are", sub: "This helps us personalize your workspace." },
    company: { eyebrow: "Company", title: "About your organization", sub: "Admins bring their team along." },
    location: { eyebrow: "Location", title: "Where are you based?", sub: "Helps us localize your experience." },
    review: { eyebrow: "Almost done", title: "Review & confirm", sub: "Give this a quick look before finishing." },
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {(formik) => {
        const { values, errors, touched, setFieldValue, handleChange, handleBlur, isSubmitting } = formik;
        const isAdmin = values.accountType === "admin";
        const stepsForType: Step[] = isAdmin
          ? ["phone", "otp", "profile", "company", "location", "review"]
          : ["phone", "otp", "profile", "location", "review"];
        const currentIdx = stepsForType.indexOf(step);
        
        const next = async () => {
          let fieldsToValidate: string[] = [];
          if (step === "profile") fieldsToValidate = ["name", "email"];
          if (step === "company") fieldsToValidate = ["companyName", "companyEmail"];
          if (step === "location") fieldsToValidate = ["location.address", "location.city", "location.state", "location.country", "location.postalCode"];

          if (fieldsToValidate.length > 0) {
            const formErrors = await formik.validateForm();
            fieldsToValidate.forEach((field) => formik.setFieldTouched(field, true, false));
            if (fieldsToValidate.some((field) => getIn(formErrors, field))) return;
          }
          setStep(stepsForType[Math.min(currentIdx + 1, stepsForType.length - 1)]);
        };
        const prev = () => setStep(stepsForType[Math.max(currentIdx - 1, 0)]);

        const { eyebrow, title, sub } = stepTitles[step];
        const animationProps = {
          initial: { opacity: 0, x: 24 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -24 },
          transition: { duration: 0.3 }
        };

        const renderStep = () => {
          switch (step) {
            case "phone":
              return (
                <motion.div key="phone" {...animationProps} className="space-y-5">
                  <AccountTypePicker value={values.accountType} onChange={(v) => setFieldValue("accountType", v)} />
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-foreground/80">Phone number</span>
                    <div className="group relative flex items-center rounded-2xl border border-input bg-zinc-50 dark:bg-zinc-800/50 transition-all focus-within:border-primary focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:ring-4 focus-within:ring-primary/15">
                      <div className="pl-4 pr-2 flex items-center gap-2 border-r border-border/70 h-14">
                        <span className="text-lg">🇮🇳</span>
                        <span className="text-sm font-semibold text-foreground/80">+91</span>
                      </div>
                      <Phone className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        autoFocus
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && phone) {
                            e.preventDefault();
                            sendOtp();
                          }
                        }}
                        className="min-w-0 flex-1 bg-transparent px-3 h-14 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
                      />
                    </div>
                  </label>
                  <PrimaryButton loading={busy} disabled={!phone} onClick={sendOtp}>
                    Send OTP <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                </motion.div>
              );
            case "otp":
              return (
                <motion.div key="otp" {...animationProps} className="space-y-5">
                  <OtpInput value={otp} onChange={setOtp} autoFocus />
                  <PrimaryButton loading={busy} disabled={otp.length !== 6} onClick={handleVerifyOtp}>
                    Verify <CheckCircle2 className="h-4 w-4" />
                  </PrimaryButton>
                  <div className="text-center text-xs text-muted-foreground">
                    {resendIn > 0 ? (
                      <>Resend in {resendIn}s</>
                    ) : (
                      <button type="button" onClick={sendOtp} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                        Resend OTP
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            case "profile":
              return (
                <motion.div key="profile" {...animationProps} className="space-y-5">
                  <Field icon={User} name="name" label="Full name" placeholder="Ada Lovelace" value={values.name} onChange={handleChange} onBlur={handleBlur} error={touched.name ? errors.name : undefined} autoFocus />
                  <Field icon={Mail} name="email" label="Email" type="email" placeholder="you@example.com" value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email ? errors.email : undefined} />
                  <PrimaryButton onClick={next}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                </motion.div>
              );
            case "company":
              return (
                <motion.div key="company" {...animationProps} className="space-y-5">
                  <Field icon={Building2} name="companyName" label="Company name" placeholder="Acme Inc." value={values.companyName} onChange={handleChange} onBlur={handleBlur} error={touched.companyName ? errors.companyName : undefined} autoFocus />
                  <Field icon={Mail} name="companyEmail" label="Company email" type="email" placeholder="team@acme.com" value={values.companyEmail} onChange={handleChange} onBlur={handleBlur} error={touched.companyEmail ? errors.companyEmail : undefined} />
                  <PrimaryButton onClick={next}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                </motion.div>
              );
            case "location":
              return (
                <motion.div key="location" {...animationProps} className="space-y-5">
                  <div className="rounded-2xl border border-border/70 overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-border/70">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{values.accountType === "admin" ? "Business location" : "Your location"}</div>
                        <div className="text-xs text-muted-foreground">{locationStatus}</div>
                      </div>
                      {locationBusy && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          {hasGoogleMapsKey && isLoaded && !loadError ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-input overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                              <Autocomplete onLoad={setAutocomplete} onPlaceChanged={() => handlePlaceChanged(setFieldValue)}>
                                <div className="relative flex items-center">
                                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                  <input placeholder="Search location with Google" className="w-full h-12 bg-transparent pl-9 pr-3 text-sm outline-none" />
                                </div>
                              </Autocomplete>
                            </div>
                          ) : (
                            <div className="relative flex items-center bg-zinc-50 rounded-xl border border-input overflow-hidden">
                              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                              <input readOnly placeholder={loadError ? "Google Maps could not load" : hasGoogleMapsKey ? "Google search is loading..." : "No Google Maps Key"} className="w-full h-12 bg-transparent pl-9 pr-3 text-sm outline-none opacity-60" />
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={() => detectCurrentLocation(setFieldValue)} className="h-12 px-4 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                          <LocateFixed className="h-4 w-4" /> Use current
                        </button>
                      </div>
                    </div>
                    <div className="h-[200px] bg-zinc-100 relative border-t border-border/70">
                      {hasGoogleMapsKey && isLoaded && !loadError ? (
                        <>
                          <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={selectedPoint ? 15 : 5}
                            options={mapOptions}
                            onClick={(event) => {
                              const lat = event.latLng?.lat();
                              const lng = event.latLng?.lng();
                              if (typeof lat !== "number" || typeof lng !== "number") return;
                              const point = { lat, lng };
                              setSelectedPoint(point);
                              setMapCenter(point);
                              setFieldValue("location.lat", lat);
                              setFieldValue("location.lng", lng);
                              geocodePoint(point, setFieldValue);
                            }}
                          >
                            {selectedPoint ? <MarkerF position={selectedPoint} /> : null}
                          </GoogleMap>
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md flex items-center gap-2 text-xs font-semibold">
                            <div className={`h-2 w-2 rounded-full ${selectedPoint ? "bg-emerald-500" : "bg-zinc-400"}`} />
                            <span className={selectedPoint ? "text-emerald-700" : "text-zinc-600"}>{selectedPoint ? `${selectedPoint.lat.toFixed(4)}, ${selectedPoint.lng.toFixed(4)}` : "No pin selected"}</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
                          {hasGoogleMapsKey && !loadError && <Loader2 className="h-5 w-5 animate-spin mb-2" />}
                          <div>{loadError ? "Google Maps failed to load." : "Google Maps is waiting for API key."}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Field name="location.address" label="Street address" placeholder="221B Baker Street" value={values.location.address} onChange={handleChange} onBlur={handleBlur} error={getIn(touched, "location.address") ? getIn(errors, "location.address") : undefined} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field name="location.city" label="City" placeholder="Bengaluru" value={values.location.city} onChange={handleChange} onBlur={handleBlur} error={getIn(touched, "location.city") ? getIn(errors, "location.city") : undefined} />
                    <Field name="location.state" label="State" placeholder="Karnataka" value={values.location.state} onChange={handleChange} onBlur={handleBlur} error={getIn(touched, "location.state") ? getIn(errors, "location.state") : undefined} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field name="location.postalCode" label="Pincode" placeholder="560001" value={values.location.postalCode} onChange={handleChange} onBlur={handleBlur} error={getIn(touched, "location.postalCode") ? getIn(errors, "location.postalCode") : undefined} />
                    <Field name="location.country" label="Country" placeholder="India" value={values.location.country} onChange={handleChange} onBlur={handleBlur} error={getIn(touched, "location.country") ? getIn(errors, "location.country") : undefined} />
                  </div>
                  <PrimaryButton onClick={next}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                </motion.div>
              );
            case "review":
              return (
                <motion.div key="review" {...animationProps} className="space-y-5">
                  <ReviewCard form={values} />
                  <label className="flex items-start gap-3 mt-4 p-4 rounded-xl border border-border/60 bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" checked={values.termsAccepted} onChange={(e) => setFieldValue("termsAccepted", e.target.checked)} />
                    <span className="text-sm text-foreground/90">I agree to the terms and conditions and confirm these signup details are correct.</span>
                  </label>
                  {touched.termsAccepted && errors.termsAccepted && <div className="text-xs text-red-500 mt-1">{errors.termsAccepted as string}</div>}
                  
                  <PrimaryButton loading={isSubmitting} disabled={!values.termsAccepted || isSubmitting} type="submit">
                    {isAdmin ? "Create workspace" : "Create account"} <CheckCircle2 className="h-4 w-4" />
                  </PrimaryButton>
                </motion.div>
              );
            default:
              return null;
          }
        };

        return (
          <Form noValidate onKeyDown={(e) => {
            // Prevent accidental form submission on Enter key (except for textareas or explicit submits)
            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}>
            <AuthLayout
              eyebrow="Create your account"
              title="Join a workspace built for learners and teams."
              subtitle="Set up in under a minute — phone verified, ready to go."
            >
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  {currentIdx > 0 ? (
                    <button type="button" onClick={prev} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  ) : (
                    <NextLink href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft className="h-3.5 w-3.5" /> Home
                    </NextLink>
                  )}
                  <StepDots total={stepsForType.length} current={currentIdx} />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" /> {eyebrow}
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl leading-[1.05] text-foreground font-bold">{title}</h1>
                  <p className="text-sm text-muted-foreground">{sub}</p>
                </div>

                <AnimatePresence mode="wait">
                  {renderStep()}
                </AnimatePresence>

                <div className="border-t border-border/60 pt-5 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <NextLink href={redirectTarget ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : "/login"} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    Sign in
                  </NextLink>
                </div>
              </motion.div>
            </AuthLayout>
          </Form>
        );
      }}
    </Formik>
  );
});

export default Register;

/* --- small building blocks --- */

function AccountTypePicker({ value, onChange }: { value: AccountType; onChange: (v: AccountType) => void }) {
  const items: Array<{ id: AccountType; label: string; sub: string; icon: typeof User }> = [
    { id: "learner", label: "Learner", sub: "Take courses", icon: GraduationCap },
    { id: "admin", label: "Admin", sub: "Manage a team", icon: Building2 },
  ];
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-foreground/80">I'm signing up as</span>
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((it) => {
          const active = value === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              className={`relative rounded-2xl border p-3.5 text-left transition-all ${
                active
                  ? "border-primary bg-primary/5 shadow-[0_0_0_4px_rgba(216,67,21,0.12)]"
                  : "border-input bg-zinc-50 dark:bg-zinc-800/50 hover:border-primary/40"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`h-9 w-9 shrink-0 rounded-xl grid place-items-center ${active ? "bg-primary text-primary-foreground" : "bg-white dark:bg-zinc-900 border border-input text-foreground/70"}`}>
                  <it.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">{it.label}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{it.sub}</div>
                </div>
              </div>
              {active && (
                <motion.div layoutId="typeCheck" className="absolute right-2.5 top-2.5 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  icon: Icon,
  type = "text",
  autoFocus,
}: {
  name: string;
  label: string;
  value: string;
  onChange: any;
  onBlur: any;
  error?: string | any;
  placeholder?: string;
  icon?: typeof User;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-foreground/80">{label}</span>
      <div className={`group relative flex items-center rounded-2xl border ${error ? "border-red-400 bg-red-50 dark:bg-red-900/10" : "border-input bg-zinc-50 dark:bg-zinc-800/50"} transition-all focus-within:border-primary focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:ring-4 focus-within:ring-primary/15`}>
        {Icon && <Icon className="ml-4 h-4 w-4 text-muted-foreground shrink-0" />}
        <input
          name={name}
          type={type}
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="min-w-0 flex-1 bg-transparent px-3 h-13 py-3.5 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      {error && <div className="mt-1.5 text-[11px] font-semibold text-red-500 ml-1">{error}</div>}
    </label>
  );
}

function ReviewCard({ form }: { form: SignupValues }) {
  const rows: Array<[string, string]> = [
    ["Account type", form.accountType === "admin" ? "Admin" : "Learner"],
    ["Name", form.name],
    ["Email", form.email],
    ["Phone", `+91 ${form.phone}`],
  ];
  if (form.accountType === "admin") {
    rows.push(
      ["Company", form.companyName],
      ["Company email", form.companyEmail],
      ["Location", `${form.location.address}, ${form.location.city}, ${form.location.state}`],
    );
  }
  return (
    <div className="rounded-2xl border border-border/70 bg-zinc-50 dark:bg-zinc-800/50 p-4 space-y-2.5">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 text-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground pt-0.5">{k}</div>
          <div className="font-medium text-foreground break-words">{v || "—"}</div>
        </div>
      ))}
    </div>
  );
}

function PrimaryButton({
  children,
  loading,
  disabled,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="relative w-full rounded-2xl bg-primary text-primary-foreground font-semibold text-sm h-[52px] shadow-lg transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 overflow-hidden"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </motion.button>
  );
}
