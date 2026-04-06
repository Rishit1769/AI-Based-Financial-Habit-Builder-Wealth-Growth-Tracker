const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getAll, create, update, remove,
  completeHabit, uncompleteHabit, getCompletions, getStreak, getStats,
} = require('../controllers/habitController');

router.use(auth);
router.get('/', getAll);
router.get('/stats', getStats);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/complete', completeHabit);
router.delete('/:id/complete', uncompleteHabit);
router.get('/:id/completions', getCompletions);
router.get('/:id/streak', getStreak);

module.exports = router;
