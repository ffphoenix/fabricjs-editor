import Layout from "../layouts/Layout";
import loginRoute from "../pages/auth/login/route";
import GuestLayout from "../layouts/GuestLayout";
import GameLayout from "../layouts/GameLayout";
import { redirect, type RouteObject } from "react-router";
import Dashboard from "../pages/Dashboard";
import GamePage from "../pages/gameScene";
import { tokenManager } from "../utils/apiClient";

const routes: RouteObject[] = [
  {
    path: "/",
    loader() {
      if (!tokenManager.isAuthenticated()) {
        return redirect("/auth/login");
      }
      return null;
    },
    Component: Layout,
    children: [
      {
        path: "/",
        Component: Dashboard,
      },
    ],
  },
  {
    path: "game/",
    Component: GameLayout,
    children: [
      {
        path: ":gameId",
        Component: GamePage,
      },
    ],
  },
  {
    path: "auth",
    loader() {
      if (tokenManager.isAuthenticated()) {
        return redirect("/");
      }
      return null;
    },
    Component: GuestLayout,
    children: [loginRoute],
  },
];
export default routes;
