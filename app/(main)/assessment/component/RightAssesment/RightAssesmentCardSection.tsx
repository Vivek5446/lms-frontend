import { useState } from "react";
import { ChevronRightIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Grid, Text } from "@chakra-ui/react";

// TypeScript interfaces for the content
interface AssessmentCard {
  id: number;
  title: string;
  description: string;
}

interface AssessmentGridProps {
  cards: AssessmentCard[];
  isMobile: boolean;
  isTablet: boolean;
}

const AssessmentGrid = ({ cards, isMobile, isTablet }: AssessmentGridProps) => {  
  // Add state to track expanded cards
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  
  // Function to toggle expanded state of a card
  const toggleCardExpansion = (index: number) => {
    setExpandedCards(prevState => {
      if (prevState.includes(index)) {
        return prevState.filter(i => i !== index);
      } else {
        return [...prevState, index];
      }
    });
  };

  // Handle empty or undefined cards
  if (!cards || cards.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text color="#757575">No assessment cards available.</Text>
      </Box>
    );
  }
  
  return (  
    <Flex position="relative" direction="column" h="100%">  
      <Grid   
        templateColumns={{ 
          base: "1fr", 
          md: isTablet ? "1fr" : "1fr 1fr", 
          lg: "1fr 1fr" 
        }}   
        gap={4}   
        maxH={{ base: "auto", md: "36rem" }}   
        overflowY={{ base: "visible", md: "auto" }}  
        css={{  
          '&::-webkit-scrollbar': {  
            width: '4px',  
            display: 'none',  
          },  
          '&::-webkit-scrollbar-track': {  
            width: '6px',  
          },  
          '&::-webkit-scrollbar-thumb': {  
            background: '#E2E8F0',  
            borderRadius: '24px',  
          },  
        }}  
      >  
        {cards.map((item, index) => {
          const isExpanded = expandedCards.includes(index);
          
          return (  
            <Box  
              key={item.id || index}  
              p={4}  
              pb={5}  
              rounded={"2xl"}  
              _hover={{  
                borderBottom: "2px solid #FFB8B2",  
                shadow: 'lg'  
              }}  
              transition={"all 0.3s ease-in-out"}  
              bg="white"
            >  
              <Text  
                fontWeight={500}  
                fontSize={{ base: "md", md: "lg" }}  
                transition="color 0.2s ease"  
                noOfLines={isExpanded ? undefined : 3}  
              >  
                {item.title}  
              </Text>  
              <Text   
                fontSize={"sm"}   
                color={"#757575"}   
                my={2}  
                noOfLines={isExpanded ? undefined : 3}  
              >  
                {item.description}  
              </Text>  
              <Button  
                color={"brand.100"}  
                variant={"link"}  
                mt={2}  
                mb={1}  
                fontWeight={500}  
                rightIcon={isExpanded ? <ChevronUpIcon /> : <ChevronRightIcon />}  
                size={"sm"}
                onClick={() => toggleCardExpansion(index)}
                _hover={{
                  textDecoration: "none",
                  transform: "translateX(2px)"
                }}
                transition="transform 0.2s ease"
              >  
                {isExpanded ? "Show Less" : "Read More"}  
              </Button>  
            </Box>  
          );
        })}  
      </Grid>  
      
      {/* Fading overlay at bottom - only for desktop */}
      {!isMobile && (
        <Box  
          position="absolute"  
          bottom="0"  
          left="0"  
          right="0"  
          height="100px"  
          background="linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,0) 100%)"  
          pointerEvents="none"  
        />  
      )}
    </Flex>  
  );  
};  

export default AssessmentGrid;