import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    res.status(201).json({ message: '회원가입 성공', user: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
    }
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password, autoLogin } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 틀립니다.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: autoLogin ? '30d' : '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: autoLogin ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    res.json({ message: '로그인 성공', user: { id: user.id, username: user.username } });
  } catch (err: any) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: '로그아웃 성공' });
};

export const me = (req: any, res: Response) => {
  res.json({ user: req.user });
};
