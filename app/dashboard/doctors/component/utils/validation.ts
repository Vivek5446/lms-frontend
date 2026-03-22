 // Updated validation schema for phoneNumbers, emails, addresses
 import * as Yup from "yup";

 export const createValidationSchema = Yup.object({
    title: Yup.mixed().required("Title is required"),
    pic: Yup.mixed(),
        gender: Yup.mixed().required("Gender is required"),
    dob: Yup.mixed().required('dob  is required'),
    name: Yup.string().required("Name is required"),
    phones: Yup.array()
  .of(
    Yup.object().shape({
      number: Yup.string()})
  //     .when("primary", {
  //       is: true,
  //       then: (schema) =>
  //         schema
  //           .matches(
  //             /^(?:\+?[0-9]{1,3})?[-.\s]?[0-9]{10}$/,
  //             "Phone number is not valid"
  //           )
  //           .required("Phone number is required"),
  //       otherwise: (schema) =>
  //         schema
  //           .matches(
  //             /^(?:\+?[0-9]{1,3})?[-.\s]?[0-9]{10}$/,
  //             {
  //               message: "Phone number is not valid",
  //               excludeEmptyString: true, // Skip regex validation for empty strings
  //             }
  //           )
  //           .optional() // Explicitly optional
  //           .nullable(), // Allow null
  //     }),
  //     primary: Yup.boolean().required("Primary field is required"),
  //   })
  // )
  // .required("At least one phone number is required")
  // .min(1, "At least one phone number is required")
  // .test(
  //   "one-primary-phone",
  //   "Exactly one phone must be marked as primary",
  //   (phones) => {
  //     if (!phones || phones.length === 0) return false;
  //     return phones.filter((p) => p.primary).length === 1;
  //   }
  ),
   emails: Yup.array()
    .of(
      Yup.object().shape({
        email: Yup.string()})
    //     .when("primary", {
    //       is: true,
    //       then: (schema) =>
    //         schema
    //           .email("Invalid email address")
    //           .required("Email is required"),
    //       otherwise: (schema) =>
    //         schema
    //           .email("Invalid email address")
    //           .optional()
    //           .nullable(),
    //     }),
    //     primary: Yup.boolean().required("Primary field is required"),
    //   })
    // )
    // .required("At least one email is required")
    // .min(1, "At least one email is required")
    // .test(
    //   "one-primary-email",
    //   "Exactly one email must be marked as primary",
    //   (emails) => {
    //     if (!emails || emails.length === 0) return false;
    //     return emails.filter((e) => e.primary).length === 1;
    //   }
    ),
    addresses: Yup.object().shape({
      residential: Yup.string(),
      office: Yup.string(),
      other: Yup.string(),
    }),
    languages: Yup.array(),
    bio: Yup.string(),
    medicalHistory: Yup.string(),
   password: Yup.string(),
    // .min(6, "Password must be at least 6 characters")
    // .required("Password is required"),

  confirmPassword: Yup.string()
    // .required("Confirm password is required")
    // .oneOf([Yup.ref("password"), null], "Passwords must match"),
    // vaccinations: Yup.array().of(
    //   Yup.object().shape({
    //     type: Yup.mixed().required("Vaccine type is required"),
    //     dateAdministered: Yup.string().required(
    //       "Date administered is required"
    //     ),
    //     nextDueDate: Yup.string().nullable(),
    //     reminder: Yup.mixed(),
    //     remarks: Yup.string().nullable(),
    //   })
    // ),
    // insurances: Yup.array().of(
    //   Yup.object().shape({
    //     type: Yup.mixed().required("Insurance type is required"),
    //     startDate: Yup.string().required("Start date is required"),
    //     renewalDate: Yup.string().required("Renewal date is required"),
    //     amountInsured: Yup.number()
    //       .required("Amount insured is required")
    //       .positive("Amount insured must be positive")
    //       .typeError("Amount insured must be a valid number"),
    //     amountPaid: Yup.number()
    //       .required("Amount paid is required")
    //       .min(0, "Amount paid cannot be negative")
    //       .typeError("Amount paid must be a valid number"),
    //     remarks: Yup.string().nullable(),
    //   })
    // ),
    // bankAccounts: Yup.array()
    // .of(
    //   Yup.object().shape({
    //     accountHolder: Yup.string().required("Account holder name is required"),
    //     bankName: Yup.string().required("Bank name is required"),
    //     accountNumber: Yup.string()
    //       .matches(/^\d{9,18}$/, "Account number must be 9-18 digits")
    //       .required("Account number is required"),
    //     ifscCode: Yup.string()
    //       .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format")
    //       .required("IFSC code is required"),
    //     branch: Yup.string().required("Branch name is required"),
    //     primary: Yup.boolean().required("Primary field is required"),
    //   })
    // )
  });

