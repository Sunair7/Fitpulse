import { asyncHandler } from '../middleware/errorHandler.js';
import { cloudinary, configureCloudinary } from '../config/cloudinary.js';

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!configureCloudinary()) {
    return res.status(503).json({
      message:
        'Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    });
  }
  if (!req.file?.buffer) {
    return res.status(400).json({ message: 'No image file provided' });
  }
  const maxBytes = 5 * 1024 * 1024;
  if (req.file.buffer.length > maxBytes) {
    return res.status(400).json({ message: 'Image must be 5MB or smaller' });
  }
  const mime = req.file.mimetype || 'image/jpeg';
  const dataUri = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'fitpulse/avatars',
    resource_type: 'image',
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  });
  res.json({ url: result.secure_url, publicId: result.public_id });
});
