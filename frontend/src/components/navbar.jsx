import {
  Box,
  Button,
  HStack,
  Spacer,
  Text
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const calculatorLink = isMobile
    ? "https://taap.it/KGKboN"
    : "https://qbit.ge/content/intro.html";
  const channelLink = isMobile
    ? "https://taap.it/XBlCqz"
    : "https://www.youtube.com/@qbit-geo?sub_confirmation=1";

  return (
    <Box
      as="nav"
      w="100%"
      px={6}
      py={3}
      bg="white"
      shadow="md"
      borderBottom="1px solid"
      borderColor="gray.200"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <HStack justifyContent="space-between" w="100%">
        <Text
          as="a"
          href={calculatorLink}
          target="_blank"
          fontSize={{ base: "sm", md: "lg" }}
          fontWeight="bold"
          color="teal.800"
        >
          Qbit კალკულატორი
        </Text>
        <Button
          size="sm"
          bg="red.400"
          color="white"
          _hover={{ bg: "red.500" }}
          rounded="xl"
          as="a"
          href={channelLink}
          target="_blank"
        >
          ჩვენი არხი 🎥
        </Button>
      </HStack>

      <Spacer />
    </Box>
  );
};

export default Navbar;
