import { Router } from 'express';
import { login, changePassword, createUser, authenticateToken, requireAdmin, getProfile } from '../controllers/authController.js';

const router = Router();

// GET CURRENT USER PROFILE
router.get('/profile', authenticateToken, getProfile);

// LOGIN
router.post('/login', login);

// CHANGE PASSWORD (authenticated)
router.post('/change-password', authenticateToken, changePassword);

// ADMIN: CREATE USER
router.post('/admin/create-user', authenticateToken, requireAdmin, createUser);

export default router;