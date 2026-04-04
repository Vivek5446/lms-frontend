'use client';

import MyCoursesBoard from '@/app/(main)/course/component/MyCoursesBoard';
import { isLearnerRole } from '@/app/config/utils/roleAccess';
import stores from '@/app/store/stores';
import {
  AspectRatio,
  Box,
  Button,
  Checkbox,
  Circle,
  Drawer, DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader, DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  SimpleGrid,
  Stack,
  Tag, TagLabel,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import {
  FaArrowLeft,
  FaCertificate,
  FaClock,
  FaFilter,
  FaLock,
  FaPlayCircle,
  FaUserGraduate
} from 'react-icons/fa';
import { CourseCard } from './component/CourseCard';

const MotionBox = motion(Box);

// --- Extended Data ---
type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
interface Course {
  id: number;
  title: string;
  category: string;
  rating: number;
  duration: string;
  students: string;
  image: string;
  description: string;
  modules: string[];
  price: number;
  level: CourseLevel;
}

const COURSES: Course[] = [
  { id: 1, title: "MSME Lending & Credit Appraisal", category: "Banking", rating: 4.9, duration: "12h", students: "1.2k", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600", description: "Comprehensive analysis of MSME credit life cycles.", modules: ["Macro Environment", "Financial Statement Analysis", "Credit Scoring Models"], price: 4999, level: 'Intermediate' },
  { id: 2, title: "Affordable Housing Finance", category: "NBFC", rating: 4.8, duration: "10h", students: "850", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600", description: "Explore the NHB guidelines for the informal housing sector.", modules: ["Policy Framework", "Technical Appraisal"], price: 3499, level: 'Beginner' },
  { id: 3, title: "Operational Risk Management", category: "Risk", rating: 4.7, duration: "8h", students: "2.1k", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600", description: "Strategic mitigation of operational failures.", modules: ["Internal Controls", "Fraud Prevention"], price: 5999, level: 'Advanced' },
  { id: 4, title: "Digital Banking 2.0", category: "Technology", rating: 4.9, duration: "6h", students: "3k", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600", description: "Traditional branch banking to digital ecosystems.", modules: ["Neo-Banking", "Cybersecurity"], price: 2999, level: 'Beginner' },
  { id: 5, title: "Wealth Management & Fintech", category: "Banking", rating: 4.6, duration: "15h", students: "1.1k", image: "https://images.unsplash.com/photo-1611974714658-058f40da23fb?w=600", description: "Modern portfolio theory meets automated advisory.", modules: ["Asset Allocation", "Robo-Advisors"], price: 7499, level: 'Advanced' },
  { id: 6, title: "Microfinance Operations", category: "NBFC", rating: 4.5, duration: "9h", students: "900", image: "https://images.unsplash.com/photo-1591033594798-33227a05780d?w=600", description: "Understanding JLG and SHG models in rural India.", modules: ["Group Lending", "Social Impact"], price: 1999, level: 'Beginner' },
  { id: 7, title: "Cybersecurity in Finance", category: "Technology", rating: 4.9, duration: "20h", students: "4.5k", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600", description: "Protecting financial assets in a digital world.", modules: ["Encryption", "Threat Detection"], price: 8999, level: 'Advanced' },
  { id: 8, title: "Anti-Money Laundering (AML)", category: "Risk", rating: 4.8, duration: "14h", students: "1.8k", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600", description: "Regulatory compliance and suspicious activity reporting.", modules: ["KYC Norms", "Transaction Monitoring"], price: 6500, level: 'Intermediate' },
  { id: 9, title: "Corporate Finance Basics", category: "Banking", rating: 4.4, duration: "11h", students: "2.3k", image: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=600", description: "Capital budgeting and financial modeling.", modules: ["NPV & IRR", "WACC Calculation"], price: 3200, level: 'Beginner' },
  { id: 10, title: "Blockchain for Payments", category: "Technology", rating: 4.7, duration: "13h", students: "1.5k", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600", description: "Revolutionizing cross-border settlements.", modules: ["Smart Contracts", "DeFi Protocols"], price: 5200, level: 'Intermediate' },
];

const CATEGORIES = ['All', 'Banking', 'NBFC', 'Risk', 'Technology'];

const CoursesPage = observer(function CoursesPage() {
  const role = String(stores.auth.userType || stores.auth.user?.role || '').toLowerCase();
  const isLearner = Boolean(stores.auth.user) && isLearnerRole(role);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'default'>('default');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const filteredCourses = useMemo(() => {
    let result = COURSES.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === 'All' || c.category === activeCategory;
      return matchesSearch && matchesCat;
    });
    if (sortBy === 'price') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [searchQuery, activeCategory, sortBy]);

  const FilterContent = () => (
    <VStack align="start" spacing={7} w="full">
      <Box w="full">
        <Text fontWeight="800" mb={3} fontSize="xs" color="gray.400" letterSpacing="wider">SEARCH</Text>
        <Input 
          placeholder="What do you want to learn?" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="filled"
          bg="gray.50"
          _focus={{ bg: "white", borderColor: "blue.400" }}
          h="45px"
          borderRadius="lg"
        />
      </Box>

      <Box w="full">
        <Text fontWeight="800" mb={3} fontSize="xs" color="gray.400" letterSpacing="wider">CATEGORIES</Text>
        <VStack align="start" spacing={1} w="full">
          {CATEGORIES.map(cat => (
            <Button 
              key={cat} 
              variant={activeCategory === cat ? 'solid' : 'ghost'} 
              colorScheme="blue"
              justifyContent="space-between"
              w="full"
              size="md"
              fontWeight={activeCategory === cat ? "bold" : "medium"}
              borderRadius="lg"
              onClick={() => { setActiveCategory(cat); onClose(); }}
            >
              {cat}
              {activeCategory === cat && <Circle size="6px" bg={useColorModeValue('white','gray.600')} />}
            </Button>
          ))}
        </VStack>
      </Box>

      <Box w="full">
        <Text fontWeight="800" mb={3} fontSize="xs" color="gray.400" letterSpacing="wider">EXPERIENCE LEVEL</Text>
        <Stack spacing={3}>
          <Checkbox colorScheme="blue" size="md" defaultChecked>Beginner</Checkbox>
          <Checkbox colorScheme="blue" size="md">Intermediate</Checkbox>
          <Checkbox colorScheme="blue" size="md">Advanced</Checkbox>
        </Stack>
      </Box>
    </VStack>
  );

  const pageBg = useColorModeValue('#F8FAFC', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const subtitleColor = useColorModeValue('gray.500', 'gray.300');

  if (isLearner) {
    return <MyCoursesBoard basePath="/course" />;
  }

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 4, md: 10 }}>
    <Box>
        <AnimatePresence mode="wait">
          {!selectedCourse ? (
            <MotionBox key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              <Flex gap={6} direction={{ base: 'column', md: 'row' }}>
                {/* Fixed Sidebar Design */}
                <Box display={{ base: 'none', md: 'block' }} w="240px" position="sticky" top="100px" h="fit-content">
                  <VStack align="start" p={6} bg={cardBg} borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor={cardBorder}>
                    <HStack mb={4}><Icon as={FaFilter} color="blue.500" /><Heading size="xs" textTransform="uppercase">Filters</Heading></HStack>
                    <FilterContent />
                  </VStack>
                </Box>

                {/* Mobile FAB */}
                <Button 
                  display={{ base: 'flex', md: 'none' }} 
                  position="fixed" bottom="24px" right="24px"
                  colorScheme="blue" borderRadius="full" shadow="2xl" zIndex="overlay" px={8}
                  onClick={onOpen} leftIcon={<FaFilter />}
                > Filters </Button>

                {/* Main Content */}
                <Box flex="1">
                  <Flex justify="space-between" align="flex-end" mb={8} px={2}>
                    <Box>
                      <Heading size="xl" mb={1} letterSpacing="-0.5px" color={textColor}>Course Catalog</Heading>
                      <Text fontSize="md" color={subtitleColor} fontWeight="medium">Explore {filteredCourses.length} professional programs</Text>
                    </Box>
                    <HStack bg={useColorModeValue('gray.100','gray.700')} p={1} borderRadius="lg">
                      <Button size="sm" variant={sortBy === 'rating' ? 'white' : 'ghost'} shadow={sortBy === 'rating' ? 'sm' : 'none'} onClick={() => setSortBy('rating')}>Top Rated</Button>
                      <Button size="sm" variant={sortBy === 'price' ? 'white' : 'ghost'} shadow={sortBy === 'price' ? 'sm' : 'none'} onClick={() => setSortBy('price')}>Price</Button>
                    </HStack>
                  </Flex>

              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={8}>
  {filteredCourses.map((course) => (
    <CourseCard
      key={course.id}
      course={course}
      onClick={() => setSelectedCourse(course)}
    />
  ))}
</SimpleGrid>
                </Box>
              </Flex>
            </MotionBox>
          ) : (
            /* --- LUXURY COURSE DETAIL --- */
            <MotionBox key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <Button variant="link" color="blue.600" mb={8} onClick={() => setSelectedCourse(null)} leftIcon={<FaArrowLeft />}>
                Back to Catalog
              </Button>

              <Flex direction={{ base: 'column', lg: 'row' }} gap={12}>
                <Box flex="2">
                  <VStack align="start" spacing={6}>
                    <HStack>
                        <Tag size="lg" colorScheme="blue" borderRadius="full">
                            <TagLabel>{selectedCourse.category}</TagLabel>
                        </Tag>
                        <Text color="gray.500" fontSize="sm">• {selectedCourse.students} students enrolled</Text>
                    </HStack>
                    <Heading size="2xl" lineHeight="tight" letterSpacing="-1px">{selectedCourse.title}</Heading>
                    <Text fontSize="xl" color="gray.600" lineHeight="tall">{selectedCourse.description}</Text>
                    
                    <Box w="full" pt={6}>
                        <Heading size="md" mb={6}>What you'll learn</Heading>
                        <SimpleGrid columns={{base: 1, md: 2}} spacing={4} w="full">
                            {selectedCourse.modules.map((m, i) => (
                                <HStack key={i} p={5} bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={cardBorder} shadow="sm">
                                    <Circle size="32px" bg={useColorModeValue('blue.50','blue.900')} color={useColorModeValue('blue.600','blue.200')} fontWeight="bold" fontSize="sm">{i+1}</Circle>
                                    <Text fontWeight="600" color={useColorModeValue('gray.700','gray.200')}>{m}</Text>
                                    <Spacer />
                                    <Icon as={i === 0 ? FaPlayCircle : FaLock} color={i === 0 ? "blue.500" : useColorModeValue('gray.300','gray.500')} />
                                </HStack>
                            ))}
                        </SimpleGrid>
                    </Box>
                  </VStack>
                </Box>

                <Box flex="1">
                  <VStack p={8} bg={cardBg} borderRadius="3xl" shadow={useColorModeValue('2xl','2xl')} borderWidth="1px" borderColor={useColorModeValue('gray.50','gray.700')} position="sticky" top="100px" spacing={6}>
                    <AspectRatio ratio={16/9} w="full">
                        <Image src={selectedCourse.image} borderRadius="2xl" alt={selectedCourse.title} />
                    </AspectRatio>
                    <VStack align="start" w="full" spacing={1}>
                        <Text fontSize="sm" color="gray.500" fontWeight="bold">INVESTMENT</Text>
                        <Heading size="xl" color="blue.700">₹{selectedCourse.price.toLocaleString()}</Heading>
                    </VStack>
                    <Button colorScheme="blue" size="lg" w="full" h="60px" borderRadius="xl" shadow="lg" _hover={{transform: 'translateY(-2px)'}}>
                        Enroll Now
                    </Button>
                    <VStack w="full" align="start" spacing={3} pt={4}>
                        <HStack fontSize="sm" color="gray.600"><Icon as={FaClock} color="blue.500"/> <Text>Lifetime Access</Text></HStack>
                        <HStack fontSize="sm" color="gray.600"><Icon as={FaCertificate} color="blue.500"/> <Text>Official Certificate</Text></HStack>
                        <HStack fontSize="sm" color="gray.600"><Icon as={FaUserGraduate} color="blue.500"/> <Text>Instructor Support</Text></HStack>
                    </VStack>
                  </VStack>
                </Box>
              </Flex>
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>

      {/* Drawer for Mobile (Simplified) */}
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent borderTopRadius="3xl">
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth="1px">Filters</DrawerHeader>
          <DrawerBody py={8}>
            <FilterContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
});

export default CoursesPage;

// Small helper for detail view
const Spacer = () => <Box flex="1" />;
