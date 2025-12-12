import { action } from "mobx";
import apiClient from "../../../utils/apiClient";
import CurrentUser from "../CurrentUser";
import type { User } from "../../../../generated/api";

const setCurrentUser = action((user: User) => {
  CurrentUser.email = user.email;
  CurrentUser.role = user.role;
  CurrentUser.pictureUrl = user.pictureUrl;
  CurrentUser.firstName = user.firstName;
  CurrentUser.lastName = user.lastName;
});

export default async () => {
  apiClient.users.getCurrentUser().then((user) => setCurrentUser(user.data));
};
