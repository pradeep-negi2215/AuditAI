import { Resend } from "resend";

let cachedClient: Resend | null = null;

export const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set.");
  }

  if (!cachedClient) {
    cachedClient = new Resend(apiKey);
  }

  return cachedClient;
};
