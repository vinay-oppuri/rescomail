"use client";

import JobDescriptionInput from "@/modules/dashboard/ui/components/job-description-input";
import { useColdmailStore } from "../../../store/coldmail-store";

const ColdmailContentFields = () => {
  const { jobDescription, setJobDescription } = useColdmailStore();

  return (
    <JobDescriptionInput
      inputId="coldmail-job-description"
      value={jobDescription}
      onValueChange={setJobDescription}
      minimumCharacters={20}
    />
  );
};

export default ColdmailContentFields;
