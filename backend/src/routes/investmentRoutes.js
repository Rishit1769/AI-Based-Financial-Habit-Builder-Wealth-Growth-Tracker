const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAll, create, update, remove, getSummary } = require('../controllers/investmentController');

router.use(auth);
router.get('/', getAll);
router.get('/summary', getSummary);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
