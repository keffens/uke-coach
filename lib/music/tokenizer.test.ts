import { tokenize } from "./tokenizer";

test("tokenizes and converts back to string", () => {
  const song = [
    "{title: Caótica Belleza}",
    "{artist: Esteman}",
    "",
    "{instrument: electric uke ukulele electric}",
    "{pattern: single plugged |1234----|}# Great pattern",
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
    "",
  ].join("\n");
  expect(tokenize(song).toString()).toEqual(song);
});
