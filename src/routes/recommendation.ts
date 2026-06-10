import express from 'express';
import { toggleRecommendation, getRecommendationStatus } from '../controllers/recommendation';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/:post_id', getRecommendationStatus);
router.post('/toggle', authenticateToken, toggleRecommendation);

export default router;
