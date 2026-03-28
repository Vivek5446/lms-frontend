import { Box, Center, Flex, Grid, Heading, Icon, Image, Link, Text, VStack } from '@chakra-ui/react';
import { FaFacebook, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import { IoShareSocialOutline } from 'react-icons/io5';
import CustomButton from '../../../../component/common/CustomButton/CustomButton';
import { useRouter } from 'next/navigation';

const socialLinks = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/Dental-healthcare/",
    icon: FaLinkedinIn
  },
  {
    name: "FaXTwitter",
    url: "https://x.com/Dentalhealth",
    icon: FaXTwitter
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/Dentalhealth/",
    icon: FaInstagram
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61562244046160",
    icon: FaFacebook
  },
];

const IndividualBlogPage = () => {
  const router = useRouter();
  return (
    <>
      {/* Meta Title & Description */}

      {/* <Head>
        <title>How to Choose the Right Therapist for Your Mental Health | Dental</title>
        <meta
          name="description"
          content="Searching for the right therapist? Discover expert tips on How to Choose the Right Therapist for Your Mental Health and get the support you need. Learn about qualifications, therapy approaches, and ethical considerations to make an informed choice. Read now!"
        />
      </Head> */}

      <Box maxW={{ base: "95%", md: "90%" }} mx="auto">
        {/* Blog Title and Description */}
        <Box maxW="800px" mx="auto" px={{ base: 2, md: 4 }}>
          <Heading as="h1" textAlign="center" fontWeight={600} mt={2} mb={2} fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}>
            How to Choose the Right Therapist for Your Mental Health
          </Heading>
          {/* <Text color="#616161" textAlign="center" fontSize={{ base: "sm", md: "md" }}>
            Searching for the right therapist? Discover expert tips on How to Choose the Right Therapist for Your Mental Health and get the support you need.
          </Text> */}
        </Box>

        {/* Blog Image */}
        <Image
          alt="How to Choose the Right Therapist for Your Mental Health"
          borderTopRightRadius="50px"
          borderBottomLeftRadius="50px"
          mt={6}
          h={{ base: "50vh", md: "80vh" }}
          objectFit="cover"
          w="100%"
          src="/images/blogs/mindful.png"
        />

        {/* Main Content Grid */}
        <Grid
          templateColumns={{ base: "1fr", md: "0.75fr 4fr 1fr" }} // Stack columns on mobile, side by side on tablet and desktop
          gap={{ base: 6, md: 4 }}
          my={{ base: 6, md: 12 }}
        >
          {/* Social Shares Section */}
          <Box>
            <Box>
              <Center>
                <Icon as={IoShareSocialOutline} boxSize={5} />
              </Center>
              {/* <Text mt={1} textAlign="center" fontWeight={700} lineHeight={1} fontSize="sm">
                shares<br />996K
              </Text> */}
            </Box>
            <Flex
              direction={{ base: "row", md: "column" }} // Horizontal on mobile/tablet, vertical on desktop
              align="center"
              justify="center"
              gap={{ base: 3, md: 1 }}
              mt={6}
            >
              {socialLinks.map((social) => (
                <Link key={social.name} href={social.url}>
                  <Box
                    boxSize={8}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    rounded="full"
                    bg="brand.100"
                    _hover={{ color: "gray.300" }}
                    mb={{ base: 0, md: 3 }} // Add margin bottom for vertical layout
                    mr={{ base: 3, md: 0 }} // Add margin right for horizontal layout
                  >
                    <Icon as={social.icon} boxSize="60%" color="white" />
                  </Box>
                </Link>
              ))}
            </Flex>
          </Box>

          {/* Blog Content Section */}
          <Box pr={{ base: 0, md: 4 }}>
            <VStack align="start" spacing={6}>
              <Heading as="h2" size={{ base: "md", md: "lg" }}>
                Introduction
              </Heading>
              <Text color="#757575" fontSize={{ base: "sm", md: "md" }}>
                Feeling safe, understood, and heard is very important when you look for help with your emotions. The right therapist will make you feel comfortable so you can talk openly and work through your problems. This helps you find better ways to handle your feelings.
                <br /><br />
                To get the most out of it, you need to trust your therapist and feel at ease with them. Studies show that the bond you build with your therapist is a very important part of healing. It helps you deal with both your present struggles and past experiences.
                <br /><br />
                Here&apos;s some simple advice from Dentalhealth
                <a href="https://Dentalhealth.com" target="_blank" rel="noopener noreferrer"> <strong>“A Top Rated Dental”</strong></a>
                on how to find the right therapist for you.
              </Text>

              <Heading as="h3" size={{ base: "sm", md: "md" }}>
                1. Understand What a Therapist Does
              </Heading>
              <Text color="#757575" fontSize={{ base: "sm", md: "md" }}>
                A <strong>therapist</strong> is a trained professional who helps people deal with their emotions and mental health. They use different methods to support clients in improving their thinking, reducing symptoms of mental illness, and learning ways to cope better in life.
                <br /><br />
                One important part of a therapist&apos;s job is to understand what a person needs for their mental health. They may use structured tests and assessments to find out what the problem is and create a plan to help. Therapists also keep records of therapy sessions, track progress, and sometimes work with other healthcare professionals to give the best care.
                <br /><br />
                A therapist can help you:
                <br />✔ Find solutions to problems
                <br />✔ Feel stronger when facing challenges
                <br />✔ Change habits that hold you back
                <br />✔ Understand how your thoughts affect your feelings
                <br />✔ Heal from past pain
                <br />✔ Set personal goals
                <br />✔ Build self-confidence
              </Text>

              <Heading as="h3" size={{ base: "sm", md: "md" }}>
                2. Check Their Qualifications and Credentials
              </Heading>
              <Text color="#757575" fontSize={{ base: "sm", md: "md" }}>
                It is very important to choose a <strong>qualified</strong> therapist. In India, different professionals like <strong>Counselors, Psychologists, Clinical Psychologists, Social Workers, and Psychiatrists</strong> can be called therapists.
                <br /><br />
                Anyone practicing therapy should have at least <strong>a Master&apos;s degree (M.A./M.Sc./PGDCP/M.Phil) or a Doctoral degree (Ph.D.) in Psychology.</strong>
                <br /><br />
                Some therapists specialize in treating mental illnesses and have a degree in <strong>Clinical Psychology</strong>. These therapists must be <strong> registered with the Rehabilitation Council of India (RCI)</strong>.
                <br /><br />
                Many therapists also take extra training in special therapy methods like <strong> Cognitive Behavioral Therapy (CBT)</strong> or <strong> Mindfulness-Based Therapy</strong>. To be properly trained, a therapist should have completed at least <strong>six months of certification training</strong> in addition to their Master&apos;s degree.
                <br /><br />
                What to check:
                <br />✔ Educational background (M.A./M.Sc./PGDCP/M.Phil/Ph.D. in Psychology)
                <br />✔ RCI Registration (for clinical psychologists)
                <br />✔ Certifications in specialized therapy methods
              </Text>

              <Heading as="h3" size={{ base: "sm", md: "md" }}>
                3. Therapeutic Approach
              </Heading>
              <Text color="#757575" fontSize={{ base: "sm", md: "md" }}>
                Therapists use different methods to help people. Some common types of therapy include:
                <br /><strong>✔ Cognitive-Behavioral Therapy (CBT)</strong> – Helps change negative thought patterns.
                <br /><strong>✔ Psychodynamic Therapy</strong> – Focuses on past experiences and emotions.
                <br /><strong>✔ Mindfulness-Based Therapy</strong> – Uses mindfulness techniques to improve well-being.
                <br /><br />
                It is important to choose a therapist whose approach <strong>matches your needs and goals</strong> in therapy.
              </Text>

              <Heading as="h3" size={{ base: "sm", md: "md" }}>
                4. Importance of Ethics
              </Heading>
              <Text color="#757575" fontSize={{ base: "sm", md: "md" }}>
                Ethics are very important in therapy. One of the most important rules is <strong>confidentiality</strong>. A therapist <strong>must keep your information private</strong> and should only break confidentiality in rare situations, such as:
                <br />✔ If a person is in <strong>immediate danger</strong> (e.g., actively suicidal).
                <br />✔ If there is a <strong>risk of harm</strong> to someone else.
                <br />✔ If it is <strong> legally required</strong> (e.g., court-ordered).
                <br /><br />
                A good therapist <strong>will not share</strong> your personal details with family, friends, or anyone outside professional circles unless absolutely necessary.
              </Text>

              <Heading as="h3" size={{ base: "sm", md: "md" }}>
                5. Choose a Good Therapist, Not Just a Convenient One
              </Heading>
              <Text color="#757575" fontSize={{ base: "sm", md: "md" }}>
                It is important to think about cost and convenience, but your <strong>mental health should be a top priority</strong>. When you are struggling emotionally, even daily activities can feel hard.
                <br /><br />
                Finding a therapist who is close to you or has flexible timing can be helpful, but it <strong>does not always mean they are the best choice</strong>. Sometimes, you may have to adjust your schedule to make time for therapy. It is not something that should just fit into your free time—you have to <strong>make time for self-care</strong>. Therapy requires effort from you, so choosing the first therapist you find on Google or going to the first referral without checking their qualifications might be easy, but it <strong>may not be the best option</strong>.
                <br /><br />
                When it comes to cost, <strong>therapy is an investment</strong> in your mental and physical health, not just an expense. Therapist fees can vary based on experience and training. Choosing a cheaper therapist who is <strong>not well-trained</strong> can make things worse, especially when you are feeling vulnerable. This can <strong>cause more harm</strong> instead of helping.
                <br /><br />
                <strong> Research shows that 1 in 5 clients stop therapy after just one session</strong> because they don&apos;t feel a connection with their therapist. To check if a therapist is right for you, ask yourself:<br />
                <strong>✔ Do I feel heard and understood during sessions?</strong><br />
                <strong>✔ Do I feel supported and validated?</strong><br />
                <strong>✔ Does the therapist adjust their approach to meet my needs?</strong><br />
                <strong>✔ Do I feel safe and comfortable opening up to them?</strong><br />
                <strong>✔ Do they accept my emotions and experiences without judgment?</strong><br />
                <strong>✔ Do they understand and support my goals for therapy?</strong>
              </Text>

              <Heading as="h3" size={{ base: "sm", md: "md" }}>
                6. Choose a Therapist Based on Your Needs
              </Heading>
              <Text color="#757575" fontSize={{ base: "sm", md: "md" }}>
                Choosing a therapist is like tuning a radio—sometimes, the signal is fuzzy, but when you find the right frequency, everything becomes clear and easier to understand.
                <br /><br />
                There may be too many therapists offering treatments online to choose from or you may find a recommendation from a friend or a family but still unsure if it fits your concerns. Finding a therapist can be a time taking process but to ease the process here is what you can look for:
                <br /><br />
                <Text>
                  1. The right therapist for you is <strong>someone who has experience treating your specific concerns</strong>.<br />
                  2. Some therapists specialize in working with children or families, adults, couples, or older adults.<br />
                  3. They should be skilled in <strong>evidence-based therapy methods</strong> for your condition.<br />
                  4. Just as important as their qualifications is how <strong>comfortable</strong> you feel with them.
                </Text>
              </Text>
              <Heading as="h3" size={{ base: "sm", md: "md" }}>
                7. Accessibility and Sensitivity
              </Heading>
              <Text color="#757575" fontSize={{ base: "sm", md: "md" }}>
                Therapy should <strong>not</strong> feel like an added stress. It should be <strong>easy and convenient</strong> to get the help you need.
                <br /><br />
                That&apos;s why it&apos;s important to find a therapist who fits your needs—whether you prefer <strong>online or in-person sessions</strong>.
                <br /><br />
                Everyone has a <strong>unique background, culture, and experiences</strong> that shape who they are. A good therapist <strong>respects and understands</strong> this, making sure their approach considers your individual needs.
              </Text>

              <Heading as="h3" size={{ base: "sm", md: "md" }}>
                Why Choose Dental Health?
              </Heading>
              <Text color="#757575" fontSize={{ base: "sm", md: "md" }}>
                At Dental Health, we make finding the right therapist easy. Here&apos;s how we help:
                <br /><strong>✔ Qualified Therapists</strong> – Our experts are licensed clinical psychologists with experience in different therapy approaches.
                <br /><strong>✔ Personalized Therapy</strong> – Sessions are designed to meet your specific needs.
                <br /><strong>✔ Online & Offline Therapy</strong> – Choose between in-person or virtual sessions based on your preference.
                <br /><strong>✔ Safe & Confidential Space</strong> – Talk freely without fear of judgment.
              </Text>
              <Heading as="h2" size={{ base: "md", md: "lg" }}>
                Conclusion
              </Heading>
              <Text color="#757575" fontSize={{ base: "sm", md: "md" }}>
                Finding the right therapist is an important step toward improving your mental well-being. It&apos;s essential to choose someone who is qualified, experienced, and makes you feel safe and understood. Therapy is a journey that requires commitment, but with the right therapist, it can be life-changing. Prioritize your mental health, take the time to find a good fit, and remember that seeking help is a sign of strength.
              </Text>
            </VStack>
          </Box>

          {/* Contact Section */}
          <Box px={{ base: 2, md: 4 }} mt={{ base: 6, md: 0 }}>
            <Text fontWeight={700} fontSize={{ base: "xs", md: "lg" }} whiteSpace="nowrap">
              Contact Us Right Now
            </Text>
            <Text color="#616161" fontSize={{ base: "sm", md: "md" }}>
              Find expert support for your concerns by consulting a Dental therapist.
            </Text>
            <CustomButton onClick={() => router.push("/therapist")} variant="outline" py={5} px={6} fontSize="sm" mt={4} colorScheme="teal">
              Need Help?
            </CustomButton>
          </Box>

        </Grid>
      </Box>
    </>
  );
};
export default IndividualBlogPage;