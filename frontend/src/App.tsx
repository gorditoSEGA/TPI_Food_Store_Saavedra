import { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  // Única llamada en useEffect: confirma con GET /auth/me si la cookie sigue vigente
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return <AppRouter />;
}
