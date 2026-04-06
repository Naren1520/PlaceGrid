import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { hashPassword } from '@/lib/auth-utils';
import { getTokenFromHeaders, verifyToken } from '@/lib/auth-utils';

// GET all companies
export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'coordinator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const companies = await User.find({ role: 'company' }).select('-password');

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new company
export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'coordinator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { email, password, companyName } = await req.json();

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: 'Email, password, and company name are required' },
        { status: 400 }
      );
    }

    // Check if company already exists
    const existingCompany = await User.findOne({ email });
    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const company = await User.create({
      email,
      password: hashedPassword,
      name: companyName,
      companyName,
      role: 'company',
      companyId: email,
      isActive: true,
    });

    return NextResponse.json({
      message: 'Company created successfully',
      company: {
        id: company._id,
        email: company.email,
        companyName: company.companyName,
      },
    });
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
