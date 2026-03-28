"use client"
import { Box, Button, Card, CardBody, Container, Flex, Grid, Heading, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';
// import AssessmentForm from './component/DepressionTest/DepressionTest';
// import ASRMTest from './component/SelfAssesmentPage';
// import { Anxiety, AnxietyinterpretScore, depressionQuestions, interpretDepressionScore, OCIRgetScoreSeverity, ocirQuestions, traumainterpretscore, traumaQuestions } from './component/utils/constant';
import AssessmentForm from '../(selfAssessment)/component/DepressionTest/DepressionTest';
import { adhdDichotomousQuestions, Anxiety, AnxietyinterpretScore, depressionQuestions, interpretAdhdDichotomousScore, interpretDepressionScore, OCIRgetScoreSeverity, ocirQuestions, traumainterpretscore, traumaQuestions } from '../(selfAssessment)/component/utils/constant';
import ASRMTest from '../(selfAssessment)/component/SelfAssessmentPage';
import { FiUser, FiClipboard, FiCheckCircle, FiArrowLeft, FiHeart } from 'react-icons/fi';
import { HiOutlineAdjustments } from 'react-icons/hi';
import { MdOutlinePsychology, MdPsychology } from 'react-icons/md';
import { useParams } from 'next/navigation';

interface AssessmentCardProps {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
}

const assessments = [
  {
    id: 'bipolar',
    title: 'Bipolar Disorder',
    icon: FiUser, // More neutral than alert
    component: <ASRMTest />,
    color: 'teal.400'
  },
  {
    id: 'depression',
    title: 'Depression',
    icon: FiClipboard, // Represents a form/survey neutrally
    component: <AssessmentForm
      title="Instructions"
      description="Over the last 2 weeks, how often have you been bothered by the following problems?"
      questions={depressionQuestions}
      interpretScore={interpretDepressionScore}
    />,
    color: 'teal.500'
  },
  {
    id: 'adhd',
    title: 'ADHD Screening',
    icon: MdPsychology, // Suggests lightness/clarity
    component: <AssessmentForm
      title="Instructions"
      description="Please answer the questions below, rating yourself on each of the criteria shown. As you answer each question, select the box that best describes how you have felt and conducted yourself over the past 6 months."
      questions={adhdDichotomousQuestions}
      interpretScore={interpretAdhdDichotomousScore}
    />,
    color: 'teal.500'
  },
  {
    id: 'bai',
    title: 'Anxiety',
    icon: FiCheckCircle, // Suggests progress/approval, softer than activity
    component: <AssessmentForm
      title="Instructions"
      description="Below is a list of common symptoms of anxiety. Please indicate how much you have been bothered by each symptom during the past month."
      questions={Anxiety}
      interpretScore={AnxietyinterpretScore}
    />,
    color: 'teal.600'
  },
  {
    id: 'trauma',
    title: 'Trauma',
    icon: HiOutlineAdjustments, // Suggests regulation and balance
    component: <AssessmentForm
      title="Instructions"
      description="Below are a number of problems that people sometimes report in response to traumatic or stressful life events. Please select the option that best describes how much you have been bothered by that problem IN THE PAST MONTH."
      questions={traumaQuestions}
      interpretScore={traumainterpretscore}
    />,
    color: 'teal.300'
  },
  {
    id: 'ocir',
    title: 'OCD - Obsessive Compulsive Disorder',
    icon: MdOutlinePsychology, // Relevant but soft visual
    component: <AssessmentForm
      title="Instructions"
      description="The following statements refer to experiences that many people have in their everyday lives. Rate how much each experience has distressed or bothered you during the past month."
      questions={ocirQuestions}
      interpretScore={OCIRgetScoreSeverity}
    />,
    color: 'teal.700'
  },
];

const AssessmentCard = ({ title, description, icon, onClick }: AssessmentCardProps) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('teal.50', 'gray.600');

  return (
    <Card
      bg={cardBg}
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'xl',
        bg: hoverBg,
        borderColor: 'teal.300',
        borderWidth: '1px'
      }}
      transition="all 0.3s cubic-bezier(.25,.8,.25,1)"
      cursor="pointer"
      onClick={onClick}
      height="100%"
      borderWidth="1px"
      borderColor="gray.100"
    >
      <CardBody p={6}>
        <Flex direction="column" align="center" textAlign="center" gap={4}>
          <Flex
            align="center"
            justify="center"
            w={16}
            h={16}
            borderRadius="full"
            bg="teal.50"
            color="teal.500"
          >
            <Icon as={icon} boxSize={6} />
          </Flex>
          <Box>
            <Heading size="md" mb={2} color="teal.700">{title}</Heading>
            <Text fontSize="sm" color="gray.500">{description}</Text>
          </Box>
          <Button
            mt={2}
            size="sm"
            colorScheme="teal"
            variant="outline"
            rightIcon={<FiCheckCircle />}
          >
            Start Test
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
};

const Page = () => {
  const params = useParams();
  const assesment = params.assesment as string; // Assuming your folder is /condition/[slug]/page.tsx
  const [selectedTest, setSelectedTest] = useState<string | null>(assesment || null);
  const pageBg = useColorModeValue('pink.50', 'gray.900'); // Only this line changed to pink.50

  const selectedAssessment = assessments.find(a => a.id === selectedTest);

  return (
    <Box minH="100vh" bg={pageBg} py={12}>
      <Container maxW="7xl" px={[4, 8]}>
        {!selectedTest ? (
          <Box>
            <Box textAlign="center" mb={16}>
              <Heading size="2xl" mb={4} color="teal.600">
                Take a Free Self-Assessment
              </Heading>
              <Text fontSize={{ base: "15px", lg: "xl" }} maxW="5xl" mx="auto" color="gray.500">
                Take a short, confidential self-assessment to understand what you might be going through.
                It&apos;s not a diagnosis, but a helpful first step in making sense of your thoughts, feelings, and struggles.
                Your answers stay private, and we&apos;ll gently guide you towards the support you may need through our Psychological Assessment in Noida.

              </Text>
            </Box>

            <Grid
              templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
              gap={8}
              mb={16}
            >
              {assessments.map((assessment) => (
                <AssessmentCard
                  key={assessment.id}
                  title={assessment.title}
                  icon={assessment.icon}
                  onClick={() => setSelectedTest(assessment.id)}
                  description={''}
                />
              ))}
            </Grid>

            <Box
              bg="teal.50"
              p={8}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="teal.100"
              textAlign="center"
            >
              <Icon as={FiHeart} boxSize={8} color="teal.500" mb={4} />
              <Heading size="md" mb={2} color="teal.700">About These Assessments</Heading>
              <Text maxW="2xl" mx="auto" color="gray.600">
                These clinical screening tools can help identify symptoms but are not diagnostic.
                Always consult with a healthcare professional for clinical evaluation.
              </Text>
            </Box>
          </Box>
        ) : (
          <Box>
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              colorScheme="teal"
              mb={8}
              onClick={() => setSelectedTest(null)}
            >
              Back to All Assessments
            </Button>

            <Box
              bg="white"
              p={[6, 10]}
              borderRadius="2xl"
              boxShadow="md"
              borderWidth="1px"
              borderColor="gray.100"
            >
              {selectedAssessment?.component}
            </Box>

            <Box mt={8} textAlign="center">
              <Text color="gray.500" fontSize="sm">
                Your responses are confidential and anonymous
              </Text>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Page;