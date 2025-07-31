import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role,
      },
    });

    res.status(201).json({ message: 'User created', user });
  } catch (error: any) {
    console.error('Signup error:', error); // 👈 this is important
    res.status(500).json({ message: 'Signup error', error });
  }
};


export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user.id, role: user.role });
    return res.status(200).json({ token, user: { email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: 'Login error', error: err });
  }
}
