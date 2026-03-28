import { Box, Heading } from "@chakra-ui/react";
import StepsComponent from "./element/StepsComponent";
import CustomSubHeading from "../../../../component/common/CustomSubHeading/CustomSubHeading";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";


const SupervisionHowWeWork = () => {
  const steps = [
    {
      id: "01",
      title: "Choose Your Supervision Style",
      description:
        "Decide whether you prefer individual or group supervision. Both options offer a supportive space to discuss your clinical experiences and enhance your skills.",
      image: "https://res.cloudinary.com/dekfm4tfh/image/upload/v1747751897/Group_1000003267_sypazx.png",
      imageStyles: { mt: -6, h: "200px", w: "340px" }
    },
    {
      id: "02",
      title: "Connect with the Right Supervisor",
      description:
        "Fill out our enquiry form, and we'll help match you with a supervisor. We consider factors like specialties, therapeutic approaches, and experience to ensure a good fit.",
      image: "https://res.cloudinary.com/dekfm4tfh/image/upload/v1746619518/Group_427320816_1_pkf9tx.png",
      imageStyles: { ml: "2rem", mt: -2, h: "200px", w: "300px" }
    },
    {
      id: "03",
      title: "Begin Supervision",
      description:
        "Start your supervision sessions at your convenience, either online or offline.",
      image: "https://res.cloudinary.com/dekfm4tfh/image/upload/v1746619522/Group_427320822_eudm1g.png",
      imageStyles: { ml: "2rem", mt: "-2rem", h: "200px", w: "288px" }
    },
  ];
  return (
    <Box my={20} maxW={{ base: "90%", md: "80%", lg: "80%", xl: "75%" }} mx={"auto"}>
      <CustomSmallTitle> HOW WE WORK</CustomSmallTitle>
      <CustomSubHeading
        fontSize={{ base: "24px", md: "42px" }}
        fontWeight={400}
        textAlign={"center"}
        highlightText="Get Started"
      >
        Here’s How You Can
      </CustomSubHeading>
      <Heading
        fontSize={{ base: "24px", md: "44px" }}
        as={"h2"}
        fontWeight={600}
        textAlign={"center"}
      >
        {/* Outcome-driven therapy. */}
      </Heading>
      <Box mt={{ base: 8, lg: 14 }}>
        <StepsComponent steps={steps} />
      </Box>
    </Box>
  );
};

export default SupervisionHowWeWork;