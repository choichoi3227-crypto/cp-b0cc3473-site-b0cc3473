/**
 * CloudPress WordPress 미러링 Worker v13
 * GitHub: choichoi3227-crypto/cp-b0cc3473-site-b0cc3473
 *
 * 역할: PHP Runner Service Binding으로 WordPress 동적 처리
 *       정적 자산은 GitHub 레포 wordpress/ 경로에서 미러링
 *       폴백: _cache/ 정적 HTML (GitHub Actions 생성)
 */

const SITE_ID      = "b0cc3473-1349-401f-9722-4d9460b6eeb2";
const GH_OWNER     = "choichoi3227-crypto";
const GH_REPO      = "cp-b0cc3473-site-b0cc3473";
const GH_BRANCH    = "main";
const GH_PAGES_URL = "https://choichoi3227-crypto.github.io/cp-b0cc3473-site-b0cc3473";

const ghOwner  = (e) => e.GH_OWNER  || GH_OWNER;
const ghRepo   = (e) => e.GH_REPO   || GH_REPO;
const ghToken  = (e) => e.GITHUB_TOKEN || "";
const ghPages  = (e) => e.GH_PAGES_URL || GH_PAGES_URL || "";

const STATIC_EXT = /\\.(css|js|jpg|jpeg|png|gif|webp|avif|svg|ico|woff2?|ttf|eot|otf|map|txt|xml|json|pdf|zip|mp4|mp3|ogg|wav|webm)$/i;
const SEC = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

function mime(p) {
  const ext = (p.split(".").pop() || "").toLowerCase();
  return ({
    css:"text/css", js:"application/javascript",
    json:"application/json", html:"text/html;charset=utf-8", xml:"application/xml",
    svg:"image/svg+xml", png:"image/png", jpg:"image/jpeg", jpeg:"image/jpeg",
    gif:"image/gif", webp:"image/webp", avif:"image/avif", ico:"image/x-icon",
    woff:"font/woff", woff2:"font/woff2", ttf:"font/ttf", otf:"font/otf",
    pdf:"application/pdf", mp4:"video/mp4", mp3:"audio/mpeg", txt:"text/plain",
  })[ext] || "application/octet-stream";
}

const kvGetBuf = async (e,k)       => { try { return await e.CACHE?.get(k,"arrayBuffer"); } catch { return null; } };
const kvPut    = async (e,k,v,t=3600) => { try { await e.CACHE?.put(k,v,{expirationTtl:t}); } catch {} };

async function ghRaw(env, filePath) {
  const o = ghOwner(env), r = ghRepo(env), t = ghToken(env);
  if (!o || !r) return null;
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${o}/${r}/${GH_BRANCH}/${filePath}`,
      { headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}), "User-Agent": "CloudPress/13" },
        cf: { cacheEverything: true, cacheTtl: 300 } }
    );
    return res.ok ? res : null;
  } catch { return null; }
}

async function ghPagesFallback(env, url) {
  const base = ghPages(env);
  if (!base) return null;
  try {
    const r = await fetch(base + url.pathname + url.search);
    return r.ok ? r : null;
  } catch { return null; }
}

export default {
  async fetch(req, env, ctx) {
    const url  = new URL(req.url);
    const path = url.pathname;
    const cacheKey = `wp-mirror:${ghOwner(env)}/${ghRepo(env)}:${path}${url.search}`;

    // 1차: PHP Runner Service Binding (동적 WordPress 처리)
    if (env.PHP_RUNNER) {
      try {
        const phpRes = await env.PHP_RUNNER.fetch(req.clone());
        if (phpRes.ok || phpRes.status === 404) return phpRes;
      } catch {}
    }

    // 2차: KV 캐시 (정적 자산)
    if (req.method === "GET" && STATIC_EXT.test(path)) {
      const cached = await kvGetBuf(env, cacheKey);
      if (cached) return new Response(cached, { headers: { "Content-Type": mime(path), "Cache-Control": "public,max-age=86400", ...SEC } });
    }

    // 3차: GitHub 레포 wp-content 정적 자산 미러링
    if (STATIC_EXT.test(path) && path.startsWith("/wp-content/")) {
      const res = await ghRaw(env, path.slice(1));
      if (res) {
        const body = await res.arrayBuffer();
        ctx.waitUntil(kvPut(env, cacheKey, body, 86400));
        return new Response(body, { headers: { "Content-Type": mime(path), "Cache-Control": "public,max-age=86400", ...SEC } });
      }
    }

    // 4차: _cache/ 정적 HTML 폴백 (GitHub Actions 생성)
    let cachePath = "_cache" + path;
    if (cachePath.endsWith("/")) cachePath += "index.html";
    else if (!STATIC_EXT.test(path)) cachePath += "/index.html";
    let res = await ghRaw(env, cachePath);
    if (!res && !STATIC_EXT.test(path)) res = await ghRaw(env, "_cache" + path + ".html");

    // 5차: GitHub Pages 폴백
    if (!res) res = await ghPagesFallback(env, url);

    if (!res) return new Response("Not Found", { status: 404, headers: SEC });

    const ct   = res.headers.get("Content-Type") || mime(cachePath);
    const body = await res.arrayBuffer();
    if (req.method === "GET" && STATIC_EXT.test(path)) {
      ctx.waitUntil(kvPut(env, cacheKey, body, 86400));
    }
    return new Response(body, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": STATIC_EXT.test(path) ? "public,max-age=86400" : "public,max-age=60,s-maxage=300",
        ...SEC,
      },
    });
  },
};