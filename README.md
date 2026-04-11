# Agreement Event Timeline (Next.js + MongoDB)

Implements the feature:
- Service Providers and Clients can record agreement-related actions as timestamped events.
- System Administrators can view and manage securely stored records.

## Setup

1. Copy `.env.example` to `.env.local`
2. Set your MongoDB connection string in `MONGODB_URI`
3. Run:
   - `npm run dev`

## Header-based role simulation

Use request headers:
- `x-user-id`: user id (required)
- `x-user-name`: display name (optional)
- `x-user-role`: `service_provider` | `client` | `admin`

## API Endpoints

### User endpoints
- `GET /api/agreements/:agreementId/events`
  - Accessible by `service_provider`, `client`, `admin`
- `POST /api/agreements/:agreementId/events`
  - Accessible by `service_provider`, `client`
  - Body:
  ```json
  {
    "eventType": "agreement_created",
    "title": "Agreement Created",
    "description": "You created the agreement."
  }
  ```

### Admin endpoints
- `GET /api/admin/events`
  - Optional query: `agreementId`, `eventType`
  - Admin only
- `PATCH /api/admin/events`
  - Admin archive/unarchive
  - Body:
  ```json
  {
    "eventId": "<mongodb_object_id>",
    "isArchived": true
  }
  ```

## Security notes

- Each event stores:
  - Actor info
  - Timestamp (`createdAt`)
  - Request metadata (IP/User-Agent)
  - SHA-256 `recordHash` to improve tamper detection
- Soft-management is done with `isArchived` (records remain auditable)

## UI

The root page (`/`) renders the requested timeline card design.
