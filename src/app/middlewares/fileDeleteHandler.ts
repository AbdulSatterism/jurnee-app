/* eslint-disable @typescript-eslint/no-explicit-any */
/* middlewares/fileUploader.ts */
import multer from 'multer';
import catchAsync from '../../shared/catchAsync';
import streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';
import { deleteFromCloudinary } from '../../helpers/cloudinaryHelper';

// Memory storage for temporary files
const storage = multer.memoryStorage();

export const upload = (fields: any) => {
  const maxSize = Math.max(
    ...Object.values(fields).map((f: any) => f.size || 5 * 1024 * 1024),
  );
  return multer({ storage, limits: { fileSize: maxSize } }).fields(
    Object.keys(fields).map(field => ({
      name: field,
      maxCount: fields[field].maxCount || 1,
    })),
  );
};

// Upload to Cloudinary and return public_id
const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
) => {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.public_id ?? '');
      },
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

// Middleware to handle file uploads
export const fileUploader = (fields: any) =>
  catchAsync(async (req, res, next) => {
    await new Promise<void>((resolve, reject) =>
      upload(fields)(req, res, err => (err ? reject(err) : resolve())),
    );

    const files = req.files as { [field: string]: Express.Multer.File[] };

    for (const field of Object.keys(fields)) {
      if (files?.[field]?.length) {
        const uploadedIds = await Promise.all(
          files[field].map(file =>
            uploadToCloudinary(file, fields[field].folder),
          ),
        );

        // Delete old files if updating
        if (req.body[field]?.oldPublicId) {
          await deleteFromCloudinary(req.body[field].oldPublicId);
        }

        // Store new public_id in DB
        req.body[field] = uploadedIds.length > 1 ? uploadedIds : uploadedIds[0];
      }
    }

    next();
  });
