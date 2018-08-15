import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";

export const LoadingIcon = () => (
  <FontAwesomeIcon icon={faSpinner} size="lg" pulse />
);
