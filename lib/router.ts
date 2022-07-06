/** Returns the link to a song page. */
export function songLink(id: string): string {
  return `/s/${id}`;
}

/** Returns the link to edit a song in the raw editor. */
export function songRawEditorLink(id: string): string {
  return `/s/edit/${id}`;
}
