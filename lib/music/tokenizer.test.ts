import { Token, TokenType } from "./token";
import { tokenize } from "./tokenizer";

const CHORD_PRO = String.raw`
{title: Caótica Belleza}
{artist: Esteman}

{instrument: electric uke ukulele electric}
{pattern: single plugged |1234----|}# Great pattern

{start_of_verse: Verse 1}
Un lu[Am]gar para es[C]tar y vi[G]vir lo que se he[Am]reda.
Una can[Am]ción sin condi[C]ción para so[G]nar lo que noes [Am]queda.
{pattern: |12341234| @ electric uke}
Hoy puedo [Am]ver lo que yo [C]fui. De donde [G]soy, de donde [Am]vengo.
No es prote[Am]star no es una [C]guerra, es lo que [G]soy y lo que [Am]tengo.
{end_of_verse}

{start_of_tab}
|----|----|----|----|
|----|0--3|---0|----|
|--0-|--4-|2-2-|----|
|2---|----|----|2---|
{end_of_tab}
`.trimStart();

test("tokenizes and converts back to string", () => {
  expect(tokenize(CHORD_PRO).toString()).toEqual(CHORD_PRO);
});

test("parses patterns", () => {
  expect(tokenize("{pattern: name}").children[0]).toEqual(
    expect.objectContaining({ key: "name" })
  );
  expect(tokenize("{pattern: name |d-du|}").children[0]).toEqual(
    expect.objectContaining({ key: "name", value: "|d-du|" })
  );
  expect(tokenize("{pattern: name @ instrument}").children[0]).toEqual(
    expect.objectContaining({ key: "name", value: "@ instrument" })
  );
  expect(tokenize("{pattern: name |d-du| @ instrument}").children[0]).toEqual(
    expect.objectContaining({ key: "name", value: "|d-du| @ instrument" })
  );
});
