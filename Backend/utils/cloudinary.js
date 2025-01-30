import cloudinary from 'cloudinary';
import dotenv from "dotenv"
dotenv.config({})

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to cloudinary
export const uploadToCloudinary = async (file, folder) => {
    try {
        const result = await cloudinary.v2.uploader.upload(file.path, {
            folder: folder,
            width: 500,
            height: 500,
            crop: 'fill'
        });
        return {
            public_id: result.public_id,
            url: result.secure_url
        };
    } catch (error) {
        throw new Error(`Error uploading to Cloudinary: ${error.message}`);
    }
};

// Delete image from cloudinary
export const deleteFromCloudinary = async (public_id) => {
    try {
        if (public_id) {
            await cloudinary.v2.uploader.destroy(public_id);
        }
    } catch (error) {
        throw new Error(`Error deleting from Cloudinary: ${error.message}`);
    }
}; 