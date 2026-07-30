import { Flex, Heading, Tbody, Td, Tr, VStack, Icon, Text } from "@chakra-ui/react";
import { FiInbox } from "react-icons/fi";
import SpinnerLoader from "../../../common/Loader/SpinnerLoader";

interface TableLoaderProps {
  loader: boolean;
  show: number;
  children?: React.ReactNode;
}

const TableLoader: React.FC<TableLoaderProps> = ({
  loader,
  show,
  children,
}) => {
  if (loader) {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={10} p={5}>
            <Flex justifyContent="center" alignItems="center">
              <SpinnerLoader size="lg"/>
            </Flex>
          </Td>
        </Tr>
      </Tbody>
    );
  }

  if (!loader && show === 0) {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={10} p={5}>
            <Flex justifyContent="center" py={8}>
              <VStack spacing={3}>
                <Icon as={FiInbox} w={10} h={10} color="gray.300" />
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  No data found
                </Text>
              </VStack>
            </Flex>
          </Td>
        </Tr>
      </Tbody>
    );
  }
  return <>{children}</>;
};

export default TableLoader;
