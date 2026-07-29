'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Center, Spinner } from '@chakra-ui/react';

export default function CourseDetailsRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      router.replace(`/course?courseId=${id}`);
    } else {
      router.replace('/course');
    }
  }, [id, router]);

  return (
    <Center minH="100vh">
      <Spinner size="xl" color="brand.500" />
    </Center>
  );
}
