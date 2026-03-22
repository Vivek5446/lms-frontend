 // Updated validation schema for phoneNumbers, emails, addresses
 import * as Yup from "yup";

export const createValidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),

  addresses: Yup.object().shape({
    residential: Yup.string(),
    office: Yup.string(),
    other: Yup.string(),
  }),

  bankAccounts: Yup.array()
  .of(
    Yup.object().shape({
      accountHolder: Yup.string().required("Account holder name is required"),
      bankName: Yup.string().required("Bank name is required"),
      accountNumber: Yup.string()
        .matches(/^\d{9,18}$/, "Account number must be 9-18 digits")
        .required("Account number is required"),
      ifscCode: Yup.string()
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format")
        .required("IFSC code is required"),
      branch: Yup.string().required("Branch name is required"),
      primary: Yup.boolean().required("Primary field is required"),
    })
  )
  .min(0) // ✅ allows empty array
  .test(
    "one-primary-bank",
    "Exactly one bank account must be marked as primary",
    (accounts) => {
      if (!accounts || accounts.length === 0) return true; // ✅ empty allowed
      return accounts.filter((a) => a.primary).length === 1;
    }
  ),

  staffs: Yup.array().of(
    Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, "Phone must be a valid 10-digit Indian number"),
    })
  ),
});


export const updateValidationSchema = Yup.object({
    name: Yup.string().required("Name is required"),

  addresses: Yup.object().shape({
    residential: Yup.string().required("Residential address is required"),
    office: Yup.string(),
    other: Yup.string(),
  }),

  bankAccounts: Yup.array()
  .of(
    Yup.object().shape({
      accountHolder: Yup.string().required("Account holder name is required"),
      bankName: Yup.string().required("Bank name is required"),
      accountNumber: Yup.string()
        .matches(/^\d{9,18}$/, "Account number must be 9-18 digits")
        .required("Account number is required"),
      ifscCode: Yup.string()
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format")
        .required("IFSC code is required"),
      branch: Yup.string().required("Branch name is required"),
      primary: Yup.boolean().required("Primary field is required"),
    })
  )
  .min(0) // ✅ allows empty array
  .test(
    "one-primary-bank",
    "Exactly one bank account must be marked as primary",
    (accounts) => {
      if (!accounts || accounts.length === 0) return true; // ✅ empty allowed
      return accounts.filter((a) => a.primary).length === 1;
    }
  ),


  staffs: Yup.array().of(
    Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, "Phone must be a valid 10-digit Indian number"),
    })
  )
  });