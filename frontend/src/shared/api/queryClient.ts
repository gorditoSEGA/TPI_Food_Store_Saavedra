import { QueryClient } from "@tanstack/react-query";

/** Instancia única de TanStack Query para toda la aplicación. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
