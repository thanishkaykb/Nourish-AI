import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton({ fallback = "/" }: { fallback?: "/" | "/dashboard" }) {
  const navigate = useNavigate();

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate({ to: fallback });
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={goBack} className="gap-2">
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}