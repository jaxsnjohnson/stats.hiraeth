const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function loadStateHelpers() {
  const html = fs.readFileSync(
    path.resolve(__dirname, "..", "index.html"),
    "utf8"
  );
  const block = html.match(
    /const STATIC_FIELDS = \[[\s\S]*?function getCurrentModeFlags\(\) \{[\s\S]*?\n      \}/
  );
  assert.ok(block, "Could not locate state helper block in index.html");
  return new Function(
    `${block[0]}; return {
      normalizeState,
      hasContentState,
      encodeReadableParams,
      decodeReadableParams,
      serializeState,
      deserializeState,
      decodeStateFromUrlSearchParams,
      buildSnapshotParams,
      selectInitialData,
      readModeFlags,
      CONTENT_FIELDS,
      DYNAMIC_FIELDS,
    };`
  )();
}

const h = loadStateHelpers();

test("serialize/deserialize round-trip preserves canonical values", () => {
  const input = {
    name: "Adult Red Dragon",
    ac: "19",
    hp: "256",
    actions: '[{"name":"Bite","text":"(2d10+8)"}]',
    traits: "[]",
  };
  const payload = h.serializeState(input);
  const out = h.deserializeState(payload);
  assert.equal(out.name, "Adult Red Dragon");
  assert.equal(out.ac, "19");
  assert.equal(out.actions, '[{"name":"Bite","text":"(2d10+8)"}]');
  assert.equal(out.traits, "[]");
  assert.equal(typeof out.hp, "string");
});

test("decode precedence prefers valid snapshot payload over readable params", () => {
  const payload = h.serializeState({ name: "From Snapshot", ac: "17" });
  const params = new URLSearchParams();
  params.set("s", payload);
  params.set("v", "2");
  params.set("name", "From Readable");
  const decoded = h.decodeStateFromUrlSearchParams(params);
  assert.equal(decoded.source, "snapshot");
  assert.equal(decoded.content.name, "From Snapshot");
});

test("invalid snapshot payload falls back to readable params", () => {
  const params = new URLSearchParams();
  params.set("s", "not-valid-base64");
  params.set("name", "Readable Name");
  params.set("ac", "15");
  const decoded = h.decodeStateFromUrlSearchParams(params);
  assert.equal(decoded.source, "readable");
  assert.equal(decoded.content.name, "Readable Name");
  assert.equal(decoded.content.ac, "15");
});

test("legacy readable decoding remains compatible", () => {
  const params = new URLSearchParams();
  params.set("name", "Goblin");
  params.set("hp", "7 (2d6)");
  params.set("actions", '[{"name":"Scimitar","text":"+4 to hit"}]');

  const decoded = h.decodeReadableParams(params);
  assert.equal(decoded.name, "Goblin");
  assert.equal(decoded.hp, "7 (2d6)");
  assert.equal(decoded.actions, '[{"name":"Scimitar","text":"+4 to hit"}]');
});

test("readable encoder omits empty fields and empty dynamic arrays", () => {
  const params = h.encodeReadableParams({
    name: "",
    ac: "14",
    traits: "[]",
    actions: '[{"name":"Bite","text":"x"}]',
  });
  assert.equal(params.has("name"), false);
  assert.equal(params.has("traits"), false);
  assert.equal(params.get("ac"), "14");
  assert.equal(params.get("actions"), '[{"name":"Bite","text":"x"}]');
});

test("URL state wins over draft in initial data selection", () => {
  const example = h.normalizeState({ name: "Example" });
  const draft = h.normalizeState({ name: "Draft" });
  const decoded = {
    hasContent: true,
    content: h.normalizeState({ name: "URL" }),
  };
  const selected = h.selectInitialData({
    demo: false,
    decoded,
    draft,
    example,
  });
  assert.equal(selected.source, "url");
  assert.equal(selected.data.name, "URL");
});

test("draft is selected when URL has no content", () => {
  const example = h.normalizeState({ name: "Example" });
  const draft = h.normalizeState({ name: "Draft" });
  const decoded = {
    hasContent: false,
    content: h.normalizeState({}),
  };
  const selected = h.selectInitialData({
    demo: false,
    decoded,
    draft,
    example,
  });
  assert.equal(selected.source, "draft");
  assert.equal(selected.data.name, "Draft");
});

test("snapshot params include v/s and preserve view/embed flags", () => {
  const params = h.buildSnapshotParams(
    h.normalizeState({ name: "Hydra" }),
    { view: true, embed: true, debug: false }
  );
  assert.equal(params.get("v"), "2");
  assert.equal(typeof params.get("s"), "string");
  assert.equal(params.get("view"), "1");
  assert.equal(params.get("embed"), "1");
  assert.equal(params.has("debug"), false);

  const flags = h.readModeFlags(params);
  assert.equal(flags.view, true);
  assert.equal(flags.embed, true);
});

test("deserialize returns null for invalid payloads", () => {
  assert.equal(h.deserializeState(""), null);
  assert.equal(h.deserializeState("%%%"), null);
});
