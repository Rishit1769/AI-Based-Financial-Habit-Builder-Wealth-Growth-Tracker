const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_REPORTS = process.env.MINIO_BUCKET_REPORTS || 'reports';
const BUCKET_APK = process.env.MINIO_BUCKET_APK || 'apk';

const ensureBuckets = async () => {
  const buckets = [BUCKET_REPORTS, BUCKET_APK];
  for (const bucket of buckets) {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket, 'us-east-1');
      console.log(`✅ MinIO bucket created: ${bucket}`);
    }
  }
};

const uploadFile = async (bucketName, objectName, buffer, contentType = 'application/octet-stream') => {
  await minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
    'Content-Type': contentType,
  });
  return objectName;
};

const getFileStream = async (bucketName, objectName) => {
  return minioClient.getObject(bucketName, objectName);
};

const getPresignedUrl = async (bucketName, objectName, expiry = 3600) => {
  return minioClient.presignedGetObject(bucketName, objectName, expiry);
};

const deleteFile = async (bucketName, objectName) => {
  await minioClient.removeObject(bucketName, objectName);
};

module.exports = {
  minioClient,
  BUCKET_REPORTS,
  BUCKET_APK,
  ensureBuckets,
  uploadFile,
  getFileStream,
  getPresignedUrl,
  deleteFile,
};
