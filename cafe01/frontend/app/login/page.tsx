"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaArrowRight, FaSpinner, FaEye, FaEyeSlash, FaCoffee, FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useForm } from "react-hook-form";

type LoginForm = {
  email: string;
  password: string;
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlSuccess = searchParams.get("success") || "";
  const urlError = searchParams.get("error") || "";

  // Authentication Steps: "LOGIN" (Email/Pass) -> "OTP" (Verification)
  const [step, setStep] = useState<"LOGIN" | "OTP">("LOGIN");
  const [serverError, setServerError] = useState(urlError);
  const [successMsg, setSuccessMsg] = useState(urlSuccess);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP specific state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<LoginForm>({ mode: "onChange" });

  // Handle Resend Cooldown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Initial Login (Email & Password)
  const onLoginSubmit = async (data: LoginForm) => {
    setServerError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.message || "Invalid credentials. Please try again.");
        setIsLoading(false);
        return;
      }

      setStep("OTP");
      setCooldown(30);
      setSuccessMsg("We've sent a 6-digit verification code to your email.");
      setIsLoading(false);
    } catch (error) {
      setServerError("Connection failed. Please check your internet.");
      setIsLoading(false);
    }
  };

  // Step 2: OTP Verification
  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) return;

    setServerError("");
    setIsLoading(true);

    try {
      const email = getValues("email");
      const password = getValues("password");
      
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        otp: otpString,
      });

      if (res?.error) {
        setServerError(res.error || "Invalid or expired code.");
        
        // If session locked/expired, reset to login
        if (res.error.includes("Maximum invalid attempts") || res.error.includes("expired")) {
          setTimeout(() => {
             setStep("LOGIN");
             setOtp(["", "", "", "", "", ""]);
          }, 2000);
        }
        setIsLoading(false);
        return;
      }

      setSuccessMsg("Verification successful! Access granted.");
      
      // Artificial delay for smooth UX
      setTimeout(() => {
        router.push(callbackUrl);
      }, 1200);

    } catch (error) {
      setServerError("Verification failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take last character if multiple pasted
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    
    // Re-trigger the login submission logic (which sends the OTP)
    const email = getValues("email");
    const password = getValues("password");
    await onLoginSubmit({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative bg-gradient-to-br from-[#FCFBF8] via-white to-[#F0EAE1] overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-cafe-secondary/10 rounded-full blur-[100px] opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cafe-primary/5 rounded-full blur-[120px] opacity-60 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-[1100px] min-h-[680px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(62,39,35,0.1)] flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
        
        {/* Left Side: Form Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-20 relative transition-all duration-700">
          
          <Link href="/" className="absolute top-8 left-8 sm:top-10 sm:left-12 flex items-center gap-3 text-cafe-dark hover:text-cafe-secondary transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm group-hover:bg-amber-50 group-hover:border-amber-100 group-hover:-translate-x-1 group-hover:shadow transition-all duration-300">
              <FaArrowRight className="rotate-180 text-sm" />
            </div>
            <span className="font-medium text-sm tracking-wide">Back to Site</span>
          </Link>

          <div className="w-full max-w-[380px] mx-auto mt-12 md:mt-4 overflow-hidden">
            
            {/* Smooth Transition Container */}
            <div className={`transition-all duration-500 transform ${step === 'OTP' ? 'translate-x-0' : 'translate-x-0'}`}>
              
              {/* Header */}
              <div className="mb-10 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cafe-primary/10 flex items-center justify-center text-cafe-primary">
                    {step === "LOGIN" ? <FaLock className="text-xl" /> : <FaShieldAlt className="text-xl" />}
                  </div>
                  {step === "OTP" && (
                     <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                        Security Step
                     </span>
                  )}
                </div>
                <h1 className="text-[36px] leading-tight font-serif font-bold text-cafe-dark mb-2 tracking-tight">
                  {step === "LOGIN" ? "Welcome Back" : "Verify It's You"}<span className="text-cafe-secondary">.</span>
                </h1>
                <p className="text-gray-500 font-medium text-[15px]">
                  {step === "LOGIN" 
                    ? "Sign in to your account to view your reservations." 
                    : `We've sent a security code to ${getValues("email").replace(/(.{3})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + "*".repeat(gp3.length))}`
                  }
                </p>
              </div>

              {/* Error/Success Messages */}
              {(serverError || successMsg) && (
                <div className="mb-8 space-y-3 animate-fade-in-up">
                  {successMsg && (
                    <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50/50 border border-emerald-100 px-4 py-3.5 rounded-2xl text-[13px] font-medium">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {successMsg}
                    </div>
                  )}
                  {serverError && (
                    <div className="flex items-center gap-3 text-rose-600 bg-rose-50/50 border border-rose-100 px-4 py-3.5 rounded-2xl text-[13px] font-medium">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      {serverError}
                    </div>
                  )}
                </div>
              )}

              {step === "LOGIN" ? (
                /* STEP 1: LOGIN FORM */
                <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-5 animate-in fade-in duration-500">
                  <div className="group/input">
                    <label className="block text-[13px] font-bold text-cafe-dark mb-2 uppercase tracking-wider transition-colors group-focus-within/input:text-cafe-secondary">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="hello@example.com"
                        {...register("email", {
                          required: "Email is required",
                          pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
                        })}
                        className={`w-full px-5 py-3.5 text-[15px] bg-gray-50/50 border-2 rounded-xl outline-none transition-all duration-300
                          ${errors.email ? "border-rose-300" : "border-gray-100 focus:border-cafe-secondary focus:bg-white hover:border-gray-200"}
                        `}
                      />
                    </div>
                    {errors.email && <p className="text-rose-500 text-[12px] font-medium mt-1.5">{errors.email.message}</p>}
                  </div>

                  <div className="group/input pt-1">
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-[13px] font-bold text-cafe-dark uppercase tracking-wider transition-colors group-focus-within/input:text-cafe-secondary">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 6, message: "Min. 6 chars" },
                        })}
                        className={`w-full pl-5 pr-12 py-3.5 text-[15px] bg-gray-50/50 border-2 rounded-xl outline-none transition-all duration-300
                          ${errors.password ? "border-rose-300" : "border-gray-100 focus:border-cafe-secondary focus:bg-white hover:border-gray-200"}
                        `}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-cafe-dark"
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-rose-500 text-[12px] font-medium mt-1.5">{errors.password.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-tr from-cafe-primary to-amber-900 text-white font-bold tracking-widest uppercase text-[14px] py-4 mt-4 shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70"
                  >
                    <span className="relative z-20 flex items-center justify-center gap-3">
                      {isLoading ? (
                        <><FaSpinner className="animate-spin text-lg" /> Verifying...</>
                      ) : (
                        <>Sign In <FaArrowRight /></>
                      )}
                    </span>
                  </button>

                  {/* Social Buttons Hidden during loading for focus */}
                  {!isLoading && (
                    <>
                      <div className="flex items-center pt-4 pb-2">
                        <div className="flex-1 border-t-2 border-dashed border-gray-100"></div>
                        <span className="px-5 text-[11px] text-gray-400 font-bold uppercase tracking-widest">Or</span>
                        <div className="flex-1 border-t-2 border-dashed border-gray-100"></div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button 
                          type="button" 
                          onClick={() => signIn("google", { callbackUrl: "/" })}
                          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 rounded-xl py-3 hover:bg-gray-50 transition-all"
                        >
                          <FcGoogle className="text-xl" />
                          <span className="text-[13px] font-bold text-gray-600">Google</span>
                        </button>
                      </div>
                    </>
                  )}
                </form>
              ) : (
                /* STEP 2: OTP FORM */
                <form onSubmit={onVerifyOtp} className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                  <div className="flex justify-between items-center gap-2 px-1">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-12 h-16 text-center text-3xl font-serif font-bold text-cafe-dark bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cafe-primary focus:bg-white transition-all shadow-sm"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={otp.join("").length < 6 || isLoading}
                      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-tr from-cafe-primary to-amber-900 text-white font-bold tracking-widest uppercase text-[14px] py-4 shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                    >
                      <span className="relative z-20 flex items-center justify-center gap-3">
                        {isLoading ? (
                          <><FaSpinner className="animate-spin text-lg" /> Validating...</>
                        ) : (
                          <>Verify & Continue <FaArrowRight /></>
                        )}
                      </span>
                    </button>

                    <div className="flex flex-col items-center gap-4 pt-2">
                       <button
                          type="button"
                          onClick={handleResend}
                          disabled={cooldown > 0 || isLoading}
                          className="text-[13px] font-bold text-cafe-secondary hover:text-cafe-primary transition-colors disabled:text-gray-400 flex items-center gap-2 decoration-2 underline-offset-4 hover:underline"
                        >
                          {cooldown > 0 ? (
                            `Resend code in ${cooldown}s`
                          ) : (
                             <>Don&apos;t see it? Resend Code</>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStep("LOGIN");
                            setServerError("");
                            setSuccessMsg("");
                            setOtp(["", "", "", "", "", ""]);
                          }}
                          className="text-[12px] font-medium text-gray-500 hover:text-cafe-dark transition-all"
                        >
                          Try another account
                        </button>
                    </div>
                  </div>
                </form>
              )}
              
              {/* Common Footer */}
              {step === "LOGIN" && (
                <div className="pt-8 text-center">
                  <p className="text-[14px] text-gray-500 font-medium">
                    New to Brew&apos;s Cafe?{" "}
                    <Link href="/signup" className="text-cafe-secondary font-bold hover:text-cafe-primary transition-all">
                      Create an account
                    </Link>
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Side: Image Panel */}
        <div className="hidden md:block w-1/2 relative overflow-hidden bg-cafe-dark group">
          <img
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop"
            alt="Coffee Art"
            className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-[15000ms] ease-linear"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/80 pointer-events-none" />
          
          <div className="absolute inset-0 p-12 flex flex-col justify-between pointer-events-none text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
               <FaCoffee className="text-2xl" />
            </div>

            <div className="mt-auto max-w-[90%] pb-8">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-amber-400 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <h3 className="text-2xl font-serif font-bold mb-2">Secure Experience</h3>
              <p className="opacity-80 font-medium leading-relaxed">
                We've added an extra layer of security to keep your coffee moments private and safe.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <div className="w-12 h-12 rounded-full border-4 border-cafe-primary border-t-transparent animate-spin"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
