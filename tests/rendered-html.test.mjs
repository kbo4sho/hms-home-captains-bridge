import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the captain's bridge", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /H\.M\.S\. Home — Captain’s Bridge/i);
  assert.match(html, /H\.M\.S\. HOME/);
  assert.match(html, /THE GREAT INDOOR SEA/);
  assert.match(html, /CAST OFF/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships the complete voyage catalog and recovery controls", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const destinations = source.slice(source.indexOf("const destinations"), source.indexOf("const voyageEvents"));
  const events = source.slice(source.indexOf("const voyageEvents"), source.indexOf("const clamp"));

  assert.equal((destinations.match(/\n    id: /g) ?? []).length, 6);
  assert.equal((events.match(/\n    id: /g) ?? []).length, 12);
  assert.match(source, /localStorage\.setItem/);
  assert.match(source, /Mute ship sounds/);
  assert.match(source, /NEW VOYAGE/);
  assert.match(source, /SHIP’S HORN/);
  assert.match(source, /ENGINE TELEGRAPH/);
});

test("includes install and social-preview assets", async () => {
  await Promise.all([
    access(new URL("../public/manifest.webmanifest", import.meta.url)),
    access(new URL("../public/favicon.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
});