export const updateValidationSchema = Yup.object({
    title: Yup.mixed().required("Title is required"),
    pic: Yup.mixed(),
    gender: Yup.mixed().required("Gender is required"),
    phones: Yup.array()
  .of(
    Yup.object().shape({
      number: Yup.string()})
  //     .when("primary", {
  //       is: true,
  //       then: (schema) =>
  //         schema
  //           .matches(
  //             /^(?:\+?[0-9]{1,3})?[-.\s]?[0-9]{10}$/,
  //             "Phone number is not valid"
  //           )
  //           .required("Phone number is required"),
  //       otherwise: (schema) =>
  //         schema
  //           .matches(
  //             /^(?:\+?[0-9]{1,3})?[-.\s]?[0-9]{10}$/,
  //             {
  //               message: "Phone number is not valid",
  //               excludeEmptyString: true, // Skip regex validation for empty strings
  //             }
  //           )
  //           .optional() // Explicitly optional
  //           .nullable(), // Allow null
  //     }),
  //     primary: Yup.boolean().required("Primary field is required"),
  //   })
  // )
  // .required("At least one phone number is required")
  // .min(1, "At least one phone number is required")
  // .test(
  //   "one-primary-phone",
  //   "Exactly one phone must be marked as primary",
  //   (phones) => {
  //     if (!phones || phones.length === 0) return false;
  //     return phones.filter((p) => p.primary).length === 1;
  //   }
  ),
   emails: Yup.array()
    .of(
      Yup.object().shape({
        email: Yup.string()})
    //     .when("primary", {
    //       is: true,
    //       then: (schema) =>
    //         schema
    //           .email("Invalid email address")
    //           .required("Email is required"),
    //       otherwise: (schema) =>
    //         schema
    //           .email("Invalid email address")
    //           .optional()
    //           .nullable(),
    //     }),
    //     primary: Yup.boolean().required("Primary field is required"),
    //   })
    // )
    // .required("At least one email is required")
    // .min(1, "At least one email is required")
    // .test(
    //   "one-primary-email",
    //   "Exactly one email must be marked as primary",
    //   (emails) => {
    //     if (!emails || emails.length === 0) return false;
    //     return emails.filter((e) => e.primary).length === 1;
    //   }
    ),
    addresses: Yup.object().shape({
      residential: Yup.string(),
      office: Yup.string(),
      other: Yup.string(),
    }),
    languages: Yup.array(),
    bio: Yup.string(),
    medicalHistory: Yup.string(),
    // vaccinations: Yup.array().of(
    //   Yup.object().shape({
    //     type: Yup.mixed().required("Vaccine type is required"),
    //     dateAdministered: Yup.string().required(
    //       "Date administered is required"
    //     ),
    //     nextDueDate: Yup.string().nullable(),
    //     reminder: Yup.mixed(),
    //     remarks: Yup.string().nullable(),
    //   })
    // ),
    // insurances: Yup.array().of(
    //   Yup.object().shape({
    //     type: Yup.mixed().required("Insurance type is required"),
    //     startDate: Yup.string().required("Start date is required"),
    //     renewalDate: Yup.string().required("Renewal date is required"),
    //     amountInsured: Yup.number()
    //       .required("Amount insured is required")
    //       .positive("Amount insured must be positive")
    //       .typeError("Amount insured must be a valid number"),
    //     amountPaid: Yup.number()
    //       .required("Amount paid is required")
    //       .min(0, "Amount paid cannot be negative")
    //       .typeError("Amount paid must be a valid number"),
    //     remarks: Yup.string().nullable(),
    //   })
    // ),
    // bankAccounts: Yup.array()
    // .of(
    //   Yup.object().shape({
    //     accountHolder: Yup.string().required("Account holder name is required"),
    //     bankName: Yup.string().required("Bank name is required"),
    //     accountNumber: Yup.string()
    //       .matches(/^\d{9,18}$/, "Account number must be 9-18 digits")
    //       .required("Account number is required"),
    //     ifscCode: Yup.string()
    //       .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format")
    //       .required("IFSC code is required"),
    //     branch: Yup.string().required("Branch name is required"),
    //     primary: Yup.boolean().required("Primary field is required"),
    //   })
    // )
  });