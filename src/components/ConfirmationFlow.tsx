import * as React from "react";
import * as ReactModal from "react-modal";

import { OrderSubmissionParameters } from "../types/OrderSubmissionParameters";
import { OrderTypes } from "../types/orderTypes";
import { IEnvironment } from "../utils/environment";
import { hasChanged } from "../utils/hasChanged";

interface IConfirmationFlowProps {
  environment: IEnvironment;
  onRequestClose: any;
  orderSubmissionParameters?: OrderSubmissionParameters;
  orderSubmitResponse?: any;
  orderType?: OrderTypes;
  show: boolean;
}

interface IConfirmationFlowState {
  visibleUI: any;
}

export class ConfirmationFlow extends React.Component<IConfirmationFlowProps, IConfirmationFlowState> {
  public constructor(props: IConfirmationFlowProps) {
    super(props);
    this.generateConfirmationContent = this.generateConfirmationContent.bind(this);
    this.handleConfirmationClick = this.handleConfirmationClick.bind(this);
    this.handleOrderReceivedResponse = this.handleOrderReceivedResponse.bind(this);
    this.handleOrderNotReceivedResponse = this.handleOrderNotReceivedResponse.bind(this);
    this.generateResponseContent = this.generateResponseContent.bind(this);
    this.resetUI = this.resetUI.bind(this);
    this.state = {
      visibleUI: this.generateConfirmationContent(),
    };
  }

  public shouldComponentUpdate(nextProps: IConfirmationFlowProps, nextState: IConfirmationFlowState) {
    const propsChanged = hasChanged(this.props, nextProps, ["environment", "orderSubmitResponse", "show", "orderType"]);
    const stateChanged = hasChanged(this.state, nextState, ["visibleUI"]);
    return stateChanged || propsChanged;
  }

  public render() {
    return (
      <ReactModal className="modal-content"
                  isOpen={this.props.show}
                  onRequestClose={this.props.onRequestClose}>
        {this.state.visibleUI}
      </ReactModal>
    );
  }

  public handleConfirmationClick() {
    if (this.props.orderSubmissionParameters && this.props.orderType !== undefined) {
      this.props.environment.hermesAPI.submitOrder(
        this.props.environment.user,
        this.props.orderSubmissionParameters.granuleURs,
        this.props.orderSubmissionParameters.collectionInfo,
        this.props.orderType,
      )
      .then((json: any) => this.handleOrderReceivedResponse(json))
      .catch((err: any) => this.handleOrderNotReceivedResponse(err));
    }
  }

  private resetUI() {
    this.setState({visibleUI: this.generateConfirmationContent()});
  }

  private handleOrderNotReceivedResponse(err: any) {
    console.log("Order submission failed: " + err);
    this.setState({visibleUI: this.generateErrorResponseContent(err)});
  }

  private handleOrderReceivedResponse(json: any) {
    this.setState({visibleUI: this.generateResponseContent(json)});
  }

  private generateConfirmationContent() {
    return (
      <div>
        <h3>{"Confirm Your Download Order"}</h3>
        <p>{"Your download order is about to be submitted."}</p>
        <button className="submit-button eui-btn--green"
                onClick={this.handleConfirmationClick}>
          OK
        </button>
        <button className="cancel-button eui-btn--red"
                onClick={this.props.onRequestClose}>
          Cancel
        </button>
      </div>
    );
  }

  private generateResponseContent(response: any) {
    return (
      <div>
        <p>foo: {JSON.stringify(response)}</p>
        <button className="submit-button eui-btn--green"
                onClick={ () => { this.props.onRequestClose(); this.resetUI(); } }>
          OK
        </button>
      </div>
    );
  }
  private generateErrorResponseContent(err: any) {
    return (
      <div>
        <p>ERROR: {JSON.stringify(err)}</p>
        <button className="submit-button eui-btn--red"
                onClick={ () => { this.props.onRequestClose(); this.resetUI(); } }>
          OK
        </button>
      </div>
    );
  }
}
