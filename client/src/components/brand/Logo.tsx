import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * "Filmstrip Play" mark — sprocket frames around a red play triangle.
 * Use for navbar, login, anywhere the brand mark appears.
 */
export function LogoMark({ className, size = 36 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="14" fill="#1C1C1E" />
      <rect x="10" y="8" width="6.5" height="7" rx="2" fill="#FFFFFF" opacity="0.28" />
      <rect x="10" y="49" width="6.5" height="7" rx="2" fill="#FFFFFF" opacity="0.28" />
      <rect x="22" y="8" width="6.5" height="7" rx="2" fill="#FFFFFF" opacity="0.28" />
      <rect x="22" y="49" width="6.5" height="7" rx="2" fill="#FFFFFF" opacity="0.28" />
      <rect x="34" y="8" width="6.5" height="7" rx="2" fill="#FFFFFF" opacity="0.28" />
      <rect x="34" y="49" width="6.5" height="7" rx="2" fill="#FFFFFF" opacity="0.28" />
      <rect x="46" y="8" width="6.5" height="7" rx="2" fill="#FFFFFF" opacity="0.28" />
      <rect x="46" y="49" width="6.5" height="7" rx="2" fill="#FFFFFF" opacity="0.28" />
      <polygon points="25,21 25,43 47,32" fill="#E50914" />
    </svg>
  );
}

/**
 * The full wordmark + mark lockup. Use sparingly — navbar and login splash.
 */
interface LockupProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LogoLockup({ className, size = "md" }: LockupProps) {
  const sizes = {
    sm: { mark: 28, text: "text-[15px]" },
    md: { mark: 36, text: "text-lg" },
    lg: { mark: 48, text: "text-2xl" },
  };
  const s = sizes[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5 group", className)}>
      <LogoMark size={s.mark} className="group-hover:scale-105 transition-transform" />
      <span
        className={cn(
          "font-brand font-bold tracking-tight lowercase select-none",
          s.text
        )}
        style={{ letterSpacing: "-0.02em" }}
      >
        cinemahub<span className="text-brand">.</span>
      </span>
    </span>
  );
}
