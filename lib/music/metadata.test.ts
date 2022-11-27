import { SongMetadata, PartMetadata } from "./metadata";
import { Token, TokenType } from "./token";
import { tokenize } from "./tokenizer";

test("parses minimal metadata and converts back to string", () => {
  const metadataStr = [
    "{title: Caótica Belleza}",
    "{time: 4/4}",
    "{tempo: 100}",
    "",
  ].join("\n");
  const metadata = SongMetadata.fromTokens(tokenize(metadataStr));
  const env = new Token(
    TokenType.StartEnv,
    "song",
    /*value=*/ undefined,
    metadata.tokenize()
  );
  expect(env.toString()).toEqual(metadataStr);
});

test("parses full metadata and converts back to string", () => {
  const metadataStr = [
    "{title: Ein Kompliment}",
    "{sorttitle: Kompliment}",
    "{subtitle: really great version}",
    "{artist: Sportfreunde Stiller}",
    "{composer: Peter Brugger}",
    "{lyricist: Rüdiger Linhof}",
    "{copyright: don't know}",
    "{album: Die gute Seite}",
    "{year: 2002}",
    "{key: D}",
    "{time: 4/4}",
    "{tempo: 100}",
    "{capo: 2}",
    "",
  ].join("\n");
  const metadata = SongMetadata.fromTokens(tokenize(metadataStr));
  const env = new Token(
    TokenType.StartEnv,
    "song",
    /*value=*/ undefined,
    metadata.tokenize()
  );
  expect(env.toString()).toEqual(metadataStr);
});

test("parses part metadatas and converts back to string", () => {
  const metadataStr = [
    "{title: Ein Kompliment}",
    "{key: D}",
    "{time: 4/4}",
    "{tempo: 100}",
    "",
  ].join("\n");
  const metadata = SongMetadata.fromTokens(tokenize(metadataStr));
  const partFromParent = PartMetadata.fromTokens(tokenize(""), metadata);

  expect(partFromParent.tokenize(metadata)).toEqual([]);

  const partMetadataStr = ["{key: Bm}", "{time: 3/4}", "{tempo: 120}", ""].join(
    "\n"
  );
  const partFromTokens = PartMetadata.fromTokens(
    tokenize(partMetadataStr),
    metadata
  );

  const env = new Token(
    TokenType.StartEnv,
    "song",
    /*value=*/ undefined,
    partFromTokens.tokenize(metadata)
  );
  expect(env.toString()).toEqual(partMetadataStr);
});
