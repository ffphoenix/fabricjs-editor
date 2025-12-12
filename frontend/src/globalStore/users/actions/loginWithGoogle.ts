import apiClient, { tokenManager } from "../../../utils/apiClient";
import setCurrentUser from "./setCurrentUser";
import type { CredentialResponseDto } from "../../../../generated/api";

export default async (credentialResponse: CredentialResponseDto) => {
  const response = await apiClient.auth.googleLogin({ credentialResponse });
  tokenManager.saveTokens(response.data);
  await setCurrentUser();
};
