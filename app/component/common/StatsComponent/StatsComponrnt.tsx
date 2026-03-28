import { Box, Grid, GridItem, Text, useBreakpointValue } from "@chakra-ui/react";
import { animate, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 2 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplayValue(Math.floor(v)),
    });

    return controls.stop;
  }, [value, duration]);

  return <motion.span>{displayValue}</motion.span>;
};

interface Stat {
  value: number | string;
  label: string;
}

interface StatsGridProps {
  statsData: Stat[];
  templateColumns?: { base?: string; md?: string; lg?: string };
  fontSize?: { base?: string; md?: string; lg?: string };
  labelFontSize?: { base?: string; lg?: string };
  gap?: { base?: string; lg?: string };
  statColor?: string;
  borderColor?: string
}

const StatsGrid: React.FC<StatsGridProps> = ({
  statsData,
  templateColumns = { base: "1fr 1fr", md: "repeat(5, 1fr)" },
  fontSize = { base: "2rem", md: "2.4rem", lg: "3.6rem" },
  labelFontSize = { base: "xs", lg: "md" },
  gap = { base: 8, md: 8, lg: 4 },
  statColor,
  borderColor={base:"transparent",md:'gray.300'}
}) => {
  const { ref, inView } = useInView({ triggerOnce: true });
  const isMobile = useBreakpointValue({ base: true, md: false }); // Check if it's mobile

  return (
    <Grid
      ref={ref}
      templateColumns={templateColumns}
      mt={{ base: 8, lg: 14 }}
      gap={gap}
      position="relative" // Required for absolute positioning of lines
    >
      {statsData.map((stat, index) => (
        <React.Fragment key={index}>
          <GridItem
            colSpan={{ base: index === statsData.length - 1 ? 2 : 1, md: 1 }}
            justifySelf={{ base: index === statsData.length - 1 ? "center" : "unset", md: "unset" }}
            borderRight={{base:index===0?'1px solid': 'none',md:"none"}}
            pr={{ base:index===0? 6:0, md: 0 }}
            borderColor={borderColor}
          >
            <Box>
              <Text
                textAlign="center"
                fontSize={fontSize}
                fontWeight={500}
                lineHeight={{ base: "3rem" }}
                color={statColor}
              >
                {inView && typeof stat.value === "number" ? (
                  <>
                    <AnimatedNumber value={stat.value} />
                    {stat.label !== "Licensed Professionals" ? "+" : ""}
                  </>
                ) : (
                  stat.value
                )}
              </Text>

              <Text color="#0F0F0F" textAlign="center" fontSize={labelFontSize}>
                {stat.label}
              </Text>
            </Box>
          </GridItem>

          {/* Independent Vertical Line */}
          {!isMobile && index < statsData.length - 1 && (
            <Box
              position="absolute"
              top="0"
              bottom="0"
              left={`calc(${((index + 1) * 100) / statsData.length}% - 2px)`} // Center the line between items
              width="1px"
              bg="#DEDEDE"
              transform="translateX(-50%)" // Ensure the line is exactly centered
            />
          )}
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default StatsGrid;