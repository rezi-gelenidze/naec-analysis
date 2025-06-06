import React, {useState, useRef} from "react";
import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Divider,
    useColorModeValue,
    Tag,
    SimpleGrid,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Flex,
} from "@chakra-ui/react";

import axios from "axios";
import PointInput from "./components/pointInput";
import FacultySearch from "./components/facultySearch";
import SubjectsDropdown from "./components/subjectsDropdown";

import {subjects, subject_points, grant_thresholds, allowed_combinations} from "./constants";


function App() {
    const [selectedComboKey, setSelectedComboKey] = useState("MATHEMATICS");
    const [selectedFaculties, setSelectedFaculties] = useState([]);
    const [points, setPoints] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [grantResults, setGrantResults] = useState([]);
    const [enrollmentResults, setEnrollmentResults] = useState([]);
    const [showTables, setShowTables] = useState(false);
    const tableRef = useRef(null);


    const prepareAnalyzePayload = (rawPoints, selectedFaculties) => {
        const points = Object.fromEntries(
            Object.entries(rawPoints)
                .map(([key, value]) => {
                    const normalizedKey = key.replace("_", " ");
                    const max = subject_points[normalizedKey];
                    return [normalizedKey, parseFloat((value / max).toFixed(3))];
                })
        );

        const faculties = selectedFaculties.map(({faculty_id, year}) => ({
            faculty_id, year
        }));

        return { points, faculties };
    };

    const handleSubmit = async () => {
        const validPoints = Object.values(points).every((value) => Number.isInteger(value));
        const validKeys = Object.keys(points).length >= 3 && Object.keys(points).length <= 4;
        if (!validPoints || !validKeys) {
            alert("სწორად შეავსეთ ყველა საჭირო ველი.");
            setIsSubmitting(false);
            return;
        }

        const payload = prepareAnalyzePayload(points, selectedFaculties);

        setIsSubmitting(true);
        try {
            const response = await axios.post(process.env.REACT_APP_API_URL + "/analysis", payload);
            if (response.status !== 200) {
                alert("მონაცემები ვერ გაიგზავნა, კვლავ სცადეთ :(");
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
        if (value === "" || (Number(value) >= 0 && Number(value) <= Number(max))) {
            setPoints((prev) => ({...prev, [name]: parseInt(value)}));
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

    return (<Box bg={useColorModeValue("gray.100", "gray.900")} minH="100vh" py={10}>
        <Container maxW="lg" bg="white" p={6} rounded="md" shadow="md">
            <VStack spacing={4} align="stretch">
                <Heading size="lg" textAlign="center">Qbit Calculator</Heading>
                <SubjectsDropdown selectedComboKey={selectedComboKey} onChange={handleSubjectsChange}/>
                {selectedComboKey && (<>
                    <SimpleGrid columns={[1, null, 2]} spacing={4}>
                        <PointInput nameDisplay="ქართული" nameInternal="GEORGIAN_LANGUAGE" maxValue="60"
                                    value={points.GEORGIAN_LANGUAGE || 0} onChange={handlePointChange}
                                    isSubmitting={isSubmitting}/>
                        <PointInput nameDisplay="უცხო ენა" nameInternal="FOREIGN_LANGUAGE" maxValue="70"
                                    value={points.FOREIGN_LANGUAGE || 0} onChange={handlePointChange}
                                    isSubmitting={isSubmitting}/>
                    </SimpleGrid>
                    <SimpleGrid
                        columns={allowed_combinations[selectedComboKey].length === 1 ? 1 : 2}
                        spacing={4}
                    >
                        {allowed_combinations[selectedComboKey].map((subjectKey) => (
                            <PointInput
                                key={subjectKey}
                                nameDisplay={subjects[subjectKey].name}
                                nameInternal={subjectKey}
                                maxValue={subjects[subjectKey].score.toString()}
                                value={points[subjectKey] || 0}
                                onChange={handlePointChange}
                                isSubmitting={isSubmitting}
                            />
                        ))}
                    </SimpleGrid>

                    {modalOpen && (<FacultySearch
                        selectedSubjects={allowed_combinations[selectedComboKey]}
                        selectedFaculties={selectedFaculties}
                        setSelectedFaculties={setSelectedFaculties}
                        onClose={() => setModalOpen(false)}
                    />)}
                    <Button colorScheme="teal" onClick={() => setModalOpen(true)}>ფაკულტეტების არჩევა</Button>
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
                <Button colorScheme="blue" isLoading={isSubmitting} onClick={handleSubmit}
                        isDisabled={!selectedComboKey}>
                    შემოწმება
                </Button>
                <Text fontSize="sm" textAlign="center" color="gray.500">
                    Made by{' '}
                    <Box as="a" href="https://www.linkedin.com/in/rezi-gelenidze/" color="teal.600"
                         fontWeight="bold">
                        Rezi Gelenidze
                    </Box>
                </Text>
            </VStack>
        </Container>

        {
            showTables && (<Box maxW="7xl" mx="auto" mt={12} px={4} ref={tableRef}>
                {/* Grant Table */}
                <Heading size="md" mb={4}>გრანტი</Heading>
                <Box overflowX="auto" rounded="md"
                     bg="white"
                     border="1px solid"
                     borderColor="gray.200"
                     boxShadow="md"
                     mb={8}>
                    <Table size="sm">
                        <Thead bg="gray.100">
                            <Tr>
                                <Th>წელი</Th>
                                <Th>გრანტი</Th>
                                <Th>საგრანტო ქულა</Th>
                                <Th>საგრანტო საგანი</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {grantResults.flatMap((result) => result.grants.map((g, i) => {
                                const isBest = bestGrantPerYear[result.year] === g.subject;
                                return (<Tr
                                    key={`${result.year}-${g.subject}-${i}`}
                                    bg={isBest ? "blue.50" : undefined}
                                    fontWeight={isBest ? "bold" : "normal"}
                                >
                                    <Td>{result.year}</Td>
                                    <Td>{g.grant_amount === null ? "0%" : `${g.grant_amount}%`}</Td>
                                    <Td>{g.grant_score.toFixed(1)}</Td>
                                    <Td>{subjects[g.subject]?.name || g.subject}</Td>
                                </Tr>);
                            }))}
                        </Tbody>
                    </Table>
                </Box>

                {/* Grant Scales */}
                <Heading size="md" mb={4}>შენი და საგრანტო ზღვრების სკალა</Heading>
                <VStack spacing={6} align="stretch">
                    {grantResults.flatMap((result) => result.grants.map((g) => {
                        const threshold = grant_thresholds[g.subject]?.find(t => t.year === result.year);
                        if (!threshold) return null;
                        const userScore = g.grant_score;
                        const scaleStart = Math.min(threshold[50], userScore) - 300;
                        const scaleEnd = Math.max(threshold[100], userScore) + 300;
                        const isBest = bestGrantPerYear[result.year] === g.subject;

                        return (<Box
                                key={`${result.year}-${g.subject}`}
                                p={4}
                                overflowX="auto"
                                rounded="md"
                                bg="white"
                                border="1px solid"
                                borderColor="gray.200"
                                boxShadow="md"
                                mb={8}
                            >
                                <Text fontWeight="bold" mb={2}>
                                    {subjects[g.subject]?.name || g.subject} ({result.year})
                                </Text>

                                {/* Label for user score above the bar */}
                                <Box position="relative" mb={2}>
                                    <Box
                                        position="absolute"
                                        left={`${((userScore - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                                        transform="translateX(-50%)"
                                        textAlign="center"
                                        fontSize="xs"
                                        bg="gray.100"
                                        borderRadius="md"
                                        p={1}
                                    >
                                        <Text>შენ<br/>{userScore.toFixed(1)}</Text>
                                    </Box>
                                </Box>

                                {/* Scale Bar with Circles */}
                                <Box position="relative" h="20px" bg="gray.200" mt="4em" rounded="full">
                                    {[50, 70, 100].map((p) => {
                                        const val = threshold[p];
                                        return (
                                            <Box
                                                key={p}
                                                position="absolute"
                                                top="50%"
                                                left={`${((val - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                                                transform="translate(-50%, -50%)"
                                                w="10px"
                                                h="10px"
                                                bg="red"
                                                borderRadius="full"
                                            />
                                        );
                                    })}

                                    {/* User score circle */}
                                    <Box
                                        position="absolute"
                                        top="50%"
                                        left={`${((userScore - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                                        transform="translate(-50%, -50%)"
                                        w="10px"
                                        h="10px"
                                        bg="teal.500"
                                        borderRadius="full"
                                    />
                                </Box>

                                {/* Labels under the scale */}
                                <Box position="relative" mt={2}>
                                    {[50, 70, 100].map((p) => {
                                        const val = threshold[p];
                                        return (
                                            <Box
                                                key={p}
                                                position="absolute"
                                                left={`${((val - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                                                transform="translateX(-50%)"
                                                bg="gray.100"
                                                borderRadius="md"
                                                p={1}
                                                textAlign="center"
                                                fontSize="xs"
                                                mt={1}
                                            >
                                                <Text>{p}%<br/>{val}</Text>
                                            </Box>
                                        );
                                    })}
                                </Box>

                                {/* Edge Labels */}
                                <Flex justify="space-between" fontSize="xs" mt={8}>
                                    <Text>{scaleStart.toFixed(1)}</Text>
                                    <Text>{scaleEnd.toFixed(1)}</Text>
                                </Flex>
                            </Box>
                        );
                    }))}
                </VStack>

                {/* Enrollment Scale Bars */}
                {selectedFaculties.length > 0 && (<>
                    {/* Enrollment Table */}
                    <Heading size="md" mt={12} mb={4}>ჩარიცხვა</Heading>
                    <Box overflowX="auto"
                         rounded="md"
                         bg="white"
                         border="1px solid"
                         borderColor="gray.200"
                         boxShadow="md"
                         mb={8}>
                        <Table size="sm">
                            <Thead bg="gray.100">
                                <Tr>
                                    <Th>წელი</Th>
                                    <Th>უნივერსიტეტი</Th>
                                    <Th>ფაკულტეტი</Th>
                                    <Th>საკონკურსო ქულა</Th>
                                    <Th>რეიტინგი</Th>
                                    <Th>მინ. ქულა</Th>
                                    <Th>მაქს. ქულა</Th>
                                    <Th>ადგილი (არჩეული საგნით)</Th>
                                    <Th>ჩარიცხული</Th>
                                    <Th>ჯამური ადგილი</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {selectedFaculties.map((faculty) => {
                                    const match = enrollmentResults.find((e) => e.faculty_id === faculty.faculty_id && e.year === faculty.year);
                                    return (<React.Fragment key={`${faculty.faculty_id}-${faculty.year}`}>
                                        <Tr>
                                            <Td>{faculty.year}</Td>
                                            <Td>{faculty.university_name}</Td>
                                            <Td>{faculty.faculty_name}</Td>
                                            <Td>{match ? match.contest_score.toFixed(2) : "-"}</Td>
                                            <Td>
                                                {match ? match.rank > match.total_available ? "-" : `${match.rank}/${match.total_enrolled}` : "-"}
                                            </Td>
                                            <Td>{match?.thresholds?.min_score ?? "-"}</Td>
                                            <Td>{match?.thresholds?.max_score ?? "-"}</Td>
                                            <Td>{match ? match.seats_with_subject : "-"}</Td>
                                            <Td>{match ? match.total_enrolled : "-"}</Td>
                                            <Td>{match ? match.total_available : "-"}</Td>
                                        </Tr>
                                        {match?.rank === match.total_enrolled + 1 && match.total_enrolled !== match.total_available && (
                                            <Tr>
                                                <Td colSpan={10} bg="red.100" textAlign="center"
                                                    fontStyle="italic" fontWeight="bold" fontSize="sm">
                                                    *მიუხედავად იმისა, რომ ამ საგნით ვერცერთ კონკურენტს
                                                    ვერ აჯობე, ჩარიცხვა შიდა ბარიერსა და სხვა საგნებიდან
                                                    გამოუყენებელ ადგილებზეა დამოკიდებული.
                                                </Td>
                                            </Tr>)}
                                    </React.Fragment>);
                                })}
                            </Tbody>
                        </Table>
                    </Box>

                    <Heading size="md" mt={12} mb={4}>შენი და ჩარიცხვის ზღვრების სკალა</Heading>
                    <VStack spacing={6} align="stretch">
                        {selectedFaculties.map(faculty => {
                            const match = enrollmentResults.find(e => e.faculty_id === faculty.faculty_id && e.year === faculty.year);
                            if (!match || !match.thresholds) return null;
                            const {min_score, max_score} = match.thresholds;
                            const userScore = match.contest_score;
                            const scaleStart = Math.min(min_score, userScore) - 150;
                            const scaleEnd = Math.max(max_score, userScore) + 150;

                            return (
                                <Box
                                    key={`${faculty.faculty_id}-${faculty.year}`}
                                    p={4}
                                    overflowX="auto"
                                    rounded="md"
                                    bg="white"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    boxShadow="md"
                                    mb={8}
                                >
                                    <Text fontWeight="bold" mb={2}>
                                        {faculty.university_name} <br/> {faculty.faculty_name} ({faculty.year})
                                    </Text>

                                    {/* Label for user score above the bar */}
                                    <Box position="relative" mb={2}>
                                        <Box
                                            position="absolute"
                                            left={`${((userScore - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                                            transform="translateX(-50%)"
                                            textAlign="center"
                                            fontSize="xs"
                                            bg='gray.100'
                                            borderRadius="md"
                                            p={1}
                                        >
                                            <Text>შენ #{match.rank}<br/>{userScore.toFixed(2)}</Text>
                                        </Box>
                                    </Box>

                                    {/* Scale Bar with Circles */}
                                    <Box position="relative" h="20px" bg="gray.200" mt="4em" rounded="full">
                                        {/* Min point circle */}
                                        <Box
                                            position="absolute"
                                            top="50%"
                                            left={`${((min_score - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                                            transform="translate(-50%, -50%)"
                                            w="10px"
                                            h="10px"
                                            bg="red"
                                            borderRadius="full"
                                        />
                                        {/* Max point circle */}
                                        <Box
                                            position="absolute"
                                            top="50%"
                                            left={`${((max_score - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                                            transform="translate(-50%, -50%)"
                                            w="10px"
                                            h="10px"
                                            bg="red"
                                            borderRadius="full"
                                        />
                                        {/* User score circle */}
                                        <Box
                                            position="absolute"
                                            top="50%"
                                            left={`${((userScore - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                                            transform="translate(-50%, -50%)"
                                            w="10px"
                                            h="10px"
                                            bg="teal.500"
                                            borderRadius="full"
                                        />
                                    </Box>

                                    {/* Labels under the scale */}
                                    <Box position="relative" mt={2}>
                                        {/* Min label */}
                                        <Box
                                            position="absolute"
                                            left={`${((min_score - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                                            transform="translateX(-50%)"
                                            bg='gray.100'
                                            borderRadius="md"
                                            p={1}
                                            textAlign="center"
                                            fontSize="xs"
                                            mt={1}
                                        >
                                            <Text>მინ.<br/>{min_score}</Text>
                                        </Box>

                                        {/* Max label */}
                                        <Box
                                            position="absolute"
                                            left={`${((max_score - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                                            transform="translateX(-50%)"
                                            bg='gray.100'
                                            borderRadius="md"
                                            p={1}
                                            textAlign="center"
                                            fontSize="xs"
                                            mt={1}
                                        >
                                            <Text>მაქს.<br/>{max_score}</Text>
                                        </Box>
                                    </Box>

                                    {/* Edge Labels */}
                                    <Flex justify="space-between" fontSize="xs" mt={8}>
                                        <Text>{scaleStart.toFixed(1)}</Text>
                                        <Text>{scaleEnd.toFixed(1)}</Text>
                                    </Flex>
                                </Box>
                            );

                        })}
                    </VStack>
                </>)}
            </Box>)
        }

    </Box>)
        ;
}

export default App;
