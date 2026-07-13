import logger from '../config/logger.js';

// @desc    Generate AI Image
// @route   POST /api/image/generate
// @access  Private
export const generateImage = async (req, res, next) => {
  try {
    const { prompt, size = '1024x1024' } = req.body;

    if (!prompt) {
      res.status(400);
      throw new Error('Please provide an image prompt');
    }

    const openAIKey = process.env.OPENAI_API_KEY;

    if (openAIKey) {
      logger.info(`Generating image via DALL-E for prompt: ${prompt}`);
      // Request OpenAI DALL-E API
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          prompt,
          n: 1,
          size
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate image via DALL-E');
      }

      return res.status(200).json({
        success: true,
        url: data.data[0].url,
        provider: 'OpenAI DALL-E'
      });
    } else {
      logger.info(`Generating image via Pollinations.ai (Keyless Fallback) for prompt: ${prompt}`);
      // Fallback: Pollinations.ai offers incredibly fast, free, keyless Stable Diffusion generation.
      // Format: https://image.pollinations.ai/prompt/{prompt}?width=1024&height=1024&nologo=true&seed={random}
      const randomSeed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;
      
      return res.status(200).json({
        success: true,
        url: imageUrl,
        provider: 'Pollinations.ai (Stable Diffusion)'
      });
    }
  } catch (error) {
    logger.error('Image Generation Error: %O', error);
    next(error);
  }
};
