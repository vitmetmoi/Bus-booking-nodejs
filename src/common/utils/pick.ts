/**
 * Create an object composed of the picked object properties
 * @param object - The source object
 * @param keys - Array of keys to pick
 * @returns New object with only picked keys
 */
export function pick<T extends Record<string, any>, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key];
    }
    return result;
  }, {} as Pick<T, K>);
}
