import React from "react";
import {
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { allowed_combinations, subjects } from "../constants";

const SubjectsDropdown = ({ selectedComboKey, onChange }) => {
  return (
    <FormControl isRequired>
      <FormLabel>აირჩიე ჩასაბარებელი საგნები</FormLabel>
      <Select
        value={selectedComboKey}
        onChange={onChange}
        placeholder="აირჩიე კომბინაცია"
        variant="filled"
        width="100%"
      >
        {Object.keys(allowed_combinations).map((combinationKey, i) => (
          <option key={i} value={combinationKey}>
            {allowed_combinations[combinationKey]
              .map((subjectKey) => subjects[subjectKey].name)
              .join(" & ")}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default SubjectsDropdown;
