const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAll, create, update, addContribution, remove } = require('../controllers/savingsController');

router.use(auth);
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.post('/:id/contribute', addContribution);
router.delete('/:id', remove);

module.exports = router;
