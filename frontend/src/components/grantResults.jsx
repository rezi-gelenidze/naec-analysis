// src/components/GrantResults.jsx
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  VStack,
  Flex,
} from "@chakra-ui/react";
import React from "react";
import { subjects, grant_thresholds } from "../constants";

export default function GrantResults({ grantResults }) {
  const bestGrantPerYear = {};
  grantResults.forEach(({ year, grants }) => {
    const best = [...grants].sort((a, b) =>
      b.grant_amount !== a.grant_amount
        ? b.grant_amount - a.grant_amount
        : b.grant_score - a.grant_score
    )[0];
    bestGrantPerYear[year] = grants.length === 2 ? best.subject : null;
  });

  return (
    <>
      <Heading size="md" mb={4}>გრანტი</Heading>
      <Box overflowX="auto" rounded="md" bg="white" border="1px solid" borderColor="gray.200" boxShadow="md" mb={8}>
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
            {grantResults.flatMap((result) =>
              result.grants.map((g, i) => {
                const isBest = bestGrantPerYear[result.year] === g.subject;
                return (
                  <Tr
                    key={`${result.year}-${g.subject}-${i}`}
                    bg={isBest ? "blue.50" : undefined}
                    fontWeight={isBest ? "bold" : "normal"}
                  >
                    <Td>{result.year}</Td>
                    <Td>{g.grant_amount === null ? "0%" : `${g.grant_amount}%`}</Td>
                    <Td>{g.grant_score.toFixed(1)}</Td>
                    <Td>{subjects[g.subject]?.name || g.subject}</Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </Box>

      <Heading size="md" mb={4}>შენი და საგრანტო ზღვრების სკალა</Heading>
      <VStack spacing={6} align="stretch">
        {grantResults.flatMap((result) =>
          result.grants.map((g) => {
            const threshold = grant_thresholds[g.subject]?.find(t => t.year === result.year);
            if (!threshold) return null;
            const userScore = g.grant_score;
            const scaleStart = Math.min(threshold[50], userScore) - 300;
            const scaleEnd = Math.max(threshold[100], userScore) + 300;

            return (
              <Box
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

                {/* Scale */}
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

                {/* Labels */}
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

                <Flex justify="space-between" fontSize="xs" mt={8}>
                  <Text>{scaleStart.toFixed(1)}</Text>
                  <Text>{scaleEnd.toFixed(1)}</Text>
                </Flex>
              </Box>
            );
          })
        )}
      </VStack>
    </>
  );
}
