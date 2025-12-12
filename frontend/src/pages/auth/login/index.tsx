import { ReactComponent as GitIcon } from "../../../icons/github.svg?react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { observer } from "mobx-react-lite";
import loginWithGoogle from "../../../globalStore/users/actions/loginWithGoogle";
import { useNavigate } from "react-router";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

export default observer(() => {
  const navigate = useNavigate();
  return (
    <Card className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800 p-0">
      <div className="md:flex overflow-y-auto md:flex-row">
        <div className="h-32 md:h-auto md:w-1/2">
          <img aria-hidden="true" className="object-cover w-full h-full" src="/images/login-bg.jpeg" alt="Login page" />
        </div>
        <main className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
          <div className="w-full">
            <GoogleOAuthProvider clientId={import.meta.env.VITE_AUTH_GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const credential = credentialResponse?.credential ?? "";
                  await loginWithGoogle({ credential });
                  navigate("/");
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
                useOneTap
              />
            </GoogleOAuthProvider>
            <hr className="my-8" />
            <Button
              className="p-button-lg"
              icon={<GitIcon className="w-4 h-4 mr-2" aria-hidden="true" />}
              iconPos="left"
              label="Github"
            />
          </div>
        </main>
      </div>
    </Card>
  );
});
