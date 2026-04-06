import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { Application, Job, User, CoordinatorSettings } from '@/lib/db/models';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth-utils';

const PREDEFINED_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
  'MongoDB', 'SQL', 'AWS', 'Docker', 'Git', 'REST API', 'GraphQL',
  'HTML', 'CSS', 'Tailwind CSS', 'Next.js', 'Express.js'
];

function calculateMatchScore(studentSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 100;
  const matches = studentSkills.filter(skill => requiredSkills.includes(skill)).length;
  return Math.round((matches / requiredSkills.length) * 100);
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    let applications;

    if (decoded.role === 'student') {
      // Students see their own applications
      applications = await Application.find({ student: decoded.userId })
        .populate('job')
        .populate('company', 'name companyName')
        .sort({ appliedAt: -1 });
    } else if (decoded.role === 'company') {
      // Companies see applications to their jobs
      applications = await Application.find({ company: decoded.userId })
        .populate('job')
        .populate('student', 'name email skills')
        .sort({ appliedAt: -1 });
    } else {
      // Coordinators see all
      applications = await Application.find()
        .populate('job')
        .populate('student', 'name email skills')
        .populate('company', 'name companyName')
        .sort({ appliedAt: -1 });
    }

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
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
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can apply' },
        { status: 403 }
      );
    }

    // Check if system is frozen
    const settings = await CoordinatorSettings.findOne({});
    if (settings?.isFrozen) {
      return NextResponse.json(
        { error: 'Applications are frozen' },
        { status: 403 }
      );
    }

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      );
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if student already applied
    const existingApp = await Application.findOne({
      student: decoded.userId,
      job: jobId,
    });
    if (existingApp) {
      return NextResponse.json(
        { error: 'Already applied to this job' },
        { status: 409 }
      );
    }

    const student = await User.findById(decoded.userId);
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const matchScore = calculateMatchScore(student.skills || [], job.requiredSkills);

    const application = new Application({
      student: decoded.userId,
      studentName: student.name,
      studentEmail: student.email,
      job: jobId,
      company: job.company,
      companyName: job.companyName,
      studentSkills: student.skills || [],
      matchScore,
    });

    await application.save();
    job.applications.push(application._id);
    await job.save();

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const token = getTokenFromHeaders(req.headers);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'company') {
      return NextResponse.json(
        { error: 'Only companies can update applications' },
        { status: 403 }
      );
    }

    const { applicationId, status } = await req.json();

    if (!applicationId || !status || !['pending', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid application ID or status' },
        { status: 400 }
      );
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    ).populate('job');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
