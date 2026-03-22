import { genderOptions } from "../../../../config/constant";

export const titles = [
  { label: "Mr.", value: "Mr." },
  { label: "Mrs.", value: "Mrs." },
  { label: "Ms.", value: "Ms." },
  { label: "Dr.", value: "Dr." },
]

export const initialValues = {
  title: titles[0],
  name: "",
  backgroundVideo: "",
  dob:"",
  gender:genderOptions[0],
  languages: ['english'],
  addresses: {
    residential: "",
    office: "",
    other: "",
  },
  bio: "",
  password: "",
  refrenceBy:null,
  confirmPassword: "",
  phones: [
    { number: "", primary: true },
    { number: "", primary: false },
    { number: "", primary: false },
    { number: "", primary: false },
  ],
  emails: [
    { email: "", primary: true },
    { email: "", primary: false },
  ],
  pic: { file: [] },
  insurances: [],
   degreeInfo: [
    { name: "", universary: "", year : "" }
   ],
  medicalHistory: {
    allergies: { checked: false, text: "" },
    bloodPressure: { option: "", text: "" },
    heartDisease: { checked: false, text: "" },
    pacemaker: { checked: false, text: "" },
    pacemakerMeds: {
      aspirin: false,
      anticoagulants: false,
      bloodPressureMeds: false,
      nitroglycerin: false,
    },
    diabetes: { checked: false, text: "", insulin: false },
    asthma: { option: "", text: "" },
    artificialJointOrValve: { option: "", text: "" },
    thyroid: { option: "", type: "", text: "" }, // Added thyroid field
    kidneyDisease: { option: "", text: "" },
    tuberculosis: { option: "", text: "" },
    hepatitis: { option: "", text: "" },
    bloodTransfusion: { option: "", text: "" },
    cancer: { option: "", text: "" },
    neurologicCondition: { option: "", text: "" },
    epilepsy: { option: "", text: "" },
    aids: { option: "", text: "" },
    hiv: { option: "", text: "" },
    anaemia: { option: "", text: "" },
    otherMedicalIssue: { option: "", text: "" },
    smoking: { option: "", text: "" },
    chewingTobacco: { option: "", text: "" },
    alcohol: { option: "", text: "" },
    medications: {
      antibiotics: false,
      antidepressants: false,
      steroids: false,
      osteoporosisMeds: false,
      other1: "",
      other2: "",
    },
    women: {
    pregnant: false, // Checkbox for pregnancy
    dueDate: "", // Text input for expected delivery date
    breastFeeding: false, // Checkbox for breast feeding
    pcodPcos: { option: "", text: "" }, // Radio group (yes/no) with details for PCOD/PCOS
    hormones: false, // Existing field for hormones
  },
  }
};