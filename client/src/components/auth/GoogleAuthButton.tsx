import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/api";

interface Props {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || "";

export function GoogleAuthButton({ onSuccess, onError }: Props) {
  const { googleLogin } = useAuth();

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="space-y-3">
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card/0 px-2 text-muted-foreground tracking-widest">or</span>
        </div>
      </div>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (cred) => {
            if (!cred.credential) return;
            try {
              await googleLogin(cred.credential);
              onSuccess();
            } catch (err) {
              onError(errorMessage(err, "Google sign-in failed"));
            }
          }}
          onError={() => onError("Google sign-in failed")}
          theme="filled_black"
          shape="pill"
          text="continue_with"
          width="320"
        />
      </div>
    </div>
  );
}
