const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function loadParseLinks() {
  const html = fs.readFileSync(
    path.resolve(__dirname, "..", "index.html"),
    "utf8"
  );
  const match = html.match(/function parseLinks\(str\) \{[\s\S]*?\n      \}/);
  assert.ok(match, "Could not locate parseLinks in index.html");
  return new Function(`${match[0]}; return parseLinks;`)();
}

const parseLinks = loadParseLinks();

test("preserves href values while still wrapping standalone dice", () => {
  const out = parseLinks(
    "[Spell](https://example.com/spells/2d6+1) does (2d6+1) fire."
  );
  assert.match(out, /href="https:\/\/example\.com\/spells\/2d6\+1"/);
  assert.doesNotMatch(out, /href="[^"]*<span class="dice-roll"/);
  assert.match(
    out,
    /<span class="dice-roll" data-dice="2d6\+1">\((?:2d6\+1)\)<\/span>/
  );
});

test("wraps normal dice notation outside links", () => {
  const out = parseLinks("Hit: 13 (2d6 + 6) slashing damage.");
  assert.match(
    out,
    /<span class="dice-roll" data-dice="2d6\+6">\((?:2d6 \+ 6)\)<\/span>/
  );
});

test("keeps plain links unchanged when no dice text exists", () => {
  const out = parseLinks("[Potion](https://example.com/potion)");
  assert.match(out, /^<a href="https:\/\/example\.com\/potion"/);
  assert.doesNotMatch(out, /dice-roll/);
});
