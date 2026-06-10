import express from 'express';
import { createPost, getPosts, getPostById, updatePost, deletePost } from '../controllers/post';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', authenticateToken, createPost);
router.put('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);

export default router;
