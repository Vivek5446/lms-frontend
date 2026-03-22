export interface StepData {
  id: number;
  stepNumber: string;
  title: string;
  description: string;
  imageUrl: string;
  bg?: string
}


export const dummyStepData: StepData[] = [
  {
    id: 1,
    stepNumber: 'STEP 1',
    title: 'Find the best therapist fit',
    description: 'Explore concerns from our list of conditions and find a licensed therapist that suits your needs.',
    imageUrl: "https://res.cloudinary.com/dekfm4tfh/video/upload/v1743916395/step1_ed_osvyhf.mp4",
    bg: "red.100"
  },
  {
    id: 2,
    stepNumber: 'STEP 2',
    title: 'Schedule a Session',
    description: 'Choose a time that fits your schedule and book your appointment with ease.',
    imageUrl: 'https://res.cloudinary.com/dekfm4tfh/video/upload/v1743916395/STEP_2_Fin_ec3hiy.mp4',
    bg: "#EAF475"
  },
  {
    id: 3,
    stepNumber: 'STEP 3',
    title: 'Begin Therapy',
    description: 'Meet your therapist online, in-person or both – whatever is convenient for you. Discuss your concerns in the session and begin with your personalized care plan.',
    imageUrl: 'https://res.cloudinary.com/dekfm4tfh/video/upload/v1743916395/STEP_3_dtqnc8.mp4',
    bg: "#86C6F4"
  },
  {
    id: 4,
    stepNumber: 'STEP 4',
    title: 'Continued support on the go',
    description: 'Get your own account for private and convenient access to ongoing support to help you feel better – right at your fingertips.',
    imageUrl: 'https://res.cloudinary.com/dekfm4tfh/video/upload/v1743916394/STEP_4_vewyds.mp4',
    bg: "#9DEAB2"
  },
];