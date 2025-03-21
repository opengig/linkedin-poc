import { UnipileClient } from "unipile-node-sdk";

const client = new UnipileClient("https://api11.unipile.com:14141", process.env.NEXT_UNIPILE_ACCESS_TOKEN!);

export const UNIPINE_BASE_URL = "https://api11.unipile.com:14141";

export default client;
