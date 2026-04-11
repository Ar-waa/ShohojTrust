import { connectToDatabase } from '@/lib/db';
import { getActorFromHeaders, requireAdminAccess } from '@/lib/auth';
import { AgreementEvent } from '@/models/AgreementEvent';

export async function GET(req) {
  try {
    const actor = getActorFromHeaders(req.headers);
    const access = requireAdminAccess(actor);

    if (!access.ok) {
      return access.response;
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const agreementId = searchParams.get('agreementId');
    const eventType = searchParams.get('eventType');

    const filter = {};

    if (agreementId) {
      filter.agreementId = agreementId;
    }

    if (eventType) {
      filter.eventType = eventType;
    }

    const events = await AgreementEvent.find(filter).sort({ createdAt: -1 }).limit(500).lean();

    return Response.json({ count: events.length, events }, { status: 200 });
  } catch (error) {
    return Response.json({ message: 'Failed to load admin event records.', error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const actor = getActorFromHeaders(req.headers);
    const access = requireAdminAccess(actor);

    if (!access.ok) {
      return access.response;
    }

    const body = await req.json();
    const { eventId, isArchived } = body;

    if (!eventId || typeof isArchived !== 'boolean') {
      return Response.json({ message: 'eventId and boolean isArchived are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const updated = await AgreementEvent.findByIdAndUpdate(
      eventId,
      { isArchived },
      { new: true }
    );

    if (!updated) {
      return Response.json({ message: 'Event not found.' }, { status: 404 });
    }

    return Response.json({ message: 'Event record updated.', event: updated }, { status: 200 });
  } catch (error) {
    return Response.json({ message: 'Failed to update admin event record.', error: error.message }, { status: 500 });
  }
}
