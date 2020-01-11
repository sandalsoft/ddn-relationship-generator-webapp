import { formatDistanceToNow } from "date-fns";

const getTimeString = timestamp => {
  try {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.log(`timeforrmatting error: ${error}`);
    return `n/a`;
  }
};
export default getTimeString;
