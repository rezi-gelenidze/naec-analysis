import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
} from "@chakra-ui/react";

const ModalInstruction = ({isOpen, onClose}) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay/>
        <ModalContent>
            <ModalHeader>ინსტრუქცია</ModalHeader>
            <ModalCloseButton/>
            <ModalBody>
                <ol style={{paddingLeft: "1.2rem", lineHeight: "1.8"}}>
                    <li>
                        აირჩიეთ საგნებისა და ქულების კომბინაცია ზედა ჩამოსაშლელი მენიუდან.
                    </li>
                    <li>
                        შეიყვანეთ მიღებული ქულები ყველა საგანში. თითოეული საგნის მაქსიმალური ქულა მოცემულია მარჯვნივ,
                        2025 წლის ეროვნული გამოცდებისათვის.
                    </li>
                    <li>
                        დააწკაპუნეთ ღილაკზე <strong>„ფაკულტეტების არჩევა“</strong> და მონიშნეთ ის ფაკულტეტები კონრეტული
                        წლებით,
                        რომლებიც გსურთ გააანალიზოთ. (წელს ვირჩევთ, რადგან ხშირად ადგილების რაოდენობა და ჩასაბარებელი
                        საგნები იცვლება.
                    </li>
                    <li>
                        ფაკულტეტების არჩევის შემდეგ დააჭირეთ ღილაკს <strong>„შემოწმება“</strong>.
                    </li>
                    <li>
                        გამოჩნდება ინფორმაცია დაფინანსებების (გრანტების) და ჩარიცხვების შესახებ არჩეულ წლებში.
                    </li>
                </ol>

                <p style={{marginTop: "1rem", textAlign: "center", fontWeight: "bold"}}>
                    გაითვალისწინე, რომ არქივის მონაცემები ზუსტია, თუმცა სტატისტიკური ცდომილების გამო, შენს
                    საკონკურსო და საგრანტო ქულაში შეიძლებაიყოს +-3% ცდომილება.
                </p>

                <p style={{marginTop: "1rem", textAlign: "center", fontWeight: "bold"}}>
                    წარმატებებს გისურვებთ!
                </p>
            </ModalBody>

        </ModalContent>
    </Modal>
);

export default ModalInstruction;
