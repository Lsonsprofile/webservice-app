import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function Login() {
  return (
    <div className="hero-glow bg-grid-pattern flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <Card className="border-white/10 bg-slate-950/70 text-white backdrop-blur-md">
          <CardHeader className="space-y-3 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/40">
              <GraduationCap className="h-7 w-7" aria-hidden />
            </span>
            <CardTitle className="font-display text-2xl">
              Web Services Academy
            </CardTitle>
            <p className="text-sm text-slate-400">
              Sign in with Google to access your learner profile.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="min-h-12 w-full text-base"
              size="lg"
              onClick={() => {
                window.location.href = "/api/auth/google/start";
              }}
            >
              Continue with Google
            </Button>
            <p className="text-center text-xs text-slate-500">
              Your Google profile is used to sign you in. Learning progress is
              temporary until database storage is added.
            </p>
            {new URLSearchParams(window.location.search).has("error") && (
              <p className="text-center text-xs text-amber-300" role="status">
                Google sign-in did not complete. Please try again.
              </p>
            )}
          </CardContent>
        </Card>
        <Button
          asChild
          variant="ghost"
          className="min-h-11 w-full text-slate-300 hover:text-white"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to the course
          </Link>
        </Button>
      </div>
    </div>
  );
}
