import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";

type AllowedSizes = "5x" | "lg" | "sm" | "xs";

interface ILoadingIconProps {
  className?: string;
  size?: AllowedSizes;
}

export const LoadingIcon = (props: ILoadingIconProps) => {
  return (
    <span className={props.className ? props.className : "loading-spinner-container"}>
      <FontAwesomeIcon
        icon={faSpinner}
        size={props.size ? props.size : "lg"}
        pulse />
    </span>
  );
};
