import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { Job, CoordinatorSettings } from '@/lib/db/models';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Check if system is frozen
    const settings = await CoordinatorSettings.findOne({});
    if (settings?.isFrozen) {
      return NextResponse.json({
        jobs: [],
        isFrozen: true,
        message: 'Placement system is currently frozen',
      });
    }

    const jobs = await Job.find({ isOpen: true })
      .populate('company', 'name companyName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'company') {
      return NextResponse.json(
        { error: 'Only companies can post jobs' },
        { status: 403 }
      );
    }

    // Check if system is frozen
    const settings = await CoordinatorSettings.findOne({});
    if (settings?.isFrozen) {
      return NextResponse.json(
        { error: 'Cannot post jobs while system is frozen' },
        { status: 403 }
      );
    }

    const { title, description, requiredSkills, deadline } = await req.json();

    if (!title || !description || !requiredSkills) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const job = new Job({
      title,
      description,
      requiredSkills,
      deadline: deadline ? new Date(deadline) : null,
      company: decoded.userId,
      companyId: decoded.companyId,
      companyName: decoded.companyName,
    });

    await job.save();

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
