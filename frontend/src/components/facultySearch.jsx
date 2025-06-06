import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import {
    Box,
    Button,
    Text,
    Input,
    Select,
    VStack,
    Tag,
    TagLabel,
    TagCloseButton,
    SimpleGrid,
    Spinner,
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react";
import {subjects} from "../constants";


const FacultySearch = ({selectedSubjects, selectedFaculties, setSelectedFaculties, onClose}) => {
    const [universitySearch, setUniversitySearch] = useState("");
    const [facultySearch, setFacultySearch] = useState("");
    const [yearSearch, setYearSearch] = useState("");
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const firstRenderRef = useRef(true);

    useEffect(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            fetchFaculties();
        } else {
            const timeout = setTimeout(fetchFaculties, 500);
            return () => clearTimeout(timeout);
        }
    }, [universitySearch, facultySearch, yearSearch, selectedSubjects, page]);

    useEffect(() => {
        setPage(0);
    }, [universitySearch, facultySearch, yearSearch, selectedSubjects]);

    const fetchFaculties = async () => {
        setLoading(true);

        let params = {
            page: page + 1,
            subjects: selectedSubjects.join(","),
        };

        // Add search parameters only if they are not empty
        if (universitySearch) params.university = universitySearch;
        if (facultySearch) params.faculty = facultySearch;
        if (yearSearch) params.year = yearSearch;

        try {
            const res = await axios.get(
                process.env.REACT_APP_API_URL + "/faculties",
                {params: params,}
            );
            const formatted = res.data.items.map((f) => ({
                id: `${f.faculty_id}-${f.year}`,
                ...f,
            }));
            setRows(formatted);
            setRowCount(res.data.total);
            setLimit(res.data.limit);
        } catch (err) {
            console.error("Failed to fetch faculties", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFacultySelection = (row) => {
        const exists = selectedFaculties.find(f => f.faculty_id === row.faculty_id && f.year === row.year);
        if (exists) {
            setSelectedFaculties(prev =>
                prev.filter(f => !(f.faculty_id === row.faculty_id && f.year === row.year))
            );
        } else {
            setSelectedFaculties(prev => [...prev, row]);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay/>
            <ModalContent maxH="90vh">
                <ModalHeader>ფაკულტეტების არჩევა</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Flex
                        justify={{base: "center", md: "flex-end"}}
                        direction="row"
                        gap={2}
                        mb={4}
                    >

                        {selectedFaculties.length > 0 && (
                            <>
                                <Button colorScheme="red" onClick={() => setSelectedFaculties([])}>
                                    გასუფთავება
                                </Button>
                            </>
                        )}
                        <Button colorScheme="blue" onClick={() => onClose()}>
                            შენახვა
                        </Button>
                    </Flex>

                    {selectedFaculties.length > 0 && (
                        <Box mb={4}>
                            <Text fontWeight="bold" mb={2}>არჩეული ფაკულტეტები</Text>
                            <Flex wrap="wrap" gap={2}>
                                {selectedFaculties.map((f, i) => (
                                    <Tag
                                        key={`${f.faculty_id}-${f.year}`}
                                        variant="outline"
                                        colorScheme="purple"
                                        maxW="100%"
                                    >
                                        <TagLabel>
                                            {f.university_name} – {f.faculty_name} ({f.year})
                                        </TagLabel>
                                        <TagCloseButton onClick={() => toggleFacultySelection(f)}/>
                                    </Tag>
                                ))}
                            </Flex>
                            <Box my={4} borderBottom="1px solid #ccc"/>
                        </Box>
                    )}

                    <SimpleGrid columns={{base: 1, md: 3}} spacing={4} mb={4}>
                        <Input
                            value={universitySearch}
                            onChange={(e) => setUniversitySearch(e.target.value)}
                            placeholder="უნივერსიტეტის სახელი ან კოდი"
                            variant="filled"
                        />
                        <Input
                            value={facultySearch}
                            onChange={(e) => setFacultySearch(e.target.value)}
                            placeholder="ფაკულტეტის სახელი ან კოდი"
                            variant="filled"
                        />
                        <Select
                            value={yearSearch}
                            onChange={(e) => setYearSearch(e.target.value)}
                            variant="filled"
                            placeholder="ყველა წელი"
                        >
                            {[2021, 2022, 2023, 2024].map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Select>
                    </SimpleGrid>

                    {loading ? (
                        <Flex justify="center" my={6}>
                            <Spinner size="lg"/>
                        </Flex>
                    ) : (
                        <>
                            <VStack spacing={4} align="stretch">
                                {rows.map((row) => {
                                    const isSelected = selectedFaculties.some(
                                        (f) => f.faculty_id === row.faculty_id && f.year === row.year
                                    );
                                    return (
                                        <Box
                                            key={row.id}
                                            p={4}
                                            borderWidth={isSelected ? 2 : 1}
                                            borderColor={isSelected ? "blue.400" : "gray.300"}
                                            rounded="md"
                                            bg={isSelected ? "blue.50" : "white"}
                                            cursor="pointer"
                                            _hover={{bg: isSelected ? "blue.100" : "gray.100"}}
                                            onClick={() => toggleFacultySelection(row)}
                                            transition="0.2s"
                                        >
                                            <Text fontWeight="bold">{row.faculty_id} {row.year}</Text>
                                            <Text>{row.university_name}</Text>
                                            <Text fontWeight="semibold">{row.faculty_name}</Text>
                                            <Text fontSize="sm" mt={1} color="gray.600">
                                                {row.subjects
                                                    .filter((s) => subjects[s])
                                                    .map((s) => subjects[s].name)
                                                    .join(", ")}
                                            </Text>
                                        </Box>
                                    );
                                })}
                            </VStack>

                            <Flex justify="center" mt={6} mb={4}>
                                <Button
                                    colorScheme="blue"
                                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                                    isDisabled={page === 0}
                                    mr={2}
                                >
                                    წინა
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    onClick={() => setPage((p) => p + 1)}
                                    isDisabled={(page + 1) * limit >= rowCount}
                                >
                                    შემდეგი
                                </Button>
                            </Flex>
                        </>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default FacultySearch;
