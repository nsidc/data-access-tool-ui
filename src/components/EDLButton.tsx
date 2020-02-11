import * as jQuery from "jquery";
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
      // Change from form to fetch? Here we actually want to redirect the user.
      const loginUrl = `${hermesApiUrl}/api/earthdata/auth/`;
      // TODO: Remove earthdata-login-button style?
      return (
        <form method="GET" action={loginUrl}>
          <div className="button-group" id="earthdata-login-button">
            <button type="submit" className="eui-btn--blue eui-btn--group-main">
              {"Login to Earthdata"}
            </button>
          </div>
        </form>
      );
    // Logged in
    } else {
      return (
        <this.LogoutButton user={user} updateUser={updateUser} />
      );
    }
  }

  public LogoutButton(props: {user: any; updateUser: any}) {
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

    const userName = `${props.user.first_name} ${props.user.last_name}`;

    return (
      <div className="button-group" id="earthdata-login-button">
        <button className="eui-btn--blue eui-btn--group-main" id="name-logout-button">
          {userName}
        </button>

        <button id="toggle-button-group"
                className="eui-btn--blue eui-btn--group-secondary toggle-button-group"
                onClick={this.toggleDropdown}>
          <i className="eui-icon eui-fa-sort-desc" />
        </button>

        <button onClick={logout} className="eui-btn--blue eui-btn--group-primary">
          {"Logout"}
        </button>

        <ul className="button-group--dropdown">
          <li><a href="somewhere over the rainbow">Orders</a></li>
        </ul>
      </div>
    );
  }

  public toggleDropdown(event: any) {
    // Simply loading the earthdata UI javascript doesn't properly register
    // all event listeners because the elements that need listeners
    // registered wouldn't be mounted yet. This code is copied from:
    //   https://cdn.earthdata.nasa.gov/eui/1.1.7/js/eui.js
    event.stopPropagation();
    jQuery(".button-group--dropdown").slideToggle("fast");
  }

  public componentDidMount() {
    // Simply loading the earthdata UI javascript doesn't properly register
    // all event listeners because the elements that need listeners
    // registered wouldn't be mounted yet. This code is copied from:
    //   https://cdn.earthdata.nasa.gov/eui/1.1.7/js/eui.js
    jQuery(() => {
      jQuery(document).click((e: any) => {
        const targetIds = [e.target.id, e.target.parentElement.id];
        const undesiredTargetId = "toggle-button-group";
        if (!targetIds.includes(undesiredTargetId)) {
          jQuery(".button-group--dropdown").hide();
        }
      });
      jQuery(document).keyup((e: any) => {
        if (e.keyCode === 27) {
          jQuery(".button-group--dropdown").hide();
        }
      });
    });
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
