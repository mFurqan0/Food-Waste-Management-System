"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";

export function SubmitButton({ children, pendingText = "Saving…" }: { children: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingText : children}
    </Button>
  );
}
