import { Song } from "./song";
import { tokenize } from "./tokenizer";

const CHORD_PRO = [
  "{title: Caótica Belleza}",
  "{artist: Esteman}",
  "{time: 4/4}",
  "{tempo: 100}",
  "",
  "{instrument: electric uke ukulele electric}",
  "{pattern: single plugged |1234----|}",
  "{chord: C frets 5 4 3 3}",
  "",
  "{start_of_verse: Verse 1}",
  "Un lu[Am]gar para es[C]tar y vi[G]vir lo que se he[Am]reda.",
  "Una can[Am]ción sin condi[C]ción para so[G]nar lo que noes [Am]queda.",
  "Hoy puedo [Am]ver lo que yo [C]fui. De donde [G]soy, de donde [Am]vengo.",
  "No es prote[Am]star no es una [C]guerra, es lo que [G]soy y lo que [Am]tengo.",
  "{end_of_verse}",
  "",
  "{start_of_tab}",
  "|----|----|----|----|",
  "|----|0--3|---0|----|",
  "|--0-|--4-|2-2-|----|",
  "|2---|----|----|2---|",
  "{end_of_tab}",
  "[Am][C][G][Am]",
  "",
].join("\n");
const SONG = Song.fromTokens(tokenize(CHORD_PRO));

test("parses song and converts back to string", () => {
  // TODO: This should work for the global constant.
  const chordPro = [
    "{title: Caótica Belleza}",
    "{artist: Esteman}",
    "{time: 4/4}",
    "{tempo: 100}",
    "",
    "",
  ].join("\n");
  const song = Song.fromTokens(tokenize(chordPro));
  expect(song.toTokens().toString()).toEqual(chordPro);
});

test("converts song to SongData", () => {
  expect(SONG.toSongData("id-123", "owner", CHORD_PRO)).toEqual({
    artist: "Esteman",
    chordPro: CHORD_PRO,
    deployed: false,
    id: "id-123",
    ownerId: "owner",
    sorttitle: "",
    title: "Caótica Belleza",
  });
});

test("gets bars for song", () => {
  expect(SONG.bars.length).toBe(20);
  expect(SONG.barsLength).toBe(20);
});

test("gets used patterns for song", () => {
  expect(SONG.usedPatterns(0).size).toBe(2);
});

test("gets used chords for song", () => {
  expect([...SONG.usedChords(0)]).toEqual(["Am", "C", "G"]);
});
