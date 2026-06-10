import express from 'express';
import { register, login, logout, me } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateToken, me);

export default router;
