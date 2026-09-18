import AppRoutes from "@/app/AppRoutes";
import SessionVerificationGuard from "@/shared/components/routing/SessionVerificationGuard";
import { Routes } from "@/shared/routing/routes";
import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

/** Owns browser history so forms can block navigation before losing edits. */
const AppRouter = () => {
  const [router] = useState(() =>
    createBrowserRouter(
      [{ element: <SessionVerificationGuard />, children: [{ path: "*", element: <AppRoutes /> }] }],
      {
        basename: Routes.basePath,
        future: { v7_relativeSplatPath: true },
      },
    ),
  );
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
};

export default AppRouter;
