import { createBrowserRouter, RouterProvider } from "react-router";
import routesConfig from "./routes/routesConfig";
import { ThemeProvider } from "./context/ThemeContext";
import { PrimeReactProvider } from "primereact/api";

export default () => {
  const router = createBrowserRouter(routesConfig);
  return (
    <PrimeReactProvider value={{ ripple: false }}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </PrimeReactProvider>
  );
};
