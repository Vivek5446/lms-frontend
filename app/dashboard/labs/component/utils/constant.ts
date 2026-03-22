export const titles = [
  { label: "Mr.", value: "Mr." },
  { label: "Mrs.", value: "Mrs." },
  { label: "Ms.", value: "Ms." },
  { label: "Dr.", value: "Dr." },
]

export const initialValues = {
  name: "",
  addresses: {
    residential: "",
    office: "",
    other: "",
  },
  staffs: [
    {
      name: "",
      email: "",
      phone: "",
    },
  ],
  bankAccounts: [],
  items: [
  {
    patientName:undefined,
    itemName: "",
    itemCode: "",
    quantity: 0,
    price: 0,
    total: 0,
    add : 1,
    delete:0
  }
]
};