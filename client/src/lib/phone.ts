import { parsePhoneNumberFromString } from 'libphonenumber-js/min';

// "min" metadata on purpose: the phone field and the API (server/src/validations) use the
// same set, so the form never accepts a number the server would reject.

/** True when the string is a real phone number for its country (needs a "+" country code). */
export const isValidPhone = (value: string): boolean =>
  parsePhoneNumberFromString(value)?.isValid() ?? false;

/** "+880 1711-123456" -> "+8801711123456"; returns the input when it can't be parsed. */
export const toE164 = (value: string): string => parsePhoneNumberFromString(value)?.number ?? value;

/** "+8801711123456" -> "+880 1711 123456", for display. */
export const formatPhone = (value: string): string =>
  parsePhoneNumberFromString(value)?.formatInternational() ?? value;
