import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, AlertCircle, MailCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(errorMessage(err, "Could not send reset email"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent
          ? `If an account exists for ${email}, we sent a reset link there.`
          : "We'll email you a secure link to set a new one."
      }
      footer={
        <>
          Remember it?{" "}
          <Link to="/login" className="text-brand font-semibold hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="text-center py-4 space-y-4">
          <div className="grid mx-auto h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
            <MailCheck className="size-7" />
          </div>
          <p className="text-sm text-muted-foreground">
            The link expires in 1 hour. Check your spam folder if you don't see it.
          </p>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/login">Done</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email
            </label>
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
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
