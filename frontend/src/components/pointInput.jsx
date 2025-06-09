import { FormControl, FormLabel, Input, Text } from "@chakra-ui/react";

const PointInput = ({ nameDisplay, nameInternal, maxValue, value, onChange, isSubmitting }) => {
  return (
    <FormControl
      position="relative"
      display="inline-block"
      mb={4}
      isDisabled={isSubmitting}
    >
      <FormLabel textAlign="center" fontSize="sm" mb={1}>
        {nameDisplay}
      </FormLabel>
      <Input
        type="number"
        name={nameInternal}
        value={value}
        onChange={onChange}
        max={maxValue}
        inputMode="decimal"
        step="any"
        fontWeight="bold"
        fontSize="sm"
        px={4}
        py={2}
        borderRadius="md"
        borderColor="gray.300"
        _hover={{ borderColor: "gray.400" }}
        _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
        background="white"
      />
      <Text
        fontSize="sm"
        color="gray.500"
        position="absolute"
        left="38px"
        top="70%"
        transform="translateY(-50%)"
        pointerEvents="none"
        userSelect="none"
      >
        / {maxValue}
      </Text>
    </FormControl>
  );
};

export default PointInput;