import React from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    Box,
    Text,
} from "@chakra-ui/react";
import ContactDetailedForm from "../../ContactUsFormSection/element/ContactDetailedForm";

interface EnquireFormModalProps {
    handleFormSubmit?: any;
    isOpen: boolean;
    onClose: () => void;
    pageLink?: string
}

const EnquireFormModal: React.FC<EnquireFormModalProps> = ({
    isOpen,
    onClose,
    handleFormSubmit,
    pageLink
}) => {
    const onFormSubmit = (formData) => {
        if (handleFormSubmit) {
            handleFormSubmit(formData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton />
                <Box p={5}>
                     {" "}
                    <Text fontWeight="bold">Get Started</Text>
                    <ContactDetailedForm 
                        handleFormSubmit={onFormSubmit} 
                        links={pageLink || "assessment"} 
                        showHeader={false} 
                        isEquiry={true}
                    />
                </Box>
            </ModalContent>
        </Modal>
    );
};

export default EnquireFormModal;