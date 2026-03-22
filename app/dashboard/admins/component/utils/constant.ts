export const titles = [
  { label: "Mr.", value: "Mr." },
  { label: "Mrs.", value: "Mrs." },
  { label: "Ms.", value: "Ms." },
  { label: "Dr.", value: "Dr." },
];

export const initialValues = {
  title: titles[0],
  name: "",
  username: "",
  languages: [],
  address: "",
  bio: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  code: "",
  pic: { file: [] },

  // NEW FIELDS
  companyName: "",
  companyCode: "",
  companyType: "company",
  addressInfo: [
    {
      address: "",
      country: "",
      state: "",
      city: "",
      pinCode: "",
    },
  ],
};
