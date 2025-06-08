import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Text,
  Flex
} from "@chakra-ui/react";
import React from "react";

export default function EnrollmentResults({ selectedFaculties, enrollmentResults }) {
  return (
    <>
      <Heading size="md" mt={12} mb={4}>ჩარიცხვა</Heading>
      <Box overflowX="auto" rounded="md" bg="white" border="1px solid" borderColor="gray.200" boxShadow="md" mb={8}>
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
            {selectedFaculties.map(faculty => {
              const match = enrollmentResults.find(
                e => e.faculty_id === faculty.faculty_id && e.year === faculty.year
              );
              return (
                <React.Fragment key={`${faculty.faculty_id}-${faculty.year}`}>
                  <Tr>
                    <Td>{faculty.year}</Td>
                    <Td>{faculty.university_name}</Td>
                    <Td>{faculty.faculty_name}</Td>
                    <Td>{match ? match.contest_score.toFixed(2) : "-"}</Td>
                    <Td>{match ? match.rank > match.total_available ? "-" : `${match.rank}/${match.total_enrolled}` : "-"}</Td>
                    <Td>{match?.thresholds?.min_score ?? "-"}</Td>
                    <Td>{match?.thresholds?.max_score ?? "-"}</Td>
                    <Td>{match?.seats_with_subject ?? "-"}</Td>
                    <Td>{match?.total_enrolled ?? "-"}</Td>
                    <Td>{match?.total_available ?? "-"}</Td>
                  </Tr>
                  {match?.rank === match.total_enrolled + 1 && match.total_enrolled !== match.total_available && (
                    <Tr>
                      <Td colSpan={10} bg="red.100" textAlign="center" fontStyle="italic" fontWeight="bold" fontSize="sm">
                        *მიუხედავად იმისა, რომ ამ საგნით ვერცერთ კონკურენტს ვერ აჯობე, ჩარიცხვა შიდა ბარიერსა და სხვა საგნებიდან გამოუყენებელ ადგილებზეა დამოკიდებული.
                      </Td>
                    </Tr>
                  )}
                </React.Fragment>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      <Heading size="md" mt={12} mb={4}>შენი და ჩარიცხვის ზღვრების სკალა</Heading>
      <VStack spacing={6} align="stretch">
        {selectedFaculties.map(faculty => {
          const match = enrollmentResults.find(
            e => e.faculty_id === faculty.faculty_id && e.year === faculty.year
          );
          if (!match || !match.thresholds) return null;
          const { min_score, max_score } = match.thresholds;
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

              {/* User score label */}
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
                  <Text>შენ #{match.rank}<br/>{userScore.toFixed(2)}</Text>
                </Box>
              </Box>

              {/* Scale bar */}
              <Box position="relative" h="20px" bg="gray.200" mt="4em" rounded="full">
                {[min_score, max_score, userScore].map((val, idx) => (
                  <Box
                    key={idx}
                    position="absolute"
                    top="50%"
                    left={`${((val - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                    transform="translate(-50%, -50%)"
                    w="10px"
                    h="10px"
                    bg={val === userScore ? "teal.500" : "red"}
                    borderRadius="full"
                  />
                ))}
              </Box>

              {/* Scale labels */}
              <Box position="relative" mt={2}>
                <Box position="absolute" left={`${((min_score - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                     transform="translateX(-50%)" bg='gray.100' borderRadius="md" p={1} textAlign="center"
                     fontSize="xs" mt={1}>
                  <Text>მინ.<br/>{min_score}</Text>
                </Box>
                <Box position="absolute" left={`${((max_score - scaleStart) / (scaleEnd - scaleStart)) * 100}%`}
                     transform="translateX(-50%)" bg='gray.100' borderRadius="md" p={1} textAlign="center"
                     fontSize="xs" mt={1}>
                  <Text>მაქს.<br/>{max_score}</Text>
                </Box>
              </Box>

              <Flex justify="space-between" fontSize="xs" mt={8}>
                <Text>{scaleStart.toFixed(1)}</Text>
                <Text>{scaleEnd.toFixed(1)}</Text>
              </Flex>
            </Box>
          );
        })}
      </VStack>
    </>
  );
}
