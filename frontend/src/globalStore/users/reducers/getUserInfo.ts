import CurrentUser from "../CurrentUser";

export default () => ({
  email: CurrentUser.email,
  pictureUrl: CurrentUser.pictureUrl,
  role: CurrentUser.role,
  fullName: CurrentUser.firstName + " " + CurrentUser.lastName,
});
