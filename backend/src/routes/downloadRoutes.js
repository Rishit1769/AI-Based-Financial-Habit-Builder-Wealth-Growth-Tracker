const router = require('express').Router();
const { downloadApk } = require('../controllers/downloadController');

router.get('/apk', downloadApk);

module.exports = router;
