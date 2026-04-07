import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  School,
  Check,
  AlertCircle,
} from "lucide-react";
import { register, getGoogleAuthUrl } from "../api/auth";

export default function Signup() {
  const checkEduEmail = (email) => {
    return email?.toLowerCase().endsWith("lnmiit.ac.in") || false;
  };

  const location = useLocation();
  const tempEmail = location?.state?.email || "";
  const tempBool = tempEmail ? checkEduEmail(tempEmail) : null;

  const [email, setEmail] = useState(tempEmail);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEduEmail, setIsEduEmail] = useState(tempBool);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      setIsEduEmail(checkEduEmail(newEmail));
    } else {
      setIsEduEmail(null);
    }
    // Clear any previous error when user types
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Additional client-side validation
    if (!fullName.trim()) {
      setError("Full name is required");
      setLoading(false);
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    if (!isEduEmail) {
      setError("Must use a valid LNMIIT email address (@lnmiit.ac.in)");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Password is required");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      // Call the backend registration endpoint
      await register(email, password, fullName);
      // Registration succeeded – now redirect to OTP verification page
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
      {/* Background gradient elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-500/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Create your account</h2>
            <p className="text-zinc-400">Join the student-only video chat platform</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="fullName"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <User size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                </div>
              </div>

              {/* Email with domain validation */}
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="signup-email">
                  University Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="signup-email"
                    className={`w-full bg-zinc-900 border rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      isEduEmail === false
                        ? "border-red-500"
                        : isEduEmail === true
                        ? "border-emerald-500"
                        : "border-zinc-700"
                    }`}
                    placeholder="yourname@lnmiit.ac.in"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={loading}
                    required
                  />
                  <Mail size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                  {isEduEmail === false && (
                    <div className="absolute right-3 top-3.5 text-red-500">
                      <AlertCircle size={18} />
                    </div>
                  )}
                  {isEduEmail === true && (
                    <div className="absolute right-3 top-3.5 text-emerald-500">
                      <Check size={18} />
                    </div>
                  )}
                </div>
                {isEduEmail === false && (
                  <p className="text-red-500 text-sm mt-1">
                    Must be a valid LNMIIT university email (@lnmiit.ac.in)
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="signup-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="signup-password"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 px-4 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Choose a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={8}
                  />
                  <Lock size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-zinc-500 text-xs mt-1">Must be at least 8 characters</p>
              </div>

              {/* University (optional) */}
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="university">
                  Your University (optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="university"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., LNMIIT, Jaipur"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    disabled={loading}
                  />
                  <School size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !email || !password || !fullName || isEduEmail !== true}
              >
                {loading ? "Creating account..." : "Continue"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-800/50 text-zinc-400">Or sign up with</span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleSignup}
            className="w-full py-3 border border-zinc-600 hover:bg-zinc-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <div className="mt-8 pt-6 border-t border-zinc-700 text-center">
            <p className="text-zinc-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-zinc-500 text-xs mt-8">
          By signing up, you agree to our{" "}
          <a href="#" className="underline hover:text-zinc-400">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-zinc-400">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}