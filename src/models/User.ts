import { model, models, Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true, default: '' },
    profileImage: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    specialties: { type: [String], default: [] },
    memberSince: { type: Date, default: null },
    artisanRating: { type: Number, min: 0, max: 5, default: 0 },
    role: {
      type: String,
      enum: ['purchaser', 'artisan', 'admin'],
      default: 'purchaser',
      required: true,
    },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

const existingUserModel = models.User;

// In dev hot-reload, an older cached model can miss newly added paths.
if (existingUserModel) {
  if (!existingUserModel.schema.path('phone')) {
    existingUserModel.schema.add({
      phone: { type: String, trim: true, default: '' },
    });
  }

  if (!existingUserModel.schema.path('profileImage')) {
    existingUserModel.schema.add({
      profileImage: { type: String, trim: true, default: '' },
    });
  }

  if (!existingUserModel.schema.path('location')) {
    existingUserModel.schema.add({
      location: { type: String, trim: true, default: '' },
    });
  }

  if (!existingUserModel.schema.path('bio')) {
    existingUserModel.schema.add({
      bio: { type: String, trim: true, default: '' },
    });
  }

  if (!existingUserModel.schema.path('specialties')) {
    existingUserModel.schema.add({
      specialties: { type: [String], default: [] },
    });
  }

  if (!existingUserModel.schema.path('memberSince')) {
    existingUserModel.schema.add({
      memberSince: { type: Date, default: null },
    });
  }

  if (!existingUserModel.schema.path('artisanRating')) {
    existingUserModel.schema.add({
      artisanRating: { type: Number, min: 0, max: 5, default: 0 },
    });
  }
}

const User = existingUserModel || model('User', userSchema);

export default User;
