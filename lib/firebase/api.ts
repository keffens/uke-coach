import { SongData, userIdToken } from ".";

async function fetchWithAuth<Res>(
  target: string,
  req: any = {}
): Promise<{ response?: Res; status: number; statusText?: string }> {
  const response = await fetch(`/api/${target}`, {
    method: "POST",
    body: JSON.stringify({ ...req, idToken: await userIdToken() }),
  });
  if (response.status !== 200) {
    const { error } = await response.json().catch(() => ({}));
    return {
      status: response.status,
      statusText: error || response.statusText,
    };
  }
  return { response: (await response.json()) as Res, status: 200 };
}

export async function callSaveSong(
  songId: string,
  chordPro: string
): Promise<{
  errorMessage?: string;
  songData?: SongData;
}> {
  const { response, status, statusText } = await fetchWithAuth<{
    songData: SongData;
  }>("saveSong", { songId, chordPro });
  if (response) {
    return { songData: response.songData };
  }
  return { errorMessage: `${status} Failed to join room: ${statusText}` };
}
