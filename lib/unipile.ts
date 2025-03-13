import { UnipileClient } from "unipile-node-sdk";

const client = new UnipileClient("https://api4.unipile.com:13459", process.env.NEXT_UNIPILE_ACCESS_TOKEN!);

export const UNIPINE_BASE_URL = "https://api4.unipile.com:13459";

export default client;
