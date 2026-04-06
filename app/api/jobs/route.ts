import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { Job, CoordinatorSettings } from '@/lib/db/models';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = getTokenFromHeaders(req.headers);
    const decoded = token ? verifyToken(token) : null;

    // Check if system is frozen
    const settings = await CoordinatorSettings.findOne({});
    const isFrozen = settings?.isFrozen || false;

    let jobs;

    if (decoded?.role === 'company') {
      // Companies only see their own jobs - COMPANY ISOLATION
      jobs = await Job.find({ company: decoded.userId })
        .sort({ createdAt: -1 });
    } else if (decoded?.role === 'coordinator') {
      // Coordinators see all jobs
      jobs = await Job.find()
        .populate('company', 'name companyName')
        .sort({ createdAt: -1 });
    } else {
      // Students see all open jobs (no company info that reveals other companies)
      jobs = await Job.find({ isOpen: true })
        .select('-company') // Don't expose company ID
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ jobs, isFrozen });
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

    // Check if system is frozen - HARD CONSTRAINT
    const settings = await CoordinatorSettings.findOne({});
    if (settings?.isFrozen) {
      return NextResponse.json(
        { error: 'Cannot post jobs while system is frozen' },
        { status: 403 }
      );
    }

    const { title, description, requiredSkills, deadline } = await req.json();

    if (!title || !description || !requiredSkills || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields (title, description, skills, deadline)' },
        { status: 400 }
      );
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return NextResponse.json(
        { error: 'Deadline must be in the future' },
        { status: 400 }
      );
    }

    const job = new Job({
      title,
      description,
      requiredSkills,
      deadline: deadlineDate,
      company: decoded.userId,
      companyId: decoded.email,
      companyName: decoded.companyName || decoded.email,
      isOpen: true,
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
