// Updated validation schema for phoneNumbers, emails, addresses
import * as Yup from "yup";

export const createValidationSchema = Yup.object({
  title: Yup.mixed().required("Title is required"),
  pic: Yup.mixed(),
  gender: Yup.mixed().required("Gender is required"),
  dob: Yup.mixed(),
  name: Yup.string().required("Name is required"),
  phones: Yup.array().of(
    Yup.object().shape({
      number: Yup.string(),
    })
  ),
  emails: Yup.array().of(
    Yup.object().shape({
      email: Yup.string(),
    })
  ),
  addresses: Yup.object().shape({
    residential: Yup.string(),
    office: Yup.string(),
    other: Yup.string(),
  }),
  languages: Yup.array(),
  bio: Yup.string(),
  medicalHistory: Yup.mixed(),
  password: Yup.string(),
  confirmPassword: Yup.string(),
  code: Yup.string().optional(),
});

export const updateValidationSchema = Yup.object({
  title: Yup.mixed().required("Title is required"),
    name: Yup.string().required("Name is required"),
  pic: Yup.mixed(),
  gender: Yup.mixed().required("Gender is required"),
  phones: Yup.array()
    .of(
      Yup.object().shape({
        number: Yup.string()})
    ),
  emails: Yup.array().of(
    Yup.object().shape({
      email: Yup.string(),
    })
  ),
  addresses: Yup.object().shape({
    residential: Yup.string(),
    office: Yup.string(),
    other: Yup.string(),
  }),
  languages: Yup.array(),
  bio: Yup.string(),
  medicalHistory: Yup.mixed(),
  // insurances: Yup.array().of(
  //   Yup.object().shape({
  //     // type: Yup.mixed(),
  //     startDate: Yup.string(),
  //     renewalDate: Yup.string(),
  //     amountInsured: Yup.number()
  //       .positive("Amount insured must be positive")
  //       .typeError("Amount insured must be a valid number"),
  //     amountPaid: Yup.number()
  //       .min(0, "Amount paid cannot be negative")
  //       .typeError("Amount paid must be a valid number"),
  //     remarks: Yup.string().nullable(),
  //   })
  // ),
});