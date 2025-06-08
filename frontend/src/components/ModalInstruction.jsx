import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";

const ModalInstruction = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>ინსტრუქცია</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        TODO
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default ModalInstruction;
