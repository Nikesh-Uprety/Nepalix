import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminIndex() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/admin/dashboard", { replace: true });
  }, [setLocation]);
  return null;
}
