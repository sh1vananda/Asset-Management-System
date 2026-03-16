import { RouterProvider } from "react-router-dom";
import router from "./core/router";
import ErrorBoundary from "./shared/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;