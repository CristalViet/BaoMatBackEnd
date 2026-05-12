const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const env = require("../config/env");

const s3Client = new S3Client({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
  },
});

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The file name
 * @param {string} mimeType - The file mime type
 * @returns {Promise<string>} - The S3 file URL
 */
exports.uploadFile = async (fileBuffer, fileName, mimeType) => {
  const key = `documents/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: env.aws.bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  return `https://${env.aws.bucketName}.s3.${env.aws.region}.amazonaws.com/${key}`;
};
