import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { AccordionButton, AccordionPanel, Flex, Image, Text } from '@chakra-ui/react';

interface CustomAccordionItemProps {
  item: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const CustomAccordionItem = ({ item, isExpanded, onToggle }: CustomAccordionItemProps) => {
  return (
    <>
      <AccordionButton py={4} onClick={onToggle}>
        <Flex align={'center'} gap={2} flex='1'>
          <Image w={'30px'} h={'30px'} src={item.iconUrl} alt={item.title} />
          <Text fontWeight={600} as='span' textAlign='left'>
            {item.title}
          </Text>
        </Flex>
        {isExpanded ? <MinusIcon boxSize={3} /> : <AddIcon boxSize={3} />}
      </AccordionButton>
      <AccordionPanel pb={4} fontWeight={500} color={'#292929'}>
        {item.description}
      </AccordionPanel>
    </>
  );
};

export default CustomAccordionItem;