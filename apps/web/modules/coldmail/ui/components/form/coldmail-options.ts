import type {
  ColdEmailCallToAction,
  ColdEmailLength,
  ColdEmailTone,
} from "@repo/validations";

export const toneOptions: Array<{
  value: ColdEmailTone;
  label: string;
}> = [
  { value: "warm", label: "Warm" },
  { value: "confident", label: "Confident" },
  { value: "direct", label: "Direct" },
  { value: "friendly", label: "Friendly" },
];

export const lengthOptions: Array<{
  value: ColdEmailLength;
  label: string;
}> = [
  { value: "concise", label: "Concise" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
];

export const callToActionOptions: Array<{
  value: ColdEmailCallToAction;
  label: string;
}> = [
  { value: "conversation", label: "Conversation" },
  { value: "referral", label: "Referral" },
  { value: "interview", label: "Interview" },
  { value: "feedback", label: "Feedback" },
];
