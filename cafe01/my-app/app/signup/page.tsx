"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  FaArrowRight, FaSpinner, FaEye, FaEyeSlash, FaCoffee,
} from "react-icons/fa";

type SignupForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  const [pendingSignup, setPendingSignup] = useState<SignupForm | null>(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupForm>({ mode: "onChange" });

  const password = watch("password");

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const onSubmit = async (data: SignupForm) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.toLowerCase() }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Something went wrong.");
      }

      setPendingSignup({ ...data, email: data.email.toLowerCase() });
      setStep("OTP");
      setCooldown(30);
      setSuccessMessage("Verification code sent. Enter the 6-digit code to create your account.");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Failed to send verification code.");
    }
  };

  const handleVerifyAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingSignup) {
      setServerError("Signup data expired. Please fill the form again.");
      setStep("FORM");
      return;
    }
    if (otp.length !== 6) {
      setServerError("Please enter a valid 6-digit verification code.");
      return;
    }

    setOtpLoading(true);
    setServerError("");
    setSuccessMessage("");

    try {
      const verifyRes = await fetch("/api/signup/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingSignup.email, otp }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.message || "Verification failed.");
      }

      const signupRes = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pendingSignup.name,
          email: pendingSignup.email,
          password: pendingSignup.password,
          signupToken: verifyData.signupToken,
        }),
      });

      const signupData = await signupRes.json();
      if (!signupRes.ok) {
        throw new Error(signupData.message || "Failed to create account.");
      }

      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/login?success=Account created! Please sign in.");
      }, 1500);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Could not verify the code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingSignup || cooldown > 0 || otpLoading) return;
    setOtpLoading(true);
    setServerError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingSignup.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to resend code.");
      }
      setCooldown(30);
      setSuccessMessage("A new verification code has been sent.");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Could not resend verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative bg-gradient-to-br from-[#FCFBF8] via-white to-[#F0EAE1] overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-cafe-secondary/10 rounded-full blur-[100px] opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cafe-primary/5 rounded-full blur-[120px] opacity-60 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-[1100px] min-h-[680px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(62,39,35,0.1)] flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
        
        {/* Left Side: Form Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-20 relative">
          
          <Link href="/" className="absolute top-8 left-8 sm:top-10 sm:left-12 flex items-center gap-3 text-cafe-dark hover:text-cafe-secondary transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm group-hover:bg-amber-50 group-hover:border-amber-100 group-hover:-translate-x-1 group-hover:shadow transition-all duration-300">
              <FaArrowRight className="rotate-180 text-sm" />
            </div>
            <span className="font-medium text-sm tracking-wide">Back to Site</span>
          </Link>

          <div className="w-full max-w-[380px] mx-auto mt-12 md:mt-2">
            
            {/* Header */}
            <div className="mb-8 text-left">
              <h1 className="text-[36px] leading-[1.1] font-serif font-bold text-cafe-dark mb-2 tracking-tight">
                Create Account<span className="text-cafe-secondary">.</span>
              </h1>
              <p className="text-gray-500 font-medium text-[14px]">
                Join Brew&apos;s Cafe today and experience the difference.
              </p>
            </div>

            {/* Error/Success Messages */}
            {(successMessage || serverError) && (
              <div className="mb-6 space-y-3">
                {successMessage && (
                  <div className="text-emerald-700 bg-emerald-50/50 border border-emerald-200 px-4 py-3 rounded-xl text-[13px] font-medium animate-fade-in-up">
                    {successMessage}
                  </div>
                )}
                {serverError && (
                  <div className="text-rose-600 bg-rose-50/50 border border-rose-200 px-4 py-3 rounded-xl text-[13px] font-medium animate-fade-in-up flex justify-center">
                    {serverError}
                  </div>
                )}
              </div>
            )}

            {step === "FORM" ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="group/input">
                  <label className="block text-[12px] font-bold text-cafe-dark mb-1.5 uppercase tracking-wider transition-colors group-focus-within/input:text-cafe-secondary">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="John Doe"
                      {...register("name", {
                        required: "Name is required",
                        minLength: { value: 2, message: "Min. 2 characters required" },
                      })}
                      className={`w-full px-4 py-3 text-[14px] bg-gray-50/50 border-2 rounded-xl outline-none transition-all duration-300 placeholder:text-gray-400
                      ${errors.name ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10" : "border-gray-100 focus:border-cafe-secondary focus:bg-white focus:ring-4 focus:ring-cafe-secondary/10 hover:border-gray-200"}
                    `}
                    />
                  </div>
                  {errors.name && <p className="text-rose-500 text-[11px] font-medium mt-1.5 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-rose-500 inline-block" />{errors.name.message}</p>}
                </div>

                <div className="group/input">
                  <label className="block text-[12px] font-bold text-cafe-dark mb-1.5 uppercase tracking-wider transition-colors group-focus-within/input:text-cafe-secondary">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Please enter a valid email",
                        },
                      })}
                      className={`w-full px-4 py-3 text-[14px] bg-gray-50/50 border-2 rounded-xl outline-none transition-all duration-300 placeholder:text-gray-400
                      ${errors.email ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10" : "border-gray-100 focus:border-cafe-secondary focus:bg-white focus:ring-4 focus:ring-cafe-secondary/10 hover:border-gray-200"}
                    `}
                    />
                  </div>
                  {errors.email && <p className="text-rose-500 text-[11px] font-medium mt-1.5 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-rose-500 inline-block" />{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group/input">
                    <label className="block text-[12px] font-bold text-cafe-dark mb-1.5 uppercase tracking-wider transition-colors group-focus-within/input:text-cafe-secondary">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 6, message: "Min. 6 chars" },
                        })}
                        className={`w-full pl-4 pr-10 py-3 text-[14px] bg-gray-50/50 border-2 rounded-xl outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:tracking-[4px] tracking-widest
                        ${errors.password ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10" : "border-gray-100 focus:border-cafe-secondary focus:bg-white focus:ring-4 focus:ring-cafe-secondary/10 hover:border-gray-200"}
                      `}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-cafe-dark transition-all"
                        tabIndex={-1}
                      >
                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-rose-500 text-[10px] font-medium mt-1.5 whitespace-nowrap"><span className="w-1 h-1 rounded-full bg-rose-500 inline-block mr-1" />{errors.password.message}</p>}
                  </div>

                  <div className="group/input">
                    <label className="block text-[12px] font-bold text-cafe-dark mb-1.5 uppercase tracking-wider transition-colors group-focus-within/input:text-cafe-secondary">
                      Confirm Pas.
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword", {
                          required: "Please confirm",
                          validate: (value) => value === password || "Passwords do not match",
                        })}
                        className={`w-full pl-4 pr-10 py-3 text-[14px] bg-gray-50/50 border-2 rounded-xl outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:tracking-[4px] tracking-widest
                        ${errors.confirmPassword ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10" : "border-gray-100 focus:border-cafe-secondary focus:bg-white focus:ring-4 focus:ring-cafe-secondary/10 hover:border-gray-200"}
                      `}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-cafe-dark transition-all"
                        tabIndex={-1}
                      >
                        {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-rose-500 text-[10px] font-medium mt-1.5 whitespace-nowrap"><span className="w-1 h-1 rounded-full bg-rose-500 inline-block mr-1" />{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-tr from-cafe-primary to-amber-900 border border-cafe-primary/50 text-white font-bold tracking-widest uppercase text-[14px] py-4 mt-8 shadow-[0_10px_30px_-10px_rgba(62,39,35,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(62,39,35,0.7)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-30deg] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-10" />
                  <span className="relative z-20 flex items-center justify-center gap-3">
                    {isSubmitting ? (
                      <><FaSpinner className="animate-spin text-lg" /> Sending Code...</>
                    ) : (
                      <>Send Verification Code <FaArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" /></>
                    )}
                  </span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndCreate} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-cafe-dark mb-1.5 uppercase tracking-wider">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="w-full px-4 py-3 text-[18px] tracking-[0.5em] text-center bg-gray-50/50 border-2 border-gray-100 rounded-xl outline-none focus:border-cafe-secondary focus:bg-white focus:ring-4 focus:ring-cafe-secondary/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-tr from-cafe-primary to-amber-900 border border-cafe-primary/50 text-white font-bold tracking-widest uppercase text-[14px] py-4 mt-8 shadow-[0_10px_30px_-10px_rgba(62,39,35,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(62,39,35,0.7)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <span className="relative z-20 flex items-center justify-center gap-3">
                    {otpLoading ? (
                      <><FaSpinner className="animate-spin text-lg" /> Verifying...</>
                    ) : (
                      <>Verify & Create Account <FaArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" /></>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpLoading || cooldown > 0}
                  className="w-full text-sm text-cafe-secondary disabled:text-gray-400"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend verification code"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("FORM");
                    setOtp("");
                    setServerError("");
                    setSuccessMessage("");
                  }}
                  disabled={otpLoading}
                  className="w-full text-xs text-gray-500 hover:text-cafe-dark underline underline-offset-4"
                >
                  Back to signup form
                </button>
              </form>
            )}

            <div className="pt-4 text-center">
              <p className="text-[14px] text-gray-500 font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-cafe-secondary font-bold hover:text-cafe-primary hover:underline underline-offset-4 decoration-2 transition-all">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Image Panel */}
        <div className="hidden md:block w-1/2 relative overflow-hidden bg-[#2D1B11] group">
          <img
            src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1200&auto=format&fit=crop"
            alt="Coffee Art"
            className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-[15000ms] ease-linear"
          />
          {/* Subtle vignette/gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/70 pointer-events-none" />
          
          <div className="absolute inset-0 p-12 flex flex-col justify-between pointer-events-none">
            
            {/* Logo Mark */}
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 self-end">
               <FaCoffee className="text-white text-2xl" />
            </div>

            {/* Inspirational Text */}
            <div className="mt-auto max-w-[90%] translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out pb-8">
              <div className="flex gap-2 mb-4 items-center">
                <div className="w-12 h-px bg-cafe-secondary"></div>
                <span className="text-cafe-secondary font-bold tracking-widest text-xs uppercase">Premium Quality</span>
              </div>
              <p className="text-white font-serif text-[28px] leading-[1.3] font-medium drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                &ldquo;Every great idea starts with an exceptionally good cup of coffee.&rdquo;
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
