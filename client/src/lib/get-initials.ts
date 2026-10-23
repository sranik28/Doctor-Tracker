const HONORIFIC = /^(dr|prof|mr|mrs|ms)\.?$/i;

/** "Jane Doe" -> "JD", "Dr. Jane Doe" -> "JD", "admin" -> "A". */
export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter((part, index, parts) => !(HONORIFIC.test(part) && parts.length > 1))
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
