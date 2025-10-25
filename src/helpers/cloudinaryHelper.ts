/* eslint-disable @typescript-eslint/no-explicit-any */
/* helpers/cloudinaryHelper.ts */
import { v2 as cloudinary } from 'cloudinary';
import chalk from 'chalk';
import { Buffer } from 'buffer';
import config from '../config';
import { errorLogger, logger } from '../shared/logger';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

/**
 * Upload buffer to Cloudinary and return public_id
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string,
) => {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) return reject(err);
        resolve(result?.public_id ?? '');
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * Delete a file from Cloudinary by public_id
 */
export const deleteFromCloudinary = async (url: string) => {
  const regex = /\/v\d+\/(.+)\.\w{3,4}$/;
  const match = url.match(regex);
  const publicId = match ? match[1] : null;

  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    logger.info(chalk.green(`✔ Deleted from Cloudinary: ${publicId}`));
  } catch (error: any) {
    errorLogger.error(
      chalk.red(`❌ Failed to delete Cloudinary file: ${publicId}`),
      error?.stack ?? error,
    );
  }
};

/**
 * Generate full URL from public_id
 */
export const getCloudinaryUrl = (publicId: string) => {
  if (!publicId) return '';
  return cloudinary.url(publicId, { secure: true });
};
