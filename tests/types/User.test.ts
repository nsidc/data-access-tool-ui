import { EverestUserLoggedOut,
         EverestUserUnknownStatus,
         isLoggedInUser,
         isLoggedOutUser } from "../../src/types/User";

describe("isLoggedInUser", () => {
  test("returns true with a user matching the interface ILoggedInUser", () => {
    const user = {
      first_name: 'Obi-Wan',
      last_name: 'Kenobi',
      type: 'user',
      uid: 'okenobi',
    };
    const actual = isLoggedInUser(user);
    expect(actual).toBe(true);
  });

  test("returns false with a logged out user", () => {
    const user = EverestUserLoggedOut;
    const actual = isLoggedInUser(user);
    expect(actual).toBe(false);
  });

  test("returns false with a user whose status is not yet known", () => {
    const user = EverestUserUnknownStatus;
    const actual = isLoggedInUser(user);
    expect(actual).toBe(false);
  });
});

describe("isLoggedOutUser", () => {
  test("returns false with a user matching the interface ILoggedInUser", () => {
    const user = {
      first_name: 'Obi-Wan',
      last_name: 'Kenobi',
      type: 'user',
      uid: 'okenobi',
    };
    const actual = isLoggedOutUser(user);
    expect(actual).toBe(false);
  });

  test("returns true with a logged out user", () => {
    const user = EverestUserLoggedOut;
    const actual = isLoggedOutUser(user);
    expect(actual).toBe(true);
  });

  test("returns false with a user whose status is not yet known", () => {
    const user = EverestUserUnknownStatus;
    const actual = isLoggedOutUser(user);
    expect(actual).toBe(false);
  });
});
