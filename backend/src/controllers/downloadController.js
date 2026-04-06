const { getFileStream, BUCKET_APK } = require('../config/minio');

const downloadApk = async (req, res, next) => {
  try {
    const objectName = process.env.APK_OBJECT_NAME || 'financial-habit-builder.apk';
    const stream = await getFileStream(BUCKET_APK, objectName);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${objectName}"`);
    stream.pipe(res);
  } catch (err) {
    if (err.code === 'NoSuchKey' || err.message?.includes('does not exist')) {
      return res.status(404).json({ success: false, message: 'APK not yet available. Check back soon!' });
    }
    next(err);
  }
};

module.exports = { downloadApk };
