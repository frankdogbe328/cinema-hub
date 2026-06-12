import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User as UserIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

type Step = "form" | "otp";

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too short", "Weak", "Okay", "Good", "Strong", "Excellent"];
  const colors = ["bg-destructive", "bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-500"];
  return { score, label: labels[score], color: colors[score] };
}

export default function Register() {
  const { register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      await register({ email, username, password });
      setStep("otp");
    } catch (err) {
      setError(errorMessage(err, "Registration failed"));
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await verifyOtp(email, otp);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not verify code"));
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(email);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      setError(errorMessage(err, "Could not resend code"));
    }
  };

  return (
    <AuthShell
      title={step === "form" ? "Create your account" : "Verify your email"}
      subtitle={
        step === "form"
          ? "Join CinemaHub and start watching."
          : `We sent a 6-digit code to ${email}`
      }
      footer={
        step === "form" ? (
          <>
            Already have an account?{" "}
            <Link to="/login" className="text-brand font-semibold hover:underline">
              Sign in
            </Link>
          </>
        ) : null
      }
    >
      {step === "form" ? (
        <>
          <form onSubmit={submitForm} className="space-y-4">
            <Field label="Username">
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  autoComplete="username"
                  placeholder="moviebuff"
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Password">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength.score ? strength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{strength.label}</p>
                </div>
              )}
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              Send verification code
            </Button>
          </form>

          <GoogleAuthButton
            onSuccess={() => navigate("/", { replace: true })}
            onError={(msg) => setError(msg)}
          />
        </>
      ) : (
        <form onSubmit={submitOtp} className="space-y-4">
          <Field label="Verification code">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="123456"
              className="text-center tracking-[0.6em] text-2xl font-bold h-14"
              required
              autoFocus
            />
          </Field>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resent && (
            <div className="flex items-start gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <span>New code sent</span>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={busy || otp.length < 6}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Verify & continue
          </Button>

          <div className="flex items-center justify-between text-sm pt-1">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Change email
            </button>
            <button
              type="button"
              onClick={handleResend}
              className="text-brand font-semibold hover:underline"
            >
              Resend code
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
