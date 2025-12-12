import CurrentUser from "../CurrentUser";

export default () =>
  CurrentUser.email !== undefined &&
  CurrentUser.email !== null &&
  CurrentUser.email !== "";
