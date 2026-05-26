import mongoose, { Schema, Document } from "mongoose";

export interface IReservation extends Document {
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  request?: string;
  createdAt: Date;
}

const ReservationSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: 1,
    },
    request: {
      type: String,
    },
  },
  { timestamps: true }
);

const Reservation = mongoose.models.Reservation || mongoose.model<IReservation>("Reservation", ReservationSchema);

export default Reservation;
