import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";
import { verifyOtp, resendOtp } from "../api/auth";
import { login } from "../store/authSlice";
import { updateSocketToken } from "../socket.js"; // ← added

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOTP() {
  const location = useLocation();
  const email = location?.state?.email || "";

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    setError("");

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (cleaned && index === OTP_LENGTH - 1) {
      const allFilled = newDigits.every((d) => d !== "");
      if (allFilled) {
        submitOtp(newDigits.join(""));
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    const nextEmpty = pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
    inputRefs.current[nextEmpty]?.focus();

    if (pasted.length === OTP_LENGTH) {
      submitOtp(pasted);
    }
  };

  const submitOtp = async (code) => {
    setError("");
    setLoading(true);
    try {
      const response = await verifyOtp(email, code);
      const { accessToken, refreshToken, user } = response.data;

      dispatch(login({ userData: user, accessToken, refreshToken }));

      // Authenticate the socket immediately so it's ready when the user
      // navigates to RandomChat — same pattern as Login.jsx.
      updateSocketToken(accessToken); // ← added

      navigate("/dashboard");
    } catch (err) {
      const code = err.response?.data?.code;
      const message = err.response?.data?.message;

      if (code === "OTP_EXPIRED") {
        setError("This code has expired. Please request a new one.");
      } else if (code === "OTP_INVALID") {
        setError("Incorrect code. Please check and try again.");
      } else {
        setError(message || "Verification failed. Please try again.");
      }

      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    submitOtp(code);
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;
    setError("");
    setResendSuccess(false);
    setResendLoading(true);
    try {
      await resendOtp(email);
      setResendSuccess(true);
      setCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } catch (err) {
      const message = err.response?.data?.message;
      setError(message || "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const isComplete = digits.every((d) => d !== "");
  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(b.length) + c)
    : "";

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-0 left-1/2 w-1/3 h-1/3 bg-emerald-500/20 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10">
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-xl">

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck size={32} className="text-emerald-400" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Check your email</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We sent a 6-digit verification code to
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Mail size={15} className="text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-400 font-medium text-sm truncate">{maskedEmail}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading}
                  className={`
                    w-12 h-14 text-center text-xl font-bold rounded-xl border
                    bg-zinc-900 transition-all duration-150 outline-none
                    focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${error
                      ? "border-red-500 text-red-400"
                      : digit
                      ? "border-emerald-500/60 text-white"
                      : "border-zinc-700 text-white"
                    }
                  `}
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-center">
                {error}
              </div>
            )}

            {resendSuccess && !error && (
              <div className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4 text-center">
                A new code has been sent to your email.
              </div>
            )}

            <button
              type="submit"
              disabled={!isComplete || loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-zinc-400 text-sm">
              Didn't receive it?{" "}
              {cooldown > 0 ? (
                <span className="text-zinc-500">
                  Resend in <span className="tabular-nums text-zinc-400">{cooldown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={13} className={resendLoading ? "animate-spin" : ""} />
                  {resendLoading ? "Sending..." : "Resend code"}
                </button>
              )}
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-700 text-center">
            <Link
              to="/signup"
              className="text-zinc-400 hover:text-zinc-200 text-sm inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to sign up
            </Link>
          </div>
        </div>

        <p className="text-center text-zinc-500 text-xs mt-8">
          Having trouble?{" "}
          <a href="#" className="underline hover:text-zinc-400">
            Contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}