import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, errorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(user?.profile?.firstName ?? "");
    setLastName(user?.profile?.lastName ?? "");
    setBio(user?.profile?.bio ?? "");
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      await api.put("/users/profile", { firstName, lastName, bio });
      await refreshUser();
      setMsg("Saved.");
    } catch (e) {
      setErr(errorMessage(e, "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-10 max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account info.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="size-20 rounded-full bg-secondary overflow-hidden border border-border">
          {user?.picture || user?.profile?.avatar ? (
            <img src={user.picture || user.profile?.avatar} alt="" className="size-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-2xl font-bold">
              {(user?.username || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold">{user?.username}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First name">
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Field>
          <Field label="Last name">
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Field>
        </div>
        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </Field>
        {msg && <p className="text-sm text-green-500">{msg}</p>}
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label.toUpperCase()}</span>
      {children}
    </label>
  );
}
