import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";

export default observer(() => {
  return (
    <div className="w-full">
      <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
        Login
      </h1>
      {/*<InputGroup
        label={"Email"}
        type={"email"}
        placeholder={"john@doe.com"}
        preIcon={<MailIcon />}
      />
      <br />
      <InputGroup
        label={"Password"}
        type={"password"}
        placeholder={"*******"}
      />*/}
      <br />
      <Button label={"Log In"} />
    </div>
  );
});
