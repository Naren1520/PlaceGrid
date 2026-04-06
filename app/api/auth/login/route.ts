import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { verifyPassword, signToken } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Check for hardcoded admin coordinator credentials
    if (email === 'admin' && password === 'admin123') {
      const token = signToken({
        userId: 'admin',
        email: 'admin',
        role: 'coordinator',
      });

      return NextResponse.json({
        token,
        user: {
          id: 'admin',
          email: 'admin',
          name: 'Administrator',
          role: 'coordinator',
        },
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordMatch = await verifyPassword(password, user.password || '');
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyName: user.companyName,
        ...(user.role === 'student' && {
          phone: user.phone,
          university: user.university,
          graduationYear: user.graduationYear,
          githubUsername: user.githubUsername,
          skills: user.skills,
        }),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
