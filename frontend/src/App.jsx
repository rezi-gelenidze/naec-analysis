import React, {useState, useRef} from "react";
import {
    Box,
    Button,
    Container,
    Text,
    VStack,
    HStack,
    Divider,
    useColorModeValue,
    Tag,
    SimpleGrid,
    useToast,
    useDisclosure,
    Icon,
    Link
} from "@chakra-ui/react";
import {FaLinkedin, FaGithub} from "react-icons/fa";

import axios from "axios";

// Components
import PointInput from "./components/pointInput";
import FacultySearch from "./components/facultySearch";
import SubjectsDropdown from "./components/subjectsDropdown";
import GrantResults from "./components/grantResults";
import EnrollmentResults from "./components/enrollmentResults";
import Navbar from "./components/navbar";

import ModalHowItWorks from "./components/ModalHowItWorks";
import ModalInstruction from "./components/ModalInstruction";

import {subjects, subject_points, allowed_combinations} from "./constants";


function App() {
    const [selectedComboKey, setSelectedComboKey] = useState("MATHEMATICS");
    const [selectedFaculties, setSelectedFaculties] = useState([]);

    const [points, setPoints] = useState({});

    const [grantResults, setGrantResults] = useState([]);
    const [enrollmentResults, setEnrollmentResults] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTables, setShowTables] = useState(false);
    const tableRef = useRef(null);

    const {
        isOpen: isInstructionOpen,
        onOpen: openInstruction,
        onClose: closeInstruction,
    } = useDisclosure();

    const {
        isOpen: isHowItWorksOpen,
        onOpen: openHowItWorks,
        onClose: closeHowItWorks,
    } = useDisclosure();

    const toast = useToast();


    const prepareAnalyzePayload = (rawPoints, selectedFaculties) => {
        const points = Object.fromEntries(Object.entries(rawPoints)
            .map(([key, value]) => {
                const normalizedKey = key.replace("_", " ");
                const max = subject_points[normalizedKey];
                return [normalizedKey, parseFloat((value / max).toFixed(3))];
            }));

        const faculties = selectedFaculties.map(({faculty_id, year}) => ({
            faculty_id, year
        }));

        return {points, faculties};
    };

    const handleSubmit = async () => {
        const validPoints = Object.values(points).every((value) => Number.isFinite(value));
        const validKeys = Object.keys(points).length >= 3 && Object.keys(points).length <= 4;
        if (!validPoints || !validKeys) {
            toast({
                description: "სწორად შეავსეთ ყველა საჭირო ველი.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right",
            });
            setIsSubmitting(false);
            return;
        }

        const payload = prepareAnalyzePayload(points, selectedFaculties);

        setIsSubmitting(true);
        try {
            const response = await axios.post(process.env.REACT_APP_API_URL + "/analysis", payload);
            if (response.status !== 200) {
                toast({
                    description: "დაფიქსირდა შეცდომა, მოგვიანებით სცადეთ.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom-right",
                });
                setIsSubmitting(false);
                return;
            }
            setGrantResults(response.data.grants || []);
            setEnrollmentResults(response.data.enrollments || []);
            setShowTables(true);
        } catch (error) {
            console.error("Error posting data:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePointChange = (e) => {
        const {name, value, max} = e.target;
        const maxNum = Number(max);

        if (value === "") {
            setPoints((prev) => ({...prev, [name]: ""}));
            return;
        }
        const normalizedValue = value.replace(",", ".");

        const numValue = parseFloat(normalizedValue);

        if (!isNaN(numValue) && numValue > 0 && numValue <= maxNum) {
            setPoints((prev) => ({...prev, [name]: numValue}));
        }
    };

    const handleSubjectsChange = (e) => {
        const {value} = e.target;
        setSelectedComboKey(value);
        setPoints({
            GEORGIAN_LANGUAGE: points.GEORGIAN_LANGUAGE, FOREIGN_LANGUAGE: points.FOREIGN_LANGUAGE,
        });
        setSelectedFaculties([]);
    };

    const bestGrantPerYear = {};
    grantResults.forEach(({year, grants}) => {
        const best = [...grants].sort((a, b) => b.grant_amount !== a.grant_amount ? b.grant_amount - a.grant_amount : b.grant_score - a.grant_score)[0];
        bestGrantPerYear[year] = grants.length === 2 ? best.subject : null;
    });

    return (
        <Box bg={useColorModeValue("gray.100", "gray.900")} minH="100vh">
            <Navbar/>
            <ModalHowItWorks isOpen={isHowItWorksOpen} onClose={closeHowItWorks}/>
            <ModalInstruction isOpen={isInstructionOpen} onClose={closeInstruction}/>


            <Container maxW="lg" bg="white" p={6} my={6} rounded="md" shadow="md">
                <VStack spacing={4} align="stretch">
                    {/* Subjects dropdown*/}
                    <SubjectsDropdown selectedComboKey={selectedComboKey} onChange={handleSubjectsChange}/>

                    {/* Point inputs of selected subjects */}
                    {selectedComboKey && (<>
                        <SimpleGrid columns={[1, null, 2]} spacing={4}>
                            <PointInput nameDisplay="ქართული" nameInternal="GEORGIAN_LANGUAGE" maxValue="60"
                                        value={points.GEORGIAN_LANGUAGE || ""} onChange={handlePointChange}
                                        isSubmitting={isSubmitting}/>
                            <PointInput nameDisplay="უცხო ენა" nameInternal="FOREIGN_LANGUAGE" maxValue="70"
                                        value={points.FOREIGN_LANGUAGE || ""} onChange={handlePointChange}
                                        isSubmitting={isSubmitting}/>
                        </SimpleGrid>
                        <SimpleGrid
                            columns={allowed_combinations[selectedComboKey].length === 1 ? 1 : 2}
                            spacing={4}
                        >
                            {allowed_combinations[selectedComboKey].map((subjectKey) => (<PointInput
                                key={subjectKey}
                                nameDisplay={subjects[subjectKey].name}
                                nameInternal={subjectKey}
                                maxValue={subjects[subjectKey].score.toString()}
                                value={points[subjectKey] ?? ""}
                                onChange={handlePointChange}
                                isSubmitting={isSubmitting}
                            />))}
                        </SimpleGrid>

                        {/* Faculty Search modal and its toggler button */}
                        {modalOpen && (<FacultySearch
                            selectedSubjects={allowed_combinations[selectedComboKey]}
                            selectedFaculties={selectedFaculties}
                            setSelectedFaculties={setSelectedFaculties}
                            onClose={() => setModalOpen(false)}
                        />)}
                        <Button colorScheme="teal" onClick={() => setModalOpen(true)}>ფაკულტეტების არჩევა</Button>


                        {/* Selected faculties display */}
                        {selectedFaculties.length > 0 && (<Box>
                            <Text fontWeight="bold">არჩეული ფაკულტეტები:</Text>
                            <HStack wrap="wrap">
                                {selectedFaculties.map((fc, i) => (<Tag key={i} variant="solid" colorScheme="purple">
                                    {fc.faculty_id} - {fc.year}
                                </Tag>))}
                            </HStack>
                        </Box>)}
                    </>)}

                    <Divider my={4}/>

                    {/* Submission button */}
                    <Button colorScheme="blue" isLoading={isSubmitting} onClick={handleSubmit}
                            isDisabled={!selectedComboKey}>
                        შემოწმება
                    </Button>
                    {/* Info Buttons */}
                    <HStack spacing={6} justifyContent="center">
                        <Button variant="link" colorScheme="blue" textDecoration="underline" onClick={openInstruction}>
                            ინსტრუქცია
                        </Button>
                        <Button variant="link" colorScheme="teal" textDecoration="underline" onClick={openHowItWorks}>
                            როგორ მუშაობს?
                        </Button>
                    </HStack>

                    {/* Author */}

                    <HStack justifyContent="center" fontSize="md">
                        <Text color="gray.700" fontWeight="bold">
                            ავტორი | რეზი გელენიძე
                        </Text>

                        <HStack justify="center" mt={2}>
                            <Link href="https://www.linkedin.com/in/rezi-gelenidze/" isExternal>
                                <Icon as={FaLinkedin} boxSize={5} color="blue.500"/>
                            </Link>
                            <Link href="https://github.com/rezi-gelenidze" isExternal>
                                <Icon as={FaGithub} boxSize={5} _hover={{color: "gray.700"}}/>
                            </Link>
                        </HStack>
                    </HStack>
                </VStack>
            </Container>

            {showTables && (<Box maxW="7xl" mx="auto" mt={12} px={4} ref={tableRef}>
                <GrantResults grantResults={grantResults}/>
                {selectedFaculties.length > 0 && enrollmentResults.length > 0 && (<EnrollmentResults
                    selectedFaculties={selectedFaculties}
                    enrollmentResults={enrollmentResults}
                />)}
            </Box>)}

        </Box>);
}

export default App;
