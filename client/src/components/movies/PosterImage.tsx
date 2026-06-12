import { useEffect, useState } from "react";
import { cn, tmdbImage } from "@/lib/utils";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  path: string | null | undefined;
  size?: "w185" | "w300" | "w500" | "w780" | "original";
  preview?: "w92" | "w185";
  alt: string;
}

/**
 * Blur-up image: loads a tiny TMDB preview first, then crossfades the
 * full-size image on top once it's loaded. Eliminates the "pop-in" feel.
 */
export function PosterImage({
  path,
  size = "w500",
  preview = "w92",
  alt,
  className,
  ...rest
}: Props) {
  const previewSrc = tmdbImage(path, preview);
  const fullSrc = tmdbImage(path, size);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [fullSrc]);

  if (!fullSrc) {
    return (
      <div className={cn("grid place-items-center bg-secondary text-xs text-muted-foreground", className)}>
        No image
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {previewSrc && (
        <img
          src={previewSrc}
          alt=""
          aria-hidden
          className={cn(
            "absolute inset-0 size-full object-cover scale-110 blur-xl transition-opacity duration-700",
            loaded ? "opacity-0" : "opacity-100"
          )}
        />
      )}
      <img
        src={fullSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "relative size-full object-cover transition-opacity duration-700",
          loaded ? "opacity-100" : "opacity-0"
        )}
        {...rest}
      />
    </div>
  );
}
