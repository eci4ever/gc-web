/** Read a string field from FormData (file inputs become empty strings). */
export function formString(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}
