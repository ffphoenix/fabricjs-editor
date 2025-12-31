import Layout from "../layouts/Layout";
import { type RouteObject } from "react-router";
import EditorPage from "../pages/editor";

const routes: RouteObject[] = [
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "/",
        Component: EditorPage,
      },
    ],
  },
];
export default routes;
