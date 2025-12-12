import { tokenManager } from "../../../utils/apiClient";

export default () => {
  tokenManager.deleteTokens();
  window.location.href = "/auth/login";
};
