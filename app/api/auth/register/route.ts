import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { hashPassword, signToken } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    // Connect to database with error handling
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    const { 
      email, 
      name, 
      password, 
      role, 
      companyName, 
      companyId,
      // Student fields
      phone,
      university,
      graduationYear,
      githubUsername,
      skills,
    } = await req.json();

    // Validation
    if (!email || !name || !role || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role === 'student' && !phone) {
      return NextResponse.json(
        { error: 'Phone number required for students' },
        { status: 400 }
      );
    }

    if (!['student', 'company', 'coordinator'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email,
      name,
      password: hashedPassword,
      role,
      companyName: role === 'company' ? companyName : undefined,
      companyId: role === 'company' ? companyId || `company_${Date.now()}` : undefined,
      // Student specific fields
      ...(role === 'student' && {
        phone,
        university,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        githubUsername,
        skills: skills || [],
      }),
    });

    await user.save();

    // Create token
    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyName: user.companyName,
          // Student fields
          ...(role === 'student' && {
            phone: user.phone,
            university: user.university,
            graduationYear: user.graduationYear,
            githubUsername: user.githubUsername,
            skills: user.skills,
          }),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
