"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  FaSpinner, FaCoffee, FaCalendarCheck, FaSignOutAlt, FaUserCircle,
} from "react-icons/fa";

export default function DashboardSection() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/reservations")
        .then((res) => res.json())
        .then((data) => {
          if (data.reservations) setReservations(data.reservations);
          setLoadingData(false);
        })
        .catch(() => setLoadingData(false));
    }
  }, [status]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  if (status !== "authenticated") return null;

  const displayName = session?.user?.name || session?.user?.email;
  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <section id="dashboard" className="w-full bg-[#FCFBF8] py-16 px-4 sm:px-6 lg:px-8 border-b border-cafe-primary/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-12 items-center text-center">
          <p className="text-cafe-secondary font-bold tracking-widest uppercase text-sm mb-3">Your Account</p>
          <h2 className="text-4xl font-serif font-bold text-cafe-dark">Dashboard Overview</h2>
        </div>

        {/* Dashboard Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-cafe-primary/10 p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in-up">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-cafe-primary text-cafe-secondary rounded-full flex items-center justify-center text-xl font-bold shadow-md flex-shrink-0">
              {initials}
            </div>
            <div className="text-left">
              <h3 className="text-3xl font-serif font-bold text-cafe-dark">Welcome back</h3>
              <p className="text-gray-500 text-base mt-1">
                <span className="font-semibold text-cafe-secondary">{displayName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold text-sm hover:bg-red-100 hover:shadow transition-all duration-200 disabled:opacity-60"
          >
            {isLoggingOut ? <FaSpinner className="animate-spin" /> : <FaSignOutAlt />}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Reservations */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <FaCalendarCheck className="text-cafe-secondary text-2xl" />
              <h3 className="text-2xl font-serif font-bold text-cafe-dark">My Reservations</h3>
            </div>
            <div className="space-y-4">
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-cafe-secondary text-2xl" />
                </div>
              ) : reservations.length > 0 ? (
                reservations.map((res, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1">
                    <span className="text-cafe-primary font-bold">Upcoming Reservation</span>
                    <span className="text-sm text-gray-500">Date: {res.date} at {res.time}</span>
                    <span className="text-sm text-gray-500">Guests: {res.guests}</span>
                    {res.request && (
                      <span className="text-xs text-gray-400 italic mt-1">Note: {res.request}</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-center text-gray-400 mt-4 italic">No reservations found.</p>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <FaUserCircle className="text-cafe-secondary text-2xl" />
              <h3 className="text-2xl font-serif font-bold text-cafe-dark">Account Details</h3>
            </div>
            <div className="space-y-4">
              {session?.user?.name && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium text-cafe-dark">{session.user.name}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-cafe-dark text-sm">{session?.user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Membership</span>
                <span className="px-3 py-1 bg-cafe-secondary/10 text-cafe-secondary rounded-full text-xs font-bold uppercase tracking-wider">
                  Gold Member
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Auth Method</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  Email + Password
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
