import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_API_KEY,
});

export async function uploadToFal(file) {
  const url = await fal.storage.upload(file);
  return url;
}
