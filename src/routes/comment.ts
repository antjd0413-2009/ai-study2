import express from 'express';
import { createComment, getCommentsByPostId, deleteComment } from '../controllers/comment';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/:post_id', getCommentsByPostId);
router.post('/', authenticateToken, createComment);
router.delete('/:id', authenticateToken, deleteComment);

export default router;
