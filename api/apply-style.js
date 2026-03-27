import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export default async function handler(req, res) {
  const { selfie_url, mask_url, style_image_url } = req.body;

  const output = await replicate.run(
    "stability-ai/sdxl-inpainting:95353231ca6f5784c502fb4b917f69222c813735f49298444a7f9202166699d1",
    {
      input: {
        image: selfie_url,
        mask: mask_url,
        prompt: "A woman wearing precise Ghana weaving braids, professional photography, high resolution, detailed scalp parts",
        condition_scale: 0.5,
        controlnet_conditioning_scale: 0.8,
        image_to_become: style_image_url // La coiffure cible
      }
    }
  );

  res.status(200).json({ final_image: output[0] });
}

