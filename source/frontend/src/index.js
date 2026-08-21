import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";

// Capture le hash d'import LE PLUS TÔT possible : certains scripts d'overlay
// (preview Emergent, routeurs, etc.) peuvent vider le fragment d'URL avant que
// React ne boote. On le sauvegarde ici dans une variable globale pour que
// AppContext puisse le lire de manière fiable.
try {
  if (typeof window !== "undefined" && window.location && window.location.hash) {
    window.__LESSON_LOOM_INITIAL_HASH = window.location.hash;
  }
} catch (e) {
  console.warn('[LessonLoom] Impossible de capturer le hash initial :', e);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
