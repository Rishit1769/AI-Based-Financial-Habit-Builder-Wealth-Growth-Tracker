const router = require('express').Router();
const auth = require('../middleware/auth');
const { getDashboard, getMonthlyComparison } = require('../controllers/dashboardController');

router.use(auth);
router.get('/', getDashboard);
router.get('/monthly-comparison', getMonthlyComparison);

module.exports = router;
