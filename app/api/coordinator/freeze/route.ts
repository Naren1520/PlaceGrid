import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { CoordinatorSettings } from '@/lib/db/models';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const settings = await CoordinatorSettings.findOne({});

    if (!settings) {
      const newSettings = new CoordinatorSettings({
        isFrozen: false,
      });
      await newSettings.save();
      return NextResponse.json({ isFrozen: false, frozenAt: null, reason: null });
    }

    return NextResponse.json({
      isFrozen: settings.isFrozen,
      frozenAt: settings.frozenAt,
      reason: settings.reason,
    });
  } catch (error) {
    console.error('Error fetching freeze status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch freeze status' },
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
    if (!decoded || decoded.role !== 'coordinator') {
      return NextResponse.json(
        { error: 'Only coordinators can manage freeze' },
        { status: 403 }
      );
    }

    const { action, reason } = await req.json();

    if (!['freeze', 'unfreeze'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    let settings = await CoordinatorSettings.findOne({});
    if (!settings) {
      settings = new CoordinatorSettings({});
    }

    if (action === 'freeze') {
      settings.isFrozen = true;
      settings.frozenAt = new Date();
      settings.frozenBy = decoded.userId;
      settings.reason = reason || 'Placement process frozen by coordinator';
    } else {
      settings.isFrozen = false;
      settings.frozenAt = undefined;
      settings.frozenBy = undefined;
      settings.reason = undefined;
    }

    await settings.save();

    return NextResponse.json({
      message: `System ${action}ed successfully`,
      isFrozen: settings.isFrozen,
      frozenAt: settings.frozenAt,
    });
  } catch (error) {
    console.error('Error managing freeze:', error);
    return NextResponse.json(
      { error: 'Failed to manage freeze' },
      { status: 500 }
    );
  }
}
