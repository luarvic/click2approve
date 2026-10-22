import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const uiRoot = fileURLToPath(new URL("../../", import.meta.url));
const image = "click2approve-ui:nginx-smoke";
const docker = (...args) => execFileSync("docker", args, { cwd: uiRoot, encoding: "utf8" }).trim();

execFileSync("docker", ["build", "--build-arg", "ENV=production", "-t", image, "."], {
  cwd: uiRoot,
  stdio: "inherit",
});

const container = docker("run", "--rm", "-d", "-p", "127.0.0.1::3333", image);
try {
  console.log(docker("exec", container, "nginx", "-t"));
  const port = docker("port", container, "3333/tcp").split(":").at(-1);
  const origin = `http://127.0.0.1:${port}`;
  const request = (path, options = {}) =>
    fetch(`${origin}${path}`, {
      redirect: "manual",
      ...options,
      headers: { Host: "click2approve.com", "X-Forwarded-Proto": "https", ...options.headers },
    });

  function checkHeaders(response, cache = "no-cache") {
    assert.equal(response.headers.get("cache-control"), cache);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
    assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
    assert.equal(response.headers.get("server"), "nginx");
  }

  for (const path of ["/app", "/docs", "/docs/getting-started"]) {
    const response = await request(`${path}?source=smoke`);
    assert.equal(response.status, 301, path);
    assert.equal(response.headers.get("location"), `${path}/?source=smoke`);
    checkHeaders(response);
    await response.text();
  }

  for (const path of ["/", "/docs/", "/docs/getting-started/", "/app/"]) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    checkHeaders(response);
    assert.match(await response.text(), /<!doctype html>/i);
  }

  const shell = await (await request("/app/index.html")).text();
  const deepLink = await request("/app/unknown-route?source=smoke");
  assert.equal(deepLink.status, 200);
  checkHeaders(deepLink);
  assert.equal(await deepLink.text(), shell);

  for (const path of ["/asda", "/docs/missing-page", "/404.html", "/app/assets/missing.js"]) {
    const response = await request(path);
    assert.equal(response.status, 404, path);
    checkHeaders(response);
    assert.match(await response.text(), /404 - Not found/);
  }

  const assetPaths = [...shell.matchAll(/(?:src|href)="(\/app\/assets\/[^"?#]+\.(?:js|css))"/g)].map(
    (match) => match[1],
  );
  assert.ok(
    assetPaths.some((path) => path.endsWith(".js")),
    "App script must be fingerprinted",
  );
  assert.ok(
    assetPaths.some((path) => path.endsWith(".css")),
    "App stylesheet must be fingerprinted",
  );
  for (const path of assetPaths) {
    const response = await request(path, { headers: { "Accept-Encoding": "gzip" } });
    assert.equal(response.status, 200, path);
    checkHeaders(response, "public, max-age=31536000, immutable");
    assert.match(response.headers.get("content-type"), /(?:javascript|text\/css)/);
    const body = await response.text();
    assert.ok(body.length > 0);
    if (Buffer.byteLength(body) >= 1024) {
      assert.equal(response.headers.get("content-encoding"), "gzip", path);
      assert.match(response.headers.get("vary"), /Accept-Encoding/i);
    }
  }

  const asset = await request(assetPaths[0], { headers: { "Accept-Encoding": "identity" } });
  const etag = asset.headers.get("etag");
  assert.ok(etag);
  await asset.text();
  const unchanged = await request(assetPaths[0], {
    headers: { "If-None-Match": etag, "Accept-Encoding": "identity" },
  });
  assert.equal(unchanged.status, 304);
  checkHeaders(unchanged, "public, max-age=31536000, immutable");

  console.log("Nginx smoke checks passed: redirects, routes, 404s, caching, gzip, and security headers.");
} finally {
  docker("stop", container);
}
