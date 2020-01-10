import * as React from "react";
// import * as ReactTooltip from "react-tooltip";

import { IEnvironment } from "../utils/environment";
import { UserContext } from "../utils/state";

interface ILoginButtonProps {
  environment: IEnvironment;
}

export class LoginButton extends React.Component<ILoginButtonProps, {}> {
  public constructor(props: ILoginButtonProps) {
    super(props);
    // TODO: No bind. There _must_ be a better way!
    // <img src="billy_mays.jpg">
    this.renderWithUserContext = this.renderWithUserContext.bind(this);
    this.LoginButton = this.LoginButton.bind(this);
    this.LogoutButton = this.LogoutButton.bind(this);
  }

  public renderWithUserContext({user, updateUser}: any) {
    // TODO: Figure out a way to show a loading spinner until we know whether user logged in or not
    // Consider a second piece of state userLoggedIn that starts as undefined and is set to true or false
    // depending on result of getUser call.

    // Unknown login state
    if (user === undefined) {
      return (
        <div className="earthdata-login">
          {"Loading"}
        </div>
      );
    // Logged out
    } else if (!user) {
      return (
        <div className="earthdata-login">
          <div className="button-group" id="earthdata-login-button">
            <this.LoginButton />
          </div>
        </div>
      );
    // Logged in
    } else {
      return (
        <div className="earthdata-login">
          <div className="button-group" id="earthdata-login-button">
            <this.LogoutButton updateUser={updateUser} />
          </div>
        </div>
      );
    }
  }

  public LogoutButton(props: {updateUser: any}) {
    const logout = () => {
      this.props.environment.hermesAPI.logoutUser()
        .then((s: any) => {
          if (s.status === 200) {
            return props.updateUser();
          } else {
            // TODO: Is this fine? Does prod do better than this?
            throw(Error("something"));
          }
      });
    };

    return (
      <button onClick={logout}>
        {"Logout"}
      </button>
    );
  }

  public LoginButton() {
    const hermesApiUrl = this.props.environment.urls.hermesApiUrl;
    const loginUrl = `${hermesApiUrl}/api/earthdata/auth/`;
    return (
      <a href={loginUrl}>Login</a>
    );
  }

  public render() {
    return (
      <UserContext.Consumer>
        {this.renderWithUserContext}
      </UserContext.Consumer>
    );
  }

}
