import { useMediaQuery } from "usehooks-ts";
import { css } from "../../styled-system/css";

const shimmerAnimatedClass = css({
  background: "linear-gradient(90deg, token(colors.bg.subtle) 25%, token(colors.border.default) 50%, token(colors.bg.subtle) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease-in-out infinite",
  borderRadius: "md",
});

const shimmerStaticClass = css({
  background: "bg.subtle",
  backgroundSize: "200% 100%",
  animation: "none",
  borderRadius: "md",
});

interface SkeletonProps {
  count?: number;
}

export function Skeleton({ count = 5 }: SkeletonProps) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const shimmerClass = prefersReducedMotion ? shimmerStaticClass : shimmerAnimatedClass;

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "3",
      })}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "3",
            p: "4",
            bg: "bg.subtle",
            borderRadius: "lg",
            border: "1px solid",
            borderColor: "border.default",
          })}
        >
          <div className={shimmerClass} style={{ width: 48, height: 48, borderRadius: "50%" }} />
          <div className={css({ flex: 1, display: "flex", flexDirection: "column", gap: "2" })}>
            <div className={shimmerClass} style={{ width: "40%", height: 16 }} />
            <div className={shimmerClass} style={{ width: "60%", height: 12 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RepoSkeleton({ count = 3 }: SkeletonProps) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const shimmerClass = prefersReducedMotion ? shimmerStaticClass : shimmerAnimatedClass;

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "2",
        pl: "4",
      })}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={css({
            p: "3",
            bg: "bg.canvas",
            borderRadius: "md",
            border: "1px solid",
            borderColor: "border.default",
          })}
        >
          <div className={shimmerClass} style={{ width: "30%", height: 14, marginBottom: 8 }} />
          <div className={shimmerClass} style={{ width: "80%", height: 12 }} />
        </div>
      ))}
    </div>
  );
}
