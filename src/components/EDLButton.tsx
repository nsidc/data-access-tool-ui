import * as React from "react";
// import * as ReactTooltip from "react-tooltip";

import { IEnvironment } from "../utils/environment";
import { UserContext } from "../utils/state";

interface IEDLButtonProps {
  environment: IEnvironment;
}

export class EDLButton extends React.Component<IEDLButtonProps, {}> {
  public constructor(props: IEDLButtonProps) {
    super(props);
    // TODO: No bind. There _must_ be a better way!
    // <img src="billy_mays.jpg">
    this.renderWithUserContext = this.renderWithUserContext.bind(this);
    this.LogoutButton = this.LogoutButton.bind(this);
  }

  public renderWithUserContext({user, updateUser}: any) {
    // TODO: Figure out a way to show a loading spinner until we know whether user logged in or not
    // Consider a second piece of state userLoggedIn that starts as undefined and is set to true or false
    // depending on result of getUser call.
    const hermesApiUrl: string = this.props.environment.urls.hermesApiUrl;

    // Unknown login state
    if (user === undefined) {
      return (
        <p>{"Loading"}</p>
      );
    // Logged out
    } else if (!user) {
      const loginUrl = `${hermesApiUrl}/api/earthdata/auth/`;
      return (
        <form method="GET" action={loginUrl}>
          <div className="button-group" id="earthdata-login-button">
            <button type="submit" />
          </div>
        </form>
      );
    // Logged in
    } else {
      return (
        <div className="button-group" id="earthdata-login-button">
          <this.LogoutButton updateUser={updateUser} />
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

  public render() {
    return (
      <div className="earthdata-login">
        <UserContext.Consumer>
          {this.renderWithUserContext}
        </UserContext.Consumer>
      </div>
    );
  }

}
