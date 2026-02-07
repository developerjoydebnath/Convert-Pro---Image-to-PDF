import mongoose, { Document, Schema } from 'mongoose';

export interface IPackage extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  duration: number; // days, 0 = lifetime
  description: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 0, // 0 = lifetime
    },
    description: {
      type: String,
      trim: true,
    },
    features: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Package = mongoose.model<IPackage>('Package', packageSchema);

export default Package;
