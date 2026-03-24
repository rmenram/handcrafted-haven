import { model, models, Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true, default: '' },
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
if (existingUserModel && !existingUserModel.schema.path('phone')) {
  existingUserModel.schema.add({
    phone: { type: String, trim: true, default: '' },
  });
}

const User = existingUserModel || model('User', userSchema);

export default User;
