import { Box, Text } from '@chakra-ui/react';
import { ToothData } from '../utils/constant';

const CleanTooth = ({
  tooth,
  isSelected,
  onClick,
  rotation,
  onMouseEnter,
  onMouseLeave
}: {
  tooth: ToothData;
  isSelected: boolean;
  onClick: any;
  rotation: number;
  onMouseEnter: any;
  onMouseLeave: () => void;
}) => {

  return (
      <Box
        onClick={() => onClick(tooth)}
        onMouseEnter={() => onMouseEnter(tooth)}
        onMouseLeave={onMouseLeave}
        position="absolute"
        cursor="pointer"
        w="42px"
        h="48px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        transform={`rotate(${rotation}deg)`}
        transition="all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        _hover={{
          transform: `rotate(${rotation}deg) scale(1.18)`,
          zIndex: 10,
          filter: "brightness(1.07)",
        }}
        // ⭐ Soft lift shadow (premium)
        filter={isSelected ? "drop-shadow(0 0 6px rgba(49,130,206,0.6))" : "drop-shadow(0 2px 6px rgba(0,0,0,0.15))"}
        borderRadius="12px"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 40 46"
          style={{ overflow: "visible" }}
        >
          {/* ===== 3D Gradient Enamel ===== */}
          <defs>
            <linearGradient id="toothGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#F7F8FA" />
              <stop offset="100%" stopColor="#ECEFF3" />
            </linearGradient>

            {/* Gloss highlight */}
            <linearGradient id="toothGloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          {/* Outer shape */}
          <path
            d="M5 12C5 6.4 9.4 2 15 2H25C30.6 2 35 6.4 35 12V30C35 37.7 28.7 44 21 44H19C11.3 44 5 37.7 5 30V12Z"
            fill="url(#toothGradient)"
            stroke={isSelected ? "#2B6CB0" : "#CBD5E0"}
            strokeWidth="2.2"
            style={{ transition: "stroke 0.2s" }}
          />

          {/* Gloss Layer */}
          <path
            d="M7 14C7 9 11 5 16 5H24C29 5 33 9 33 14"
            fill="url(#toothGloss)"
          />

          {/* Interior line detail */}
          <path
            d="M12 10H28"
            stroke="#A0AEC0"
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeLinecap="round"
          />

        </svg>

        {/* Upright number */}
        <Text
          position="absolute"
          fontSize="10px"
          fontWeight="bold"
          color={isSelected ? "blue.500" : "gray.500"}
          textShadow="0 1px 2px rgba(0,0,0,0.15)"
          transform={`rotate(${-rotation}deg)`}
          pointerEvents="none"
        >
          {tooth.number}
        </Text>
      </Box>
  );
};


export default CleanTooth