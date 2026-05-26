"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();
  
  // Stored state for Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Stored state for Step 2
  const [otp, setOtp] = useState("");
  
  const [step, setStep] = useState<"LOGIN" | "OTP">("LOGIN");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Countdown timer for resending OTPs
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return setError("Please enter your email and password.");

    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // By actively resubmitting the payload here, the "Resend" flow behaves flawlessly 
        // without needing arbitrary tokens or separate security logic constraints
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(data.message);
        }
        throw new Error(data.message || "Failed to log in.");
      }

      // Start the strict 30-sec cooldown upon success 
      setCooldown(30);
      setSuccessMsg("We sent a 6-digit security code to your email inbox!");
      setStep("OTP");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return setError("Please enter the complete 6-digit OTP.");

    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        otp,
      });

      if (result?.error) {
        if (result.error.includes("Maximum invalid attempts")) {
          setStep("LOGIN");
          setOtp("");
          setPassword(""); // Nullify password
        }
        throw new Error(result.error);
      }

      // Total success! Clean routing execution 
      setSuccessMsg("Authentication completed! Redirecting...");
      
      setTimeout(() => {
        router.push("/");
      }, 700);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-3xl shadow-2xl border border-gray-100 transition-all duration-500 min-h-[480px] flex flex-col justify-center">
      <h2 className="text-3xl font-serif font-bold text-cafe-dark mb-2 text-center">
        {step === "LOGIN" ? "Welcome Back" : "Two-Step Authentication"}
      </h2>
      <p className="text-gray-500 text-center mb-8 text-sm">
        {step === "LOGIN"
          ? "Enter your existing details to login securely"
          : "Please check your inbox for an authorization code"}
      </p>

      {/* Dynamic Feedback Indicators */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-3 animate-in fade-in duration-300">
          <span className="text-xl">⚠️</span> {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100 flex items-center gap-3 animate-in fade-in duration-300">
          <span className="text-xl">✅</span> {successMsg}
        </div>
      )}

      {step === "LOGIN" ? (
        <form onSubmit={handleLoginSubmit} className="space-y-6 animate-in fade-in duration-500">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-cafe-dark mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cafe-primary/50 focus:border-cafe-primary transition-all duration-300 disabled:opacity-50"
              placeholder="hello@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-cafe-dark mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cafe-primary/50 focus:border-cafe-primary transition-all duration-300 disabled:opacity-50 tracking-widest text-lg"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-4 rounded-2xl bg-cafe-primary text-white font-medium hover:bg-cafe-secondary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex justify-center items-center h-14 mt-6"
          >
            {isLoading ? (
              <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
           <div>
            <label htmlFor="otp" className="block text-sm font-medium text-cafe-dark mb-2 text-center">
              6-Digit Secure Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
              disabled={isLoading || !!successMsg}
              maxLength={6}
              autoComplete="one-time-code"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cafe-primary/50 focus:border-cafe-primary transition-all duration-300 text-center text-4xl tracking-[0.6em] font-mono disabled:opacity-50 shadow-inner"
              placeholder="------"
              required
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || otp.length < 6 || !!successMsg}
            className="w-full py-4 rounded-2xl bg-cafe-primary text-white font-medium hover:bg-cafe-secondary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex justify-center items-center h-14"
          >
            {isLoading ? (
              <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Verify Code & Proceed"
            )}
          </button>

          <div className="pt-4 flex flex-col gap-4 text-center">
             <button
                type="button"
                onClick={() => handleLoginSubmit()}
                disabled={cooldown > 0 || isLoading}
                className="text-sm font-medium disabled:text-gray-400 text-cafe-primary hover:text-cafe-secondary transition-colors flex items-center justify-center gap-2"
              >
                {cooldown > 0 ? (
                  <>Wait {cooldown}s before resending</>
                ) : (
                  <><span>↻</span> Resend Security Code</>
                )}
              </button>
              
             <button
                type="button"
                onClick={() => {
                  setStep("LOGIN");
                  setOtp("");
                  setError("");
                  setSuccessMsg("");
                  setPassword(""); // Clear password dynamically on manual retreat
                }}
                disabled={isLoading}
                className="text-xs text-gray-500 hover:text-cafe-dark transition-colors underline-offset-4 hover:underline"
              >
                Cancel and return to login
              </button>
          </div>
        </form>
      )}
    </div>
  );
}
