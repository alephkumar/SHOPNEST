const express = require('express');
const router = express.Router();

const {
  updateProfile,
  updateAvatar,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  updateUserByAdmin,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(protect);

router.put('/profile', updateProfile);
router.put('/avatar', upload.single('avatar'), updateAvatar);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Admin
router.get('/', authorize('admin'), getAllUsers);
router.put('/:id', authorize('admin'), updateUserByAdmin);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
