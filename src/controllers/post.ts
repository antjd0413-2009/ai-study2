import { Request, Response } from 'express';
import pool from '../config/db';

export const createPost = async (req: any, res: Response) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT p.*, u.username, (SELECT COUNT(*) FROM recommendations r WHERE r.post_id = p.id) as recommendations FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC'
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT p.*, u.username, (SELECT COUNT(*) FROM recommendations r WHERE r.post_id = p.id) as recommendations FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};

export const updatePost = async (req: any, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const checkResult = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    const result = await pool.query(
      'UPDATE posts SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};

export const deletePost = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const checkResult = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: '게시글 삭제 성공' });
  } catch (err: any) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};
