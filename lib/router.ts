/** Returns the link to a song page. */
export function songLink(id: string): string {
  return `/s/${id}`;
}

export const NEW_SONG_ID = "new";

/** Returns the link to edit a song in the raw editor. */
export function songRawEditorLink(id: string = NEW_SONG_ID): string {
  return `/s/edit/${id}`;
}
