import AppRoutes from "@/app/AppRoutes";
import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

/** Owns browser history so forms can block navigation before losing edits. */
const AppRouter = () => {
  const [router] = useState(() =>
    createBrowserRouter([{ path: "*", element: <AppRoutes /> }], {
      basename: "/app",
      future: { v7_relativeSplatPath: true },
    }),
  );
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
};

export default AppRouter;
