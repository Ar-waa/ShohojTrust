import mongoose from 'mongoose';

const AGREEMENT_EVENT_TYPES = [
  'agreement_created',
  'agreement_sent',
  'agreement_confirmed',
  'agreement_signed',
  'payment_completed',
  'deadline_reminder',
  'deadline_missed',
  'dispute_raised',
  'dispute_resolved',
  'agreement_exported',
  'agreement_email_sent',
];

const AgreementEventSchema = new mongoose.Schema(
  {
    agreementId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    eventType: {
      type: String,
      enum: AGREEMENT_EVENT_TYPES,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    actor: {
      userId: { type: String, required: true, index: true },
      role: { type: String, enum: ['service_provider', 'client', 'admin'], required: true },
      userName: { type: String, required: true },
    },
    metadata: {
      ipAddress: { type: String, default: null },
      userAgent: { type: String, default: null },
    },
    recordHash: {
      type: String,
      required: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  }
);

AgreementEventSchema.index({ agreementId: 1, createdAt: -1 });

export const AgreementEvent =
  mongoose.models.AgreementEvent || mongoose.model('AgreementEvent', AgreementEventSchema);

export { AGREEMENT_EVENT_TYPES };
