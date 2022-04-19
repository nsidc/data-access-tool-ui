import * as React from "react";
import { Link, Outlet } from "react-router-dom";
import { CollectionDropdown } from "./components/CollectionDropdown";

export class App extends React.Component {
  public render() {
    const cmrStatus = true;
    const collectionDropdown = (
      <CollectionDropdown
        onCmrRequestFailure={this.dummyOnCmrRequestFailure}
        cmrStatusOk={cmrStatus}
        onCollectionChange={this.dummyHandleCollectionChange} />
    );
    return (
      <div>
        <div id="collection-list">
          {collectionDropdown}
        </div>
        <ul>
          <li><Link to="/order">Order data</Link></li>
          <li><Link to="/order-history">Order history</Link></li>
        </ul>
      <Outlet />
      </div>
    )
  }

  private dummyOnCmrRequestFailure = (response: any) => {
    // Setting status to an empty string will generate the default error message.
    let msg = "";
    if (response.json) {
      response.json().then((json: any) => {
        msg = "Error: " + json.errors[0];
      });
    }
    console.log(msg);
  };

    private dummyHandleCollectionChange = (collection: any) => {
      console.log("Collection changed")
    }
};
