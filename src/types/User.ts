// response from hermes-api's `GET /user/` has at least these keys when logged
// in, and this is also the interface the Everest app uses for the user state
export interface ILoggedInUser {
  readonly first_name: string;
  readonly last_name: string;
  readonly type: "user";
  readonly uid: string;
}

// response from hermes-api's `GET /user/` when not logged in
interface IHermesApiLoggedOutUser {
  readonly type: "anonymous";
}

// hermes-api `GET /user/` returns JSON matching either an ILoggedInUser or
// `{ "type": "anonymous" }`
export type HermesAPIUserJSON = ILoggedInUser | IHermesApiLoggedOutUser;

export const EverestUserUnknownStatus = null;
export const EverestUserLoggedOut = false;
export type EverestUser = ILoggedInUser | false | null;

export function isLoggedInUser(object: any): object is ILoggedInUser {
  return Boolean(object) &&
    ("first_name" in object) &&
    ("last_name" in object) &&
    ("type" in object) &&
    ("uid" in object) &&
    (object.type === "user");
}

export function isLoggedOutUser(object: any): boolean {
  return object === EverestUserLoggedOut;
}
