import { observable } from "mobx";
import type { User } from "../../../generated/api";

export default observable({
  id: null,
  email: null,
  pictureUrl: null,
  role: null,
  firstName: null,
  lastName: null,
} as unknown as User);
