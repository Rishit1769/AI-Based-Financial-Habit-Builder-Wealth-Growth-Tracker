const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAll, markRead, markAllRead, deleteOne, deleteAll } = require('../controllers/notificationController');

router.use(auth);
router.get('/', getAll);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/clear-read', deleteAll);
router.delete('/:id', deleteOne);

module.exports = router;
