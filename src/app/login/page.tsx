import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-card border border-border bg-surface p-8 shadow-soft">
        <div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Use the email and password from your mess admin.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
