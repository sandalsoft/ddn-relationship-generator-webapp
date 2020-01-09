import { formatDistanceToNow } from "date-fns";

const getTimeString = timestamp =>
  formatDistanceToNow(new Date(timestamp), { addSuffix: true });

export default getTimeString;
