import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import { getActorFromHeaders, requireActorAccess } from '@/lib/auth';
import { AgreementEvent, AGREEMENT_EVENT_TYPES } from '@/models/AgreementEvent';

function getRequestMeta(req) {
  return {
    ipAddress:
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null,
    userAgent: req.headers.get('user-agent') || null,
  };
}

function buildHash(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function GET(req, context) {
  try {
    const actor = getActorFromHeaders(req.headers);

    if (!actor.userId || (!actor.isActorAllowed && !actor.isAdmin)) {
      return Response.json(
        { message: 'Only Service Providers, Clients, or Admins can view records.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { agreementId } = await context.params;

    const events = await AgreementEvent.find({ agreementId, isArchived: false })
      .sort({ createdAt: 1 })
      .lean();

    return Response.json({ agreementId, count: events.length, events }, { status: 200 });
  } catch (error) {
    return Response.json({ message: 'Failed to fetch agreement events.', error: error.message }, { status: 500 });
  }
}

export async function POST(req, context) {
  try {
    const actor = getActorFromHeaders(req.headers);
    const access = requireActorAccess(actor);

    if (!access.ok) {
      return access.response;
    }

    const body = await req.json();
    const { eventType, title, description } = body;

    if (!eventType || !title || !description) {
      return Response.json(
        { message: 'eventType, title, and description are required.' },
        { status: 400 }
      );
    }

    if (!AGREEMENT_EVENT_TYPES.includes(eventType)) {
      return Response.json({ message: 'Invalid eventType value.' }, { status: 400 });
    }

    await connectToDatabase();

    const { agreementId } = await context.params;
    const metadata = getRequestMeta(req);
    const createdAt = new Date();

    const hashPayload = {
      agreementId,
      eventType,
      title,
      description,
      actorId: actor.userId,
      actorRole: actor.role,
      createdAt: createdAt.toISOString(),
    };

    const event = await AgreementEvent.create({
      agreementId,
      eventType,
      title,
      description,
      actor: {
        userId: actor.userId,
        role: actor.role,
        userName: actor.userName,
      },
      metadata,
      recordHash: buildHash(hashPayload),
      createdAt,
    });

    return Response.json({ message: 'Event recorded.', event }, { status: 201 });
  } catch (error) {
    return Response.json({ message: 'Failed to record event.', error: error.message }, { status: 500 });
  }
}
