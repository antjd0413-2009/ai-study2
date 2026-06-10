import { Request, Response } from 'express';
import pool from '../config/db';

export const createComment = async (req: any, res: Response) => {
  const { post_id, content, is_anonymous } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, content, is_anonymous) VALUES ($1, $2, $3, $4) RETURNING *',
      [post_id, userId, content, is_anonymous || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};

export const getCommentsByPostId = async (req: Request, res: Response) => {
  const { post_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        c.id, 
        c.post_id, 
        c.content, 
        c.is_anonymous, 
        c.created_at,
        CASE WHEN c.is_anonymous THEN '익명' ELSE u.username END as username,
        c.user_id
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.post_id = $1 
      ORDER BY c.created_at ASC`,
      [post_id]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};

export const deleteComment = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const checkResult = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }
    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ message: '댓글 삭제 성공' });
  } catch (err: any) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};
