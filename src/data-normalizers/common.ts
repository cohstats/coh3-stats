import { Owner } from "./types";
import nodePath from "path";

export type CommonProperties<T extends string> = Record<string, unknown> & {
  path: string;
  owner: Owner;
} & { [key in T]?: unknown };

/**
 * Unwraps a nested object into a flat array of objects, where each object has a property
 * with the name of the targetProperty
 * @param targetProperty the property to look for in the nested object
 * @param data the nested object to flatten
 * @param path the path to the current node
 */
export function flattenByProperty<T extends string>(
  targetProperty: T,
  data: Record<string, unknown>,
  path = "/",
) {
  const flattenedData: CommonProperties<T>[] = [];

  return (function flattenNode(targetProperty: T, data: Record<string, unknown>, path = "/") {
    if (data && typeof data === "object") {
      if (data.hasOwnProperty(targetProperty)) {
        console.log(data);
        const rootNode = {
          path,
          owner: path.split("/")[0] as Owner,
          [targetProperty]: data[targetProperty],
          ...data,
        } satisfies CommonProperties<T>;

        flattenedData.push(rootNode);

        return flattenedData;
      } else {
        Object.entries(data).forEach(([key, value]) => {
          flattenByProperty(
            targetProperty,
            value as Record<string, unknown>,
            nodePath.join(path, key),
          );
        });
      }
    }
  })(targetProperty, data, path);
}
