import * as crypto from "crypto-js";
import { Content } from "../types";

export function createSHA256Hash(input: string) {
    const hash = crypto.SHA1(input);
    return hash.toString();
}
export function getValuesBetween(arr: Content[], index1: number, index2: number) {

    const values: Content[] = [];
    for (let i = Math.min(index1, index2); i <= Math.max(index1, index2); i++) {
        values.push(arr[i]);
    }
    if (index1 > index2) {
        return values.reverse();
    }
    return values;
}
export function deleteSubstring(str: string, startIndex: number, endIndex: number) {
    return str.slice(0, startIndex) + str.slice(endIndex);
}