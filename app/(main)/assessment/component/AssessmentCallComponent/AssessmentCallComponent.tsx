import { Box, Button, Center, Image, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import EnquireFormModal from "../../../../component/common/EnquireFormModal/EnquireFormModal"; // Import the EnquireFormModal

const AssessmentCallComponent = () => {
  const [isOpen, setIsOpen] = useState(false); // Manage modal open/close state

  return (
    <Box bg={"#FFF1F0"} position="relative" overflow="hidden">
      <Image
        src="images/shape1.png"
        transform={"scaleX(-1)"}
        w={["5rem", "10rem", "12rem"]}
        h={["4rem", "8rem", "10rem"]}
        position={"absolute"}
        right={"0"}
        top={"0"}
        alt="Best Dental in greater noida"
      />
      <Box
        bgGradient={"linear(to-r, #045B64, #066D77)"}
        py={["2rem", "3rem"]}
        px={{ base: "1rem", md: "2rem", lg: "7.5rem" }}
        color={"#FFFFFF"}
      >
        <Text textAlign={"center"} fontSize={["14px", "16px", "18px"]}></Text>
        <CustomSmallTitle textAlign={{ base: "center" }}>
          STILL UNSURE!
        </CustomSmallTitle>
        <Text textAlign={"center"} fontSize={["24px", "32px", "34px"]} px={6}>
          Need Help Choosing the Right Test?
        </Text>
        <Text textAlign={"center"} fontSize={["12px", "14px", "18px"]} px={6}>
          Let our experts guide you.
        </Text>
        <Center>
          <Button
            bg={"#FFB8B2"}
            color={"black"}
            fontWeight={500}
            h={["40px", "45px", "52px"]}
            w={["120px", "140px", "170px"]}
            mt={4}
            shadow={"xl"}
            fontSize={["12px", "14px", "16px"]}
            _hover={{ bg: "#FFB8B2", transform: "scale(1.05)" }}
            onClick={() => setIsOpen(true)} // Set state to open modal
          >
            Send an enquiry
          </Button>
          {/* Enquire Form Modal */}
          <EnquireFormModal
            isOpen={isOpen} // Modal visibility controlled by state
            onClose={() => setIsOpen(false)} // Close modal
          />
        </Center>
      </Box>
      <Image
        src="images/shape1.png"
        w={["5rem", "10rem", "12rem"]}
        h={["4rem", "8rem", "10rem"]}
        position={"absolute"}
        left={"0"}
        bottom={"0"}
        alt="Mental Health Doctor In Noida"
      />
    </Box>
  );
};

export default AssessmentCallComponent;
