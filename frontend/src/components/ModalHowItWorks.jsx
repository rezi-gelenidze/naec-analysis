import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";

const ModalHowItWorks = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>როგორ მუშაობს?</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        TODO
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default ModalHowItWorks;
