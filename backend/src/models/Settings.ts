import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  whatsappNumber: string;
}

const settingsSchema = new Schema<ISettings>(
  {
    whatsappNumber: {
      type: String,
      default: '+8801XXXXXXXXX',
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model<ISettings>('Settings', settingsSchema);

export default Settings;
