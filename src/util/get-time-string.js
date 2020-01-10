import { formatDistanceToNow } from "date-fns";

const getTimeString = timestamp => {
  try {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    typeof error === "string"
      ? console.log(`error: error`)
      : console.log(`error: ${JSON.stringify(error)}`);
    return `n/a`;
  }
};
export default getTimeString;
