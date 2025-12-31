import GameLayout from "../layouts/Layout";
import { type RouteObject } from "react-router";
import GamePage from "../pages/gameScene";

const routes: RouteObject[] = [
  {
    path: "/",
    Component: GameLayout,
    children: [
      {
        path: "/",
        Component: GamePage,
      },
    ],
  },
];
export default routes;
