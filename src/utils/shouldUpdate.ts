import { Map } from "immutable";

interface IGenericShouldUpdateArgs {
  currentProps: any;
  currentState: any;
  nextProps: any;
  nextState: any;
  propsToCheck: string[];
  stateToCheck: string[];
}

export const genericShouldUpdate = ({
  currentProps = {},
  currentState = {},
  nextProps = {},
  nextState = {},
  propsToCheck = [],
  stateToCheck = [],
}: Partial<IGenericShouldUpdateArgs>): boolean => {
  const compareMap = (props: any, state: any) => {
    let compare = Map();

    propsToCheck.forEach((propName: string) => {
      compare = compare.set(propName, props[propName]);
    });
    stateToCheck.forEach((stateName: string) => {
      compare = compare.set(stateName, state[stateName]);
    });

    return compare;
  };

  const current = compareMap(currentProps, currentState);
  const next = compareMap(nextProps, nextState);

  const changed = !current.equals(next);

  return changed;
};
