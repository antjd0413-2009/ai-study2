import { Response } from 'express';
import pool from '../config/db';

export const toggleRecommendation = async (req: any, res: Response) => {
  const { post_id } = req.body;
  const userId = req.user.id;

  try {
    // Check if recommendation already exists
    const checkResult = await pool.query(
      'SELECT * FROM recommendations WHERE user_id = $1 AND post_id = $2',
      [userId, post_id]
    );

    if (checkResult.rows.length > 0) {
      // If exists, remove it (unlike)
      await pool.query(
        'DELETE FROM recommendations WHERE user_id = $1 AND post_id = $2',
        [userId, post_id]
      );
      return res.json({ recommended: false, message: '추천 취소' });
    } else {
      // If not exists, add it (like)
      await pool.query(
        'INSERT INTO recommendations (user_id, post_id) VALUES ($1, $2)',
        [userId, post_id]
      );
      return res.json({ recommended: true, message: '추천 완료' });
    }
  } catch (err: any) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};

export const getRecommendationStatus = async (req: any, res: Response) => {
  const { post_id } = req.params;
  const userId = req.user ? req.user.id : null;

  try {
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM recommendations WHERE post_id = $1',
      [post_id]
    );

    let userRecommended = false;
    if (userId) {
      const userCheck = await pool.query(
        'SELECT * FROM recommendations WHERE user_id = $1 AND post_id = $2',
        [userId, post_id]
      );
      userRecommended = userCheck.rows.length > 0;
    }

    res.json({
      count: parseInt(countResult.rows[0].count),
      userRecommended
    });
  } catch (err: any) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};
