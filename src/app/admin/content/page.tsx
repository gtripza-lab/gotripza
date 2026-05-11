import { BUDGET_PAGES, COMPARISON_PAGES, DESTINATION_SLUGS } from "@/lib/seo-destinations";
import { ROUTE_SLUGS } from "@/lib/route-pairs";

export const metadata = { title: "المحتوى" };

const contentFiles = [
  {
    type: "المدونة",
    path: "/src/content/blog/",
    notes: "مقالات MDX ثابتة بالعربية والإنجليزية",
  },
  {
    type: "ترجمة الصفحة الرئيسية",
    path: "/src/i18n/dictionaries/",
    notes: "قواميس JSON للعربية والإنجليزية",
  },
  {
    type: "تعليمات ريا",
    path: "/src/lib/ai/prompts/raya-system.ts",
    notes: "شخصية ريا وقواعد الرد",
  },
  {
    type: "مخططات الذكاء",
    path: "/src/lib/ai/schemas/",
    notes: "فهم النية ومخرجات الذكاء",
  },
] as const;

const seoInventory = [
  { label: "صفحات الوجهات", count: DESTINATION_SLUGS.length * 2, note: "أدلة وجهات بالعربية والإنجليزية" },
  { label: "صفحات جاهزية الفنادق", count: DESTINATION_SLUGS.length * 2, note: "دليل سكن مؤقت إلى أن يكتمل ربط الفنادق" },
  { label: "صفحات المواسم", count: DESTINATION_SLUGS.length * 2, note: "أفضل وقت لزيارة كل وجهة" },
  { label: "صفحات التأشيرات", count: DESTINATION_SLUGS.length * 2, note: "محتوى نية التأشيرة والسفر" },
  { label: "صفحات الميزانية", count: BUDGET_PAGES.length * 2, note: "تكلفة الرحلة وتخطيط الميزانية" },
  { label: "صفحات المقارنة", count: COMPARISON_PAGES.length * 2, note: "مقارنة وجهة مقابل وجهة" },
  { label: "صفحات خطوط الطيران", count: ROUTE_SLUGS.length * 2, note: "صفحات بحث عالية النية للرحلات" },
];

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-[#08080d] px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-tight">المحتوى والوجهات</h1>
        <p className="text-white/40 text-sm mt-1">مصادر المحتوى، ملفات SEO، وحالة صفحات السفر</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {seoInventory.slice(0, 4).map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <p className="text-xs text-white/35">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.count.toLocaleString()}</p>
            <p className="mt-1 text-xs leading-5 text-white/35">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Content Sources Card */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
          مصادر المحتوى
        </h2>

        <div className="space-y-4">
          {/* Destination descriptions */}
          <div className="flex gap-4 items-start">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white/80">وصف الوجهات</p>
              <p className="text-sm text-white/45 mt-0.5">
                يتم توليده عبر OpenAI{" "}
                <code className="text-white/60 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">
                  gpt-4o-mini
                </code>
                ويتم حفظه في Supabase داخل جدول{" "}
                <code className="text-white/60 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">
                  destination_intel
                </code>{" "}
                table.
              </p>
            </div>
          </div>

          {/* Blog posts */}
          <div className="flex gap-4 items-start">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-purple-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white/80">مقالات المدونة</p>
              <p className="text-sm text-white/45 mt-0.5">
                ملفات MDX ثابتة في{" "}
                <code className="text-white/60 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">
                  /src/content/blog/
                </code>
              </p>
            </div>
          </div>

          {/* Homepage copy */}
          <div className="flex gap-4 items-start">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white/80">نصوص الصفحة الرئيسية</p>
              <p className="text-sm text-white/45 mt-0.5">
                تتم ترجمتها عبر{" "}
                <code className="text-white/60 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">
                  /src/i18n/dictionaries/[locale].json
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
            جرد صفحات SEO
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">المجموعة</th>
                <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">الصفحات</th>
                <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">الغرض</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {seoInventory.map((item) => (
                <tr key={item.label} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3.5 text-white/70 font-medium">{item.label}</td>
                  <td className="px-6 py-3.5 text-right tabular-nums text-white/60">{item.count.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-white/40 text-xs">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Content Files Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
            ملفات المحتوى المهمة
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                  النوع
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                  المسار
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                  ملاحظات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {contentFiles.map((file) => (
                <tr key={file.path} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3.5 text-white/70 font-medium whitespace-nowrap">
                    {file.type}
                  </td>
                  <td className="px-6 py-3.5">
                    <code className="text-blue-400/80 text-xs bg-blue-500/[0.08] px-2 py-1 rounded font-mono">
                      {file.path}
                    </code>
                  </td>
                  <td className="px-6 py-3.5 text-white/40 text-xs">
                    {file.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
