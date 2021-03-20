# Design

## Implementation Plan

### MVP features

- Specify an internal datastructure to represent a song with lyrics, chords,
  strumming patterns and metadata.
- Display the song data on a website using React components. This will look
  similar to
  [other guitar tab pages out there](https://tabs.ultimate-guitar.com/tab/2446863).
- Decide on CSS framework (e.g., [Bulma](https://bulma.io))
- Read and display a single

### V1 features

- Support editing the song in an editor view.
- Support uploading and downloading a song files. For now, only supports one
  song at a time.
- Have a play along function which works like a Karaoke machine, showing which
  chord to play and the current lyrics.
  Allows to change the speed for playback.
- Supports a metronome to give the beat using some midi library.

### Future features

- Display the chords for different instruments (ukulele, guitar).
  Requires a chord database for each instrument. In the song, chords can be
  overwritten to play other variants.
- Store all songs in a cloud storage. Ideally, each users can create an account
  and can edit and share songs. Musicians can colaborate on songs.
- Allow play along with music generated from midi instead of just the metronome
  option.
- Support several instruments per song, at least percursion and plugged
  strings.
  Here we could also support tabs for guitar and other plugged strings.

## Song text format

We piggy-back on [ChordPro](https://www.chordpro.org/chordpro/index.html).
Initially, we support the meta-data

```
{title: Marinero Wawani}
{artist: Monsieur Periné}

{key: C}
{time: 4/4}
{tempo: 100}
```

and environment directives

- `comment`
- `start_of_verse`/`end_of_verse`
- `start_of_chorus`/`end_of_chorus`
- `start_of_bridge`/`end_of_bridge`

Additionally, we add

- `start_of_instrumental`/`end_of_instrumental`

We should also support comments, starting with `#` but be careful that `[F#]` is
a chord and not starting a comment.

### Modification to chords

Since we need to know how long a chord is being played, a chord has to be listed
once per measure. We introduce the following augmentation:

- `[%]` repeats last measure. `[%%]`, `[%%%]`, ... repeat the last n measures,
  which is useful for instrumental parts.
- `[C..]` means repated chord for two beats instead of one full measure.
  We support `.` as one beat and `,` as a half beat.

For example,

```
{start_of_instrumental}
[C][F..][G..][%%]
[%%%%]
{end_of_instrumental}
```

translates to

```
| C . . . | F . G . | C . . . | F . G . |
| C . . . | F . G . | C . . . | F . G . |
```

### Strumming patterns

- `define_pattern`/`define_pattern*` defines a new pattern:
  `{define_pattern: <name> |<pattern>|}`. The pattern is displayed at the point
  of definition unless the asterisc version is used.
- `pattern` switches the active pattern to either a named pattern or a pattern
  introduced at this point: `{pattern: <name>}` or `{pattern: |<pattern>|}`
- The first introduced pattern, using `define_pattern[*]` is the active pattern
  until `pattern is called`.

```
{comment: Strumming pattern}
{define_pattern: BasePattern |Dux.uux.|}

{start_of_chorus}
Porque en el [F]mar quiero vi[G]vir, enveje[C]cerme, perderme y mo[Am]rir
ser un re[F]cuerdo que se a[G]leja {pattern: |D.......|........|}[G][%]
como el eco de mi {pattern: BasePattern}[C]voz. [F..][G..][%%]
[%%%%]
{end_of_chorus}
```

Supported symbols in a strumming pattern (maybe not all in the beginning):

- `|` start/end of measure
- `.` beat without strum - pause
- `d` down stroke
- `u` down stroke
- `D` accented down stroke
- `U` accented down stroke
- `x` percursion strum
- (`X` [chuck strum](https://ukulelego.com/tips/chucking-chunking/))
- (`a` [arpeggio](https://en.wikipedia.org/wiki/Arpeggio))

## Internal data representation

> TODO

### Parsing of song data

> TODO
