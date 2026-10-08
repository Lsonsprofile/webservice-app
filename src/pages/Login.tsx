import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

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
              Sign in to save your progress, quiz scores, and learning path
              across devices.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="min-h-12 w-full text-base"
              size="lg"
              onClick={() => {
                window.location.href = getOAuthUrl();
              }}
            >
              Sign in with Kimi
            </Button>
            <p className="text-center text-xs text-slate-500">
              You can also explore the whole course without an account —
              progress then stays in this browser session only.
            </p>
          </CardContent>
        </Card>
        <Button asChild variant="ghost" className="min-h-11 w-full text-slate-300 hover:text-white">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to the course
          </Link>
        </Button>
      </div>
    </div>
  );
}
