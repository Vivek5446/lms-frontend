'use client';

import { useRef, useState, useEffect } from 'react';
import { Box, SimpleGrid, HStack,  useBreakpointValue } from '@chakra-ui/react';
import { CourseCard } from './CourseCard';

export function CourseCarousel({ courses, enrolledCourseIds, router }: any) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth || 1;
    const gap = 16;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement;
    if (card) {
      el.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [courses]);

  // Desktop / tablet: plain grid, no carousel machinery
  if (!isMobile) {
    return (
      <SimpleGrid columns={{ md: 2, xl: 4 }} spacing={8}>
        {courses.map((course: any) => (
          <CourseCard
            key={course._id}
            course={course}
            enrolled={enrolledCourseIds.has(String(course._id))}
            onClick={() => router.push(`/course?courseId=${course._id}`)}
          />
        ))}
      </SimpleGrid>
    );
  }

  // Mobile: swipeable snap-scroll carousel
  return (
    <Box position="relative">
      <HStack
  ref={scrollRef}
  onScroll={handleScroll}
  spacing={4}
  overflowX="auto"
  pb={2}
  mx={-4}
  px={4}
  sx={{
    scrollSnapType: 'x mandatory',
    '&::-webkit-scrollbar': { display: 'none' },
    scrollbarWidth: 'none',
    WebkitOverflowScrolling: 'touch',
  }}
  align="flex-start"   
>
        {courses.map((course: any) => (
          <Box
            key={course._id}
            flex="0 0 82%"
            minW={0}
            sx={{ scrollSnapAlign: 'center' }}
          >
            <CourseCard
              course={course}
              enrolled={enrolledCourseIds.has(String(course._id))}
              onClick={() => router.push(`/course?courseId=${course._id}`)}
            />
          </Box>
        ))}
      </HStack>

      {/* Dot indicators */}
      {courses.length > 1 && (
        <HStack justify="center" spacing={2} mt={4}>
          {courses.map((_: any, i: number) => (
            <Box
              key={i}
              as="button"
              onClick={() => scrollToIndex(i)}
              w={activeIndex === i ? '20px' : '8px'}
              h="8px"
              borderRadius="full"
              bg={activeIndex === i ? 'gray.900' : 'gray.300'}
              transition="all 0.25s ease"
            />
          ))}
        </HStack>
      )}
    </Box>
  );
}