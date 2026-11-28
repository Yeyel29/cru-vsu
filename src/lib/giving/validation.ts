import type { DonationDesignationType } from "@/types/database";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface DonationValidationInput {
  designationType: DonationDesignationType;
  recipientProfileId: string;
  recipientCustomName: string;
  amountPhp: number;
  channelId: string;
  channelNameSnapshot: string;
  isAnonymous: boolean;
  donorName: string;
  donorEmail: string;
}

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

/**
 * Validates donation form fields before any storage upload or DB write.
 * Returns an error message string, or null when valid.
 */
export function validateDonationFields(
  input: DonationValidationInput
): string | null {
  if (
    input.designationType === "specific_person" &&
    !input.recipientProfileId &&
    !input.recipientCustomName
  ) {
    return "Please select a person or enter their name for this gift.";
  }

  if (input.recipientProfileId && !isValidUuid(input.recipientProfileId)) {
    return "Selected recipient is invalid. Please choose again.";
  }

  if (input.channelId && !isValidUuid(input.channelId)) {
    return "Selected giving channel is invalid. Please choose again.";
  }

  if (
    !Number.isFinite(input.amountPhp) ||
    input.amountPhp <= 0 ||
    input.amountPhp > 10000000
  ) {
    return "Please enter a valid amount in Philippine Pesos (PHP).";
  }

  if (!input.channelNameSnapshot) {
    return "Please indicate which Cru EV channel you used for the transfer.";
  }

  if (!input.isAnonymous && input.donorName.length < 2) {
    return "Please enter your name, or check Give anonymously.";
  }

  if (input.donorEmail && !isValidEmail(input.donorEmail)) {
    return "Please enter a valid email address or leave it blank.";
  }

  return null;
}
