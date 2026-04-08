import { model, models, Schema, type InferSchemaType } from 'mongoose';

const artisanSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, default: 'artisan' },
    phone: { type: String, trim: true, default: '' },
    profileImage: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    specialties: { type: [String], default: [] },
    artisanRating: { type: Number, min: 0, max: 5, default: 0 },
    memberSince: { type: Date, default: null },
  },
  { timestamps: true }
);

// const Artisan = models.Artisan || model('Artisan', artisanSchema);

const User = models.User || model('User', artisanSchema);

export default User;
