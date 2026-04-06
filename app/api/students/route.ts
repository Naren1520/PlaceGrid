import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { User, Application } from '@/lib/db/models';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth-utils';

const PREDEFINED_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
  'MongoDB', 'SQL', 'AWS', 'Docker', 'Git', 'REST API', 'GraphQL',
  'HTML', 'CSS', 'Tailwind CSS', 'Next.js', 'Express.js'
];

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

    if (decoded.role === 'student') {
      // Get current student's profile
      const student = await User.findById(decoded.userId);
      const applications = await Application.find({ student: decoded.userId });
      
      const stats = {
        totalApplications: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
      };

      return NextResponse.json({ student, stats });
    } else if (decoded.role === 'coordinator') {
      // Get all students for coordinator
      const students = await User.find({ role: 'student' });
      
      const studentsWithStats = await Promise.all(
        students.map(async (student) => {
          const applications = await Application.find({ student: student._id });
          const avgMatchScore = applications.length > 0
            ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
            : 0;

          let riskLevel = 'LOW';
          if (avgMatchScore < 50) riskLevel = 'HIGH';
          else if (avgMatchScore < 70) riskLevel = 'MEDIUM';

          return {
            id: student._id,
            name: student.name,
            email: student.email,
            skills: student.skills || [],
            totalApplications: applications.length,
            acceptedApplications: applications.filter(a => a.status === 'accepted').length,
            avgMatchScore,
            riskLevel,
          };
        })
      );

      return NextResponse.json({ students: studentsWithStats });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
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
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can update their profile' },
        { status: 403 }
      );
    }

    const { skills, resume } = await req.json();

    const updates: any = {};
    if (skills) {
      // Validate skills
      const validSkills = skills.filter((s: string) => 
        PREDEFINED_SKILLS.includes(s) || s.length > 0
      );
      updates.skills = validSkills;
    }
    if (resume) {
      updates.resume = resume;
    }

    const student = await User.findByIdAndUpdate(
      decoded.userId,
      updates,
      { new: true }
    );

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}
