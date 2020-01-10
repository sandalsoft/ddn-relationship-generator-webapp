import { formatDistanceToNow } from "date-fns";

const getTimeString = timestamp => {
  try {
    console.log(`timestamp: ${JSON.stringify(timestamp)}`);
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.log(`timeforrmatting error: ${error}`);
    return `n/a`;
  }
};
export default getTimeString;
