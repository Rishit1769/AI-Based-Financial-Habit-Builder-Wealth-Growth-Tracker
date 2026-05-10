const router = require('express').Router();
const auth = require('../middleware/auth');
const { generate, emailReport, getAll, downloadReport } = require('../controllers/reportController');

router.use(auth);
router.get('/', getAll);
router.post('/generate', generate);
router.get('/:reportId/download', downloadReport);
router.post('/:reportId/email', emailReport);

module.exports = router;
