import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Text,
    Box,
    UnorderedList,
    ListItem,
    Link
} from "@chakra-ui/react";
import {BlockMath, InlineMath} from "react-katex";
import 'katex/dist/katex.min.css';

const ModalHowItWorks = ({isOpen, onClose}) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay/>
        <ModalContent>
            <ModalHeader>როგორ მუშაობს?</ModalHeader>
            <ModalCloseButton/>
            <ModalBody>
                <Text mb={4}>
                    სისტემა ეფუძნება 2021–2024 წლების ეროვნული გამოცდების სტატისტიკურ მონაცემებსა და
                    ჩარიცხვების/გრანტების არქივებს. გამოყენებული ინფორმაცია არის საჯაროდ ხელმისაწვდომი naec.ge
                    ვებ-გვერდზე.
                </Text>

                <Text mb={4}>
                    უნივესიტეტში ჩარიცხვისას შენს მიერ თითოეულ საგანში მიღებული ქულისთვის ანგარიშდება სკალირებული ქულა,
                    რომელიც წარმოადგენს შენი შედეგის საშუალო მაჩვენებლიდან გადახრას, სადაც ღერძი არის 150.
                    ეს ქულა დამოკიდებულია კონრეტული წელს საგნის შედეგებზე, რადგან მის დასათვლელად საჭიროა სრული
                    მონაცემების საშუალო არითმეტიკული და კვადრატული გადახრა.
                </Text>
                <Box as="ol" pl={5} style={{lineHeight: "1.8"}}>
                    <Box as="li" mb={4}>
                        <Text>
                            შენ მიერ შეყვანილი ქულები გადაყვანილია ამ სკალაზე თითოეული წლისთვის შემდეგი
                            ფორმულით:
                        </Text>
                        <Box mt={2} mb={2}>
                            <BlockMath math={String.raw`S = 15 \cdot \frac{P - \mu}{\sigma} + 150`}/>
                        </Box>
                        <Text>სადაც:</Text>
                        <UnorderedList pl={4} spacing={1}>
                            <ListItem>
                                <InlineMath math="S"/> — სკალირებული ქულა
                            </ListItem>
                            <ListItem>
                                <InlineMath math="P"/> — შენს მიერ მიღებული ქულა (გათანაბრების შემდეგ)
                            </ListItem>
                            <ListItem>
                                <InlineMath math="\mu"/> — საშუალო ქულა იმ წელს
                            </ListItem>
                            <ListItem>
                                <InlineMath math="\sigma"/> — სტანდარტული გადახრა
                            </ListItem>
                        </UnorderedList>

                        <Link style={{textDecoration: "underline"}}
                              href="https://edu.aris.ge/news/wp-content/uploads/2024/06/%E1%83%A1%E1%83%99%E1%83%90%E1%83%9A%E1%83%98%E1%83%A0%E1%83%94%E1%83%91%E1%83%A3%E1%83%9A%E1%83%98-%E1%83%A5%E1%83%A3%E1%83%9A%E1%83%98%E1%83%A1-%E1%83%92%E1%83%90%E1%83%9B%E1%83%9D%E1%83%97%E1%83%95%E1%83%9A%E1%83%98%E1%83%A1-%E1%83%9B%E1%83%94%E1%83%97%E1%83%9D%E1%83%93%E1%83%98-2024.pdf">დეტალური
                            ინფორმაციისთვის იხილეთ NAEC ოფიციალური ინსტრუქცია</Link>
                    </Box>

                    <Box as="li" mb={4}>
                        <Text>საგრანტო ქულა გამოითვლება შემდეგი ფორმულით:</Text>
                        <Box mt={2} mb={2}>
                            <BlockMath math={String.raw`G = (S_{geo} + S_{lang} + 1.5 \cdot S_{elec}) \cdot 10`}/>
                        </Box>
                        <Text>სადაც:</Text>
                        <UnorderedList pl={4} spacing={1}>
                            <ListItem>
                                <InlineMath math="S_{geo}"/> — სკალირებული ქულა ქართულში
                            </ListItem>
                            <ListItem>
                                <InlineMath math="S_{lang}"/> — სკალირებული ქულა უცხო ენაში
                            </ListItem>
                            <ListItem>
                                <InlineMath math="S_{elec}"/> — სკალირებული ქულა არჩეულ საგანში
                            </ListItem>
                        </UnorderedList>
                        <Text mt={2}>
                            შემდეგ ეს ქულა შეედრება იმ წლების გრანტის მინიმუმს შესაბამის საგანში.
                        </Text>
                    </Box>

                    <hr/>

                    <Box mb={4}>
                        <Text>სამედიცინოსთვის:</Text>
                        <Box mt={2} mb={2}>
                            <BlockMath
                                math={String.raw`G = (S_{geo} + S_{lang} + 1.5 \cdot \max({S_{bio},  S_{elec}})) \cdot 10`}/>
                        </Box>
                        <Text>სადაც:</Text>
                        <UnorderedList pl={4} spacing={1}>
                            <ListItem>
                                <InlineMath math="S_{geo}"/> — სკალირებული ქულა ქართულში
                            </ListItem>
                            <ListItem>
                                <InlineMath math="S_{lang}"/> — სკალირებული ქულა უცხო ენაში
                            </ListItem>
                            <ListItem>
                                <InlineMath math="S_{bio}"/> — სკალირებული ქულა უცხო ბიოლოგიაში
                            </ListItem>
                            <ListItem>
                                <InlineMath math="S_{elec}"/> — სკალირებული ქულა არჩეულ საგანში
                            </ListItem>
                        </UnorderedList>

                        <Text mt={2}>
                            მიღებული ქულა ყოველი წლისთვის შედარებულია საგრანტო სიას, ანუ ვაკეთებთ სიმულაციას, იმ წელს
                            რომ ჩაგებარებინა, სიაში სად ჩაჯდებოდა შენი საგრანტო ქულა (ვის ჩაანაცვლებდი რეიტინგში).
                        </Text>
                    </Box>


                    <Box as="li" mb={4}>
                        <Text>საკონკურსო ქულა (ფაკულტეტზე ჩარიცხვისთვის) განისაზღვრება შემდეგნაირად:</Text>
                        <Box mt={2} mb={2}>
                            <BlockMath math={String.raw`C = \sum_{i=1}^{n} w_i \cdot S_i`}/>
                        </Box>
                        <Text>სადაც:</Text>
                        <UnorderedList pl={4} spacing={1}>
                            <ListItem>
                                <InlineMath math="w_i"/> — ფაკულტეტის მიერ მინიჭებული წონა საგანზე
                            </ListItem>
                            <ListItem>
                                <InlineMath math="S_i"/> — სკალირებული ქულა საგანში
                            </ListItem>
                        </UnorderedList>
                        <Text mt={2}>
                            მიღებული ქულა შედარებულია იმ წლების ჩარიცხვის ზღვართან და რეიტინგში, ვაკეთებთ სიმულაციას, იმ
                            წელს რომ ჩაგებარებინა, ვის ჩაანაცვლებდი რეიტინგში.
                        </Text>
                    </Box>
                </Box>

                <Text mt={6} textAlign="center">
                    საბოლოოდ, სისტემა გაჩვენებთ, გექნებოდა თუ არა გრანტი ან ჩარიცხვა კონკრეტულ ფაკულტეტზე კონკრეტულ
                    წელს.
                </Text>
            </ModalBody>
        </ModalContent>
    </Modal>
);

export default ModalHowItWorks;
