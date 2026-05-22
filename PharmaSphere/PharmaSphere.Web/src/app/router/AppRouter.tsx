import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import PageLoader from "@/components/common/PageLoader";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const UserListPage = lazy(() => import("@/pages/users/UsersPage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UserListPage />} />
      </Routes>
    </Suspense>
  );
}