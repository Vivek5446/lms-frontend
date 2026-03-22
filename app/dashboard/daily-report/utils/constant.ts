

// --- Configuration & Mock Data ---

export const OPENING_HOUR = 10;
export const CLOSING_HOUR = 18; // 6 PM
export const SLOT_DURATION = 30; // minutes

// Chair Configurations
export const CHAIRS = [
  {
    id: "c1",
    name: "Chair 1 - Ortho",
    color: "#3b82f6",
    bg: "blue.50",
    border: "blue.500",
    text: "blue.700",
  },
  {
    id: "c2",
    name: "Chair 2 - Surgery",
    color: "#ef4444",
    bg: "red.50",
    border: "red.500",
    text: "red.700",
  },
  {
    id: "c3",
    name: "Chair 3 - General",
    color: "#10b981",
    bg: "green.50",
    border: "green.500",
    text: "green.700",
  },
  {
    id: "c4",
    name: "Chair 4 - Hygiene",
    color: "#8b5cf6",
    bg: "purple.50",
    border: "purple.500",
    text: "purple.700",
  },

];

// Mock Appointments for "Today"
export const INITIAL_APPOINTMENTS = [
  {
    id: 101,
    chairId: "c1",
    patientName: "Sarah Jenkins",
    treatment: "Braces Adjustment",
    notes: "Tightening upper arch wire.",
    startTime: "10:00",
    duration: 60, // minutes
    status: "In Progress",
  },
  {
    id: 102,
    chairId: "c2",
    patientName: "Mike Ross",
    treatment: "Wisdom Tooth Extraction",
    notes: "Requires local anesthesia.",
    startTime: "11:30",
    duration: 90,
    status: "Scheduled",
  },
  {
    id: 103,
    chairId: "c3",
    patientName: "Emily Clark",
    treatment: "Routine Checkup",
    notes: "Patient reports sensitivity.",
    startTime: "10:30",
    duration: 30,
    status: "Completed",
  },
  {
    id: 104,
    chairId: "c1",
    patientName: "John Doe",
    treatment: "Invisalign Scan",
    notes: "New patient consultation.",
    startTime: "13:00",
    duration: 60,
    status: "Scheduled",
  },
  {
    id: 105,
    chairId: "c4",
    patientName: "Linda Mayer",
    treatment: "Deep Cleaning",
    notes: "Focus on lower quadrant.",
    startTime: "14:00",
    duration: 60,
    status: "Scheduled",
  },
  {
    id: 106,
    chairId: "c3",
    patientName: "Robert Stone",
    treatment: "Cavity Filling",
    notes: "Tooth #14 surface.",
    startTime: "15:30",
    duration: 45, // Will round up visually
    status: "Scheduled",
  },
];