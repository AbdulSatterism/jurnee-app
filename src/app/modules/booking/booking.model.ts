import { model, Schema } from 'mongoose';
import { IBooking } from './booking.interface';

const bookingSchema = new Schema<IBooking>(
  {
    orderId: { type: String, required: true, unique: true },
    service: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleId: { type: Schema.Types.ObjectId, required: true }, // schedule._id
    slotId: { type: Schema.Types.ObjectId, required: true }, // timeSlots._id
    slotStart: { type: String, required: true }, // "10:00"
    slotEnd: { type: String, required: true }, // "11:00"
    status: {
      type: String,
      enum: ['PENDING', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
    },
    amount: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Booking = model<IBooking>('Booking', bookingSchema);
