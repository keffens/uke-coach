import { Song } from "./song";
import { tokenize } from "./tokenizer";

const KRIMINAL_TANGO = String.raw`
{title: Kriminal Tango}
{artist: Hazy Osterwald}
{key: C}
{time: 4/4}
{tempo: 120}

{instrument: ukulele ukulele}

{chord: D7 2 0 2 0}
{pattern: *verse start |----d-d-|d-d-du-u|}
{pattern: verse |d-d-d-d-|d-d-du-u|}
{pattern: tremolo |t---|}
{pattern: *single |D-------|}


{start_of_verse: Verse 1}
{pattern: *verse start}
[C.][...]Und sie tanzen einen [C]Tango, {pattern: verse}[C.][...]Jacky Brown und Baby [G7]Miller.
[G7.][...]Und er sagt ihr leise: [G7]"Baby, [G7.][...]wenn ich austrink', machst du [C..]dicht." [F..]
[C.][...]Dann bestellt er zwei Man[C]hattan, [C7.][...]und dann kommt ein Herr mit [F]Kneifer.
[F.][...]Jack trink aus und Baby [C]zittert, [G7.][...]doch dann löscht sie schnell das {pattern: tremolo}[Cm]Licht.
{end_of_verse}

{start_of_chorus}
{pattern: tremolo}
[Cm..][..]Kriminal [Fm]Tango [Fm..][..]in der Ta[Cm]verne.
[Cm..][..]Dunkle [Fm]Gestalten, [Fm..][..]rote La[Cm]terne.
[Cm..][..]Abend für [C7]Abend [C7..][..]lodert die [Fm]Lunte,
[Fm..][..]sprühende [D7]Spannung [D7..][..]liegt in der {pattern: *single}[G7]Luft.
{end_of_chorus}

{start_of_verse: Verse 2}
{pattern: *verse start}
[C.][...]Und sie tanzen einen [C]Tango, {pattern: verse}[C.][...]alle, die davon nichts [G7]ahnen.
[G7.][...]Und sie fragen die Ka[G7]pelle: [G7.][...]"Hab'n Sie nicht was Heißes [C..]da?" [F..]
[C.][...]Denn sie können ja nicht [C]wissen, [C7.][...]was da zwischen Tag und [F]Morgen
[F.][...]in der nächtlichen Ta[C]verne [G7.][...]bei dem Tango schon ge{pattern: tremolo}[Cm]schah.
{end_of_verse}
`.trim();

test("parses Kriminal Tango and converts back to string", () => {
  const song = Song.fromTokens(tokenize(KRIMINAL_TANGO));
  expect(song.tokenize().toString().trim()).toEqual(KRIMINAL_TANGO);
});

const CHAOTICA_BELLEZA = String.raw`
{title: Caótica Belleza}
{artist: Esteman}
{key: Am}
{time: 4/4}
{tempo: 125}

{instrument: uke 1 ukulele}
{instrument: uke 2 ukulele (low G-string) steel}
{instrument: bajo bass}

{start_of_instrument: uke 1}
{pattern: single plugged |1234----|}
{pattern: doube plugged |12341234|}
{pattern: chorus |xu-u-u-u|}
{pattern: *single |d-------|}
{end_of_instrument}

{start_of_instrument: uke 2}
{chord: C 5 4 3 3}
{pattern: intro 1st |(34)-4-(23)-3-|}
{pattern: intro/verse |(14)-2-3-2-|}
{start_of_tab: chorus}
|--------|--------|--------|--------|
|--0---0-|--3---3-|--------|--0---0-|
|--------|0---0--0|--2---2-|--------|
|2---2--2|--------|0---0--0|2---2---|
{end_of_tab}
{pattern: *single |1-------|}
{end_of_instrument}

{start_of_instrument: bajo}
{start_of_tab: verse}
|----|----|----|----|----|----|----|----|
|----|----|----|----|----|----|----|----|
|----|3---|----|----|----|3---|----|----|
|5---|----|3---|5---|5-7-|----|3--0|5---|
{end_of_tab}
{start_of_tab: chorus}
|--------|--------|--------|--------|
|--------|--5---5-|--------|--------|
|--7---7-|3---3--3|--5---5-|--7---7-|
|5---5--5|--------|3---3--3|5---5---|
{end_of_tab}
{start_of_tab: *single}
|----|
|----|
|----|
|5---|
{end_of_tab}
{pattern: *bass pause |----|}
{end_of_instrument}


{pattern: single plugged @ uke 1}
{pattern: intro 1st @ uke 2}
{pattern: verse @ bajo}
[Am]{pattern: intro/verse @ uke 2}[C][G][Am]
{pattern: intro 1st @ uke 2}
[Am]{pattern: intro/verse @ uke 2}[C][G][Am]

{start_of_verse: Verse 1}
{pattern: single plugged @ uke 1}
{pattern: intro/verse @ uke 2}
{pattern: *bass pause @ bajo}
Un lu[Am]gar para es[C]tar y vi[G]vir lo que se he[Am]reda.
Una can[Am]ción sin condi[C]ción para so[G]nar lo que noes [Am]queda.
{pattern: doube plugged @ uke 1}
{pattern: verse @ bajo}
Hoy puedo [Am]ver lo que yo [C]fui. De donde [G]soy, de donde [Am]vengo.
No es prote[Am]star no es una [C]guerra, es lo que [G]soy y lo que {pattern: single plugged @ uke 1}[Am]tengo.
{end_of_verse}

{start_of_chorus}
{pattern: chorus @ uke 1}
{pattern: chorus @ uke 2}
{pattern: chorus @ bajo}
Hay cosas en la [Am]vida que no se pueden cam[C]biar, intentos de orde[G]nar a la natura[Am]leza.
Pero yo prefiero es[Am]tar en un lugar  donde se [C]da un ritmo natu[G]ral, chaótica belle[Am]za.

Uh oh [Am]oh_, uh oh [C]oh_, oh [G]oh_, uh oh [Am]oh_, uh oh
[Am]oh_, uh oh [C]oh_, oh [G]oh_, uh oh {pattern: *single @ uke 1}{pattern: *single @ uke 2}{pattern: *single @ bajo}[Am]oh_.
{end_of_chorus}
`.trim();

test("parses Chaotica Belleza and converts back to string", () => {
  const song = Song.fromTokens(tokenize(CHAOTICA_BELLEZA));
  expect(song.tokenize().toString().trim()).toEqual(CHAOTICA_BELLEZA);
});

test("converts song to SongData", () => {
  const song = Song.fromTokens(tokenize(CHAOTICA_BELLEZA));
  expect(song.toSongData("id-123", "owner", CHAOTICA_BELLEZA)).toEqual({
    artist: "Esteman",
    chordPro: CHAOTICA_BELLEZA,
    deployed: false,
    id: "id-123",
    ownerId: "owner",
    sorttitle: "",
    title: "Caótica Belleza",
  });
});

test("gets bars for song", () => {
  const song = Song.fromTokens(tokenize(CHAOTICA_BELLEZA));
  expect(song.bars.length).toBe(40);
  expect(song.barsLength).toBe(40);
});

test("gets used patterns for song", () => {
  const song = Song.fromTokens(tokenize(CHAOTICA_BELLEZA));
  expect(song.usedPatterns(0).size).toBe(4);
  expect(song.usedPatterns(1).size).toBe(4);
  expect(song.usedPatterns(2).size).toBe(4);
});

test("gets used chords for song", () => {
  const song = Song.fromTokens(tokenize(CHAOTICA_BELLEZA));
  expect([...song.usedChords(0)]).toEqual(["Am", "C", "G"]);
});
