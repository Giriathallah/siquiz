import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Mengambil public_id dari URL Cloudinary
 * @param imageUrl URL gambar dari Cloudinary
 * @returns public_id atau null jika tidak ditemukan
 */
export const getPublicIdFromUrl = (imageUrl: string): string | null => {
  const regex = /v\d+\/(?:[a-zA-Z0-9_-]+\/)*([a-zA-Z0-9_-]+)(?:\.\w+)?$/;
  const match = imageUrl.match(regex);
  return match ? match[1] : null;
};

/**
 * Menghapus gambar dari Cloudinary berdasarkan public_id
 * @param publicId public_id gambar yang akan dihapus
 */
export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    // Sebaiknya tangani error ini, misal dengan logging service
  }
};

/**
 * Mengunggah file ke Cloudinary
 * @param fileBuffer Buffer dari file yang akan diunggah
 * @param folder Folder tujuan di Cloudinary
 * @returns Hasil upload dari Cloudinary
 */
export const uploadImage = (fileBuffer: Buffer, folder: string) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: "image" },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
