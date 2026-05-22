import QueryProvider from "./app/providers/QueryProvider";
import AppRoutes from "./app/router/AppRouter";

import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AppRoutes />
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
