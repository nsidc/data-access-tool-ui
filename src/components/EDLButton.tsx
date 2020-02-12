import * as jQuery from "jquery";
import * as React from "react";
// import * as ReactTooltip from "react-tooltip";

import { isLoggedInUser, isLoggedOutUser } from "../types/User";
import { IEnvironment } from "../utils/environment";
import { UserContext } from "../utils/state";

interface IEDLButtonProps {
  environment: IEnvironment;
}

export class EDLButton extends React.Component<IEDLButtonProps, {}> {
  public static contextType = UserContext;

  public render() {
    if (isLoggedInUser(this.context.user)) {
      return (
      <div className="earthdata-login">
        <this.LogoutButton />
      </div>
      );
    } else if (isLoggedOutUser(this.context.user)) {
      // Change from form to fetch? Here we actually want to redirect the user.
      const loginUrl = `${this.props.environment.urls.hermesApiUrl}/earthdata/auth/`;
      // TODO: Remove earthdata-login-button style?
      return (
        <div className="earthdata-login">
          <form method="GET" action={loginUrl}>
            <div className="button-group" id="earthdata-login-button">
              <button type="submit" className="eui-btn--blue eui-btn--group-main">
                {"Login to Earthdata"}
              </button>
            </div>
          </form>
        </div>
      );
    }

    // Unknown login state
    // TODO: show a loading spinner
    return (
      <div className="earthdata-login">
        <p>{"Loading"}</p>
      </div>
    );
  }

  public LogoutButton = () => {
    const logout = () => {
      this.props.environment.hermesAPI.logoutUser()
        .then((s: any) => {
          if (s.status === 200) {
            return this.context.updateUser();
          } else {
            // TODO: Is this fine? Does prod do better than this?
            throw(Error("something"));
          }
      });
    };

    const fullName = `${this.context.user.first_name} ${this.context.user.last_name}`;

    return (
      <div className="button-group" id="earthdata-login-button">
        <button className="eui-btn--blue eui-btn--group-main" id="name-logout-button">
          {fullName}
        </button>

        <button id="toggle-button-group"
                className="eui-btn--blue eui-btn--group-secondary toggle-button-group"
                onClick={this.toggleDropdown}>
          <i className="eui-icon eui-fa-sort-desc" />
        </button>

        <button onClick={logout} className="eui-btn--blue eui-btn--group-primary">
          {"Logout"}
        </button>

        <ul className="button-group--dropdown" style={{zIndex: 1}}>
          <li><a href={this.props.environment.urls.profileUrl}>Orders</a></li>
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
}
