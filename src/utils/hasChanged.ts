import { Map } from "immutable";

export const hasChanged = (current: object = {}, next: object = {}, keySubset: string[] = []): boolean => {
  const compareMap = (values: any) => {
    return Map(keySubset.map((key) => [key, values[key]]));
  };

  const currentMap = compareMap(current);
  const nextMap = compareMap(next);

  const changed = !currentMap.equals(nextMap);

  return changed;
};
