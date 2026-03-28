import { Box, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { ToothData } from "../utils/constant";
import CleanTooth from "./CleanTooth";
import { keyframes } from "@emotion/react";
import HoverInfoCard from "./HoverInfoCard";

const upperArchEnter = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const lowerArchEnter = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;



const TeethArch = ({
  teeth,
  isUpper,
  selectedId,
  onSelect,
}: {
  teeth: ToothData[];
  isUpper: boolean;
  selectedId: number | undefined;
  onSelect?: any
}) => {
  const [hoveredTooth, setHoveredTooth] = useState<ToothData | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: any) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <Box
      position="relative"
      w="100%"
      h="240px"
      animation={`${isUpper ? upperArchEnter : lowerArchEnter} 0.55s ease-out`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredTooth(null)}
    >
      <Text
        position="absolute"
        left="50%"
        top={isUpper ? "-10px" : "auto"}
        bottom={!isUpper ? "-10px" : "auto"}
        transform="translateX(-50%)"
        fontSize="xs"
        fontWeight="bold"
        letterSpacing="widest"
        color="gray.700"
        textTransform="uppercase"
      >
        {isUpper ? "Maxilla" : "Mandible"}
      </Text>

      {teeth.map((tooth, index) => {
        const total = teeth.length;

        // --- Common ellipse angle (same for both arches) ---
        const startAngleDeg = 175;
        const endAngleDeg = 5;
        const stepDeg = (startAngleDeg - endAngleDeg) / (total - 1);
        const angleDeg = startAngleDeg - index * stepDeg;
        const angleRad = (angleDeg * Math.PI) / 180;

        const rx = 150;
        const ry = 160;

        const x = Math.cos(angleRad) * rx;
        const y = Math.sin(angleRad) * ry;

        const cssLeft = `calc(50% - ${x}px - 20px)`;
        const cssTop = isUpper
          ? `calc(100% - ${y}px - 40px)` // upper arch
          : `calc(0% + ${y}px + 0px)`; // lower arch (same curve, shifted down)

        // --- Rotation: lower is perfect mirror of upper ---
        const upperRot = angleDeg + 90; // your original good upper logic
        const rot = isUpper ? upperRot : 360 - upperRot; // mirror for mandible

        return (
          <Box
            key={tooth.number}
            position="absolute"
            left={cssLeft}
            top={cssTop}
          >
            <CleanTooth
              tooth={tooth}
              isSelected={selectedId === tooth.number}
              onClick={onSelect}
              rotation={rot}
              onMouseEnter={() => setHoveredTooth(tooth)}
              onMouseLeave={() => setHoveredTooth(null)}
            />
          </Box>
        );
      })}

      {hoveredTooth && (
        <HoverInfoCard tooth={hoveredTooth} position={cursorPos} />
      )}
    </Box>
  );
};

export default TeethArch;
