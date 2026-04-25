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
    return true; //for testing purpose
    //return email?.toLowerCase().endsWith("lnmiit.ac.in");
  };

  const location = useLocation();
  const tempEmail = location?.state?.email || "";
  const tempBool = tempEmail ?checkEduEmail(tempEmail) : null;

  const [email, setEmail] = useState(tempEmail);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
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

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
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
      console.log("[Signup] Sending request...");

      await register(email.trim().toLowerCase(), password, fullName);

      console.log("[Signup] Registration success → navigating");

      // ALWAYS navigate if no error thrown
      navigate("/verify-otp", { state: { email } });

    } catch (err) {
      console.error("[Signup] Error:", err);

      const message =
        err.response?.data?.error ||   // ✅ backend uses "error"
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";

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
      {/* Background */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-500/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-xl">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Create your account</h2>
            <p className="text-zinc-400">
              Join the student-only video chat platform
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 px-4 pl-10"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                  <User size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  University Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className={`w-full bg-zinc-900 border rounded-lg py-3 px-4 pl-10 ${
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
                  />
                  <Mail size={18} className="absolute left-3 top-3.5 text-zinc-500" />

                  {isEduEmail === false && (
                    <AlertCircle size={18} className="absolute right-3 top-3.5 text-red-500" />
                  )}

                  {isEduEmail === true && (
                    <Check size={18} className="absolute right-3 top-3.5 text-emerald-500" />
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 px-4 pl-10 pr-10"
                    placeholder="Choose a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <Lock size={18} className="absolute left-3 top-3.5 text-zinc-500" />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-zinc-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Continue"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center text-zinc-400">
            Or sign up with
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleSignup}
            className="w-full py-3 border border-zinc-600 rounded-lg"
          >
            Continue with Google
          </button>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

