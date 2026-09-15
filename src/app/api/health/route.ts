export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PaperLoom plugin'inin "bu port bizim uygulamamız mı?" sorusunu cevaplayan uç.
 *
 * `paperloom-agent.mjs deliver` teslimattan önce buraya bakar: cevap gelirse zaten
 * ayakta olan uygulamayı kullanır, gelmezse kendi dev sunucusunu başlatır.
 * Bu yüzden gövde SABİT kalmalı — `app` alanı bir protokol imzasıdır, süsleme
 * değil. Hiçbir yerel durum, yol veya yapılandırma sızdırmaz.
 */
export function GET() {
  return Response.json({ ok: true, app: "paperloom" }, {
    headers: { "Cache-Control": "no-store" },
  });
}
