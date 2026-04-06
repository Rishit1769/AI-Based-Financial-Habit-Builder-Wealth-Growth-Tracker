const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAdvice, getHistory } = require('../controllers/aiController');

router.use(auth);
router.post('/advice', getAdvice);
router.get('/history', getHistory);

module.exports = router;
