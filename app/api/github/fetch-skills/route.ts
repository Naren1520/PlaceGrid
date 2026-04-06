import { NextRequest, NextResponse } from 'next/server';
import { fetchStudentSkillsFromGitHub } from '@/lib/github-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      );
    }

    // Fetch skills from GitHub
    const result = await fetchStudentSkillsFromGitHub(username);

    if (result.error) {
      return NextResponse.json(
        { 
          error: result.error,
          skills: [],
          githubUrl: result.githubUrl,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      skills: result.skills,
      githubUrl: result.githubUrl,
      username: username,
    });
  } catch (error) {
    console.error('Error in GitHub skills endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub skills' },
      { status: 500 }
    );
  }
}
