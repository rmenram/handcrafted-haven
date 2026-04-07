import { Schema, model, models, InferSchemaType } from "mongoose";

const contactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    subject: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["new", "read", "resolved"],
      default: "new",
    },
  },
  { timestamps: true }
);

export type ContactDocument = InferSchemaType<typeof contactSchema>;

const Contact = models.Contact || model("Contact", contactSchema);

export default Contact;
