const router = require('express').Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getUsers, toggleUser, getPlatformStats, getMonthlyActivity, deleteUser,
} = require('../controllers/adminController');

router.use(auth, adminAuth);
router.get('/users', getUsers);
router.put('/users/:userId/toggle', toggleUser);
router.delete('/users/:userId', deleteUser);
router.get('/stats', getPlatformStats);
router.get('/activity', getMonthlyActivity);

module.exports = router;
