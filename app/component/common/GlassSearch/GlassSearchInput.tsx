import { Box, Input, InputGroup, InputLeftElement, Icon } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxW?: string | object;
  isLearner?: boolean;
};

export default function GlassSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  maxW = "480px",
  isLearner = true,
}: Props) {
  return (
    <Box
      bg={isLearner ? "rgba(255,255,255,0.07)" : "white"}
      backdropFilter={isLearner ? "blur(16px)" : "none"}
      border="1px solid rgba(255,255,255,0.12)"
      borderRadius="16px"
      p={1.5}
      maxW={maxW}
      _focusWithin={{
        border: "1px solid rgba(255,255,255,0.3)",
        bg: "rgba(255,255,255,0.1)",
      }}
      transition="all 0.2s"
    >
      <InputGroup>
        <InputLeftElement pointerEvents="none" pl={2}>
          <Icon
            as={FiSearch}
            color="rgba(255,255,255,0.5)"
            boxSize={4}
          />
        </InputLeftElement>

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          color="white"
          border="none"
          _placeholder={{ color: "rgba(255,255,255,0.4)" }}
          _focus={{ boxShadow: "none" }}
          fontSize="sm"
        />
      </InputGroup>
    </Box>
  );
}