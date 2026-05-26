"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";
import { FaCalendarAlt, FaClock, FaUserFriends, FaSpinner, FaCheckCircle, FaExclamationCircle, FaLock } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Reservation() {
  const { data: session, status } = useSession();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: session?.user?.email || "",
      date: "",
      time: "",
      guests: 2,
      request: ""
    }
  });

  const onSubmit = async (data: any) => {
    setServerError("");
    setSuccessMessage("");
    
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to submit reservation.");
      }

      setSuccessMessage("Your reservation has been successfully confirmed!");
      reset(); // Clear the form
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <section id="reservation" className="py-24 bg-cafe-surface relative">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-cafe-primary/5"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-cafe-primary/10">
          <div className="p-8 md:p-16">
            <SectionHeading 
              subtitle="Reserve Your Table"
              title="Book Your Perfect Spot"
              centered={true}
            />
            
            <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
              Whether it's a quiet morning coffee, a business lunch, or a weekend brunch with friends, 
              we'd love to host you. Reserve your table below.
            </p>

            {/* Dynamic Server Error / Success Messages */}
            {serverError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-8 border border-red-100 animate-fade-in-up">
                <FaExclamationCircle className="flex-shrink-0" size={16} />
                <span>{serverError}</span>
              </div>
            )}
            
            {successMessage && (
              <div className="flex items-center gap-2 bg-green-50 text-green-600 p-4 rounded-xl text-sm mb-8 border border-green-100 animate-fade-in-up">
                <FaCheckCircle className="flex-shrink-0" size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Auth Gate for Reservations */}
            {status === "unauthenticated" ? (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center animate-fade-in-up">
                <div className="mx-auto w-16 h-16 bg-cafe-primary/10 rounded-full flex items-center justify-center mb-4">
                   <FaLock className="text-cafe-primary text-2xl" />
                </div>
                <h3 className="text-2xl font-serif text-cafe-dark font-bold mb-2">Login Required to Book</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  To ensure the highest quality experience and prevent automated bookings, we require our guests to create an account or log in before reserving a table.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/login" className="px-8 py-3 bg-cafe-primary text-white rounded-full font-bold uppercase tracking-wide hover:bg-cafe-secondary transition-all">
                    Log In
                  </Link>
                  <Link href="/signup" className="px-8 py-3 border border-cafe-primary text-cafe-primary bg-transparent rounded-full font-bold uppercase tracking-wide hover:bg-cafe-primary hover:text-white transition-all">
                    Sign Up
                  </Link>
                </div>
              </div>
            ) : status === "loading" ? (
                <div className="flex items-center justify-center py-16">
                   <FaSpinner className="animate-spin text-cafe-secondary text-4xl" />
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-cafe-dark mb-2">Name</label>
                      <input
                        type="text"
                        {...register("name", { required: "Name is required" })}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-cafe-secondary focus:ring-cafe-secondary'} focus:ring-1 outline-none transition-colors appearance-none bg-white`}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-fade-in-up">
                          <FaExclamationCircle /> {errors.name.message as string}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-cafe-dark mb-2">Email</label>
                      <input
                        type="email"
                        {...register("email")}
                        readOnly
                        value={session?.user?.email || ""}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-none transition-colors appearance-none"
                        placeholder="john@example.com"
                      />
                      <p className="text-xs text-gray-400 mt-1">Locked to your secure account email.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative">
                      <label htmlFor="date" className="block text-sm font-medium text-cafe-dark mb-2">Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          {...register("date", { required: "Date is required" })}
                          className={`w-full px-4 py-3 pl-12 rounded-lg border ${errors.date ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-cafe-secondary focus:ring-cafe-secondary'} focus:ring-1 outline-none transition-colors appearance-none bg-white`}
                        />
                        <FaCalendarAlt className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.date ? "text-red-400" : "text-cafe-primary/50"}`} />
                      </div>
                      {errors.date && (
                         <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-fade-in-up">
                            <FaExclamationCircle /> {errors.date.message as string}
                         </p>
                       )}
                    </div>
                    <div className="relative">
                      <label htmlFor="time" className="block text-sm font-medium text-cafe-dark mb-2">Time</label>
                      <div className="relative">
                        <input
                          type="time"
                          {...register("time", { required: "Time is required" })}
                          className={`w-full px-4 py-3 pl-12 rounded-lg border ${errors.time ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-cafe-secondary focus:ring-cafe-secondary'} focus:ring-1 outline-none transition-colors appearance-none bg-white`}
                        />
                        <FaClock className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.time ? "text-red-400" : "text-cafe-primary/50"}`} />
                      </div>
                      {errors.time && (
                         <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-fade-in-up">
                            <FaExclamationCircle /> {errors.time.message as string}
                         </p>
                       )}
                    </div>
                    <div className="relative">
                      <label htmlFor="guests" className="block text-sm font-medium text-cafe-dark mb-2">Guests</label>
                      <div className="relative">
                        <select
                          {...register("guests", { required: "Number of guests is required" })}
                          className={`w-full px-4 py-3 pl-12 rounded-lg border ${errors.guests ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-cafe-secondary focus:ring-cafe-secondary'} focus:ring-1 outline-none transition-colors appearance-none bg-white`}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                          ))}
                        </select>
                        <FaUserFriends className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.guests ? "text-red-400" : "text-cafe-primary/50"}`} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="request" className="block text-sm font-medium text-cafe-dark mb-2">Special Requests (Optional)</label>
                    <textarea
                      {...register("request")}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-cafe-secondary focus:ring-1 focus:ring-cafe-secondary outline-none transition-colors resize-none bg-white"
                      placeholder="Any dietary restrictions or seating preferences?"
                    ></textarea>
                  </div>

                  <div className="pt-4 text-center">
                    <button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className="px-10 py-4 flex items-center justify-center gap-2 bg-cafe-primary text-white rounded-full font-bold uppercase tracking-widest hover:bg-cafe-secondary hover:shadow-xl transition-all duration-300 w-full sm:w-auto min-w-[250px] mx-auto disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin" /> Processing...
                        </>
                      ) : (
                        "Book Now"
                      )}
                    </button>
                  </div>
                </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
