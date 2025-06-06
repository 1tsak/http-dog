const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const listController = require('../controllers/listController');

router.post('/', auth, listController.createList);
router.get('/', auth, listController.getLists);
router.get('/:id', auth, listController.getList);
router.put('/:id', auth, listController.updateList);
router.delete('/:id', auth, listController.deleteList);

module.exports = router; 