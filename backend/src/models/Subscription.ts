import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date | null; // null = lifetime
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: [true, 'Package is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null, // null = lifetime
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if subscription is expired
subscriptionSchema.virtual('isExpired').get(function() {
  if (!this.endDate) return false; // Lifetime
  return new Date() > this.endDate;
});

// Ensure virtuals are included in JSON
subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);

export default Subscription;
