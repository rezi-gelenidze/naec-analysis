import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Button,
    Text,
    useColorModeValue,
    Image,
    VStack, Divider
} from "@chakra-ui/react";

import React from "react";
import SubscribeGIF from "../assets/subscribe.gif";

function SurpriseSubscribeModal({isOpen, onClose}) {

    const handleSubscribeClick = () => {
        localStorage.setItem("subscribedToChannel", "true");

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const link = isMobile
            ? "https://taap.it/XBlCqz" // mobile-optimized deep link
            : "https://www.youtube.com/@qbit-geo?sub_confirmation=1"; // desktop link

        window.open(link, "_blank");
        onClose();
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay/>
            <ModalContent bg={useColorModeValue("white", "gray.800")} borderRadius="xl">
                <ModalCloseButton/>
                <ModalHeader textAlign="center">მოიცადე! 🚀</ModalHeader>
                <ModalBody>
                    <VStack spacing={4} textAlign="center">
                        <Text fontSize="lg">
                            <Divider mb={1}/>
                            ტექნოლოგიურ სფეროს ირჩევ? ჯერ გაარკვიე რეალურად რა გელოდება და გაიმყარე არჩევანი!
                            <Divider my={1}/>
                            უყურე ჩვენს კურსს და <b>გამოიწერე არხი</b>
                        </Text>
                        <Button colorScheme="red" size="lg" onClick={handleSubscribeClick}>
                            არხის გამოწერა
                        </Button>

                        <Image
                            borderRadius="md"
                            src={SubscribeGIF}
                            alt="Subscribe Instruction"
                            maxW="100%"
                        />
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default SurpriseSubscribeModal;
