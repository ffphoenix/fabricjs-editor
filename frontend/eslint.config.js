import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  pluginReact.configs.flat.recommended,
  eslintPluginPrettierRecommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/display-name": "off",
      "react/prop-types": "off",
    },
  },
);
