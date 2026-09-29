/**
 * VIBE Block Library — server-rendered React implementations for every
 * COMPONENT_REGISTRY key. Tailwind + existing design language (slate/sky).
 *
 * Accessibility: semantic elements, headings, alt text, aria labels.
 * Safety: rich text is reduced to escaped paragraphs — no raw HTML, no JS.
 */

import React from 'react';
import Link from 'next/link';
import {
  MapPin, Star, Calendar, Clock, Wallet, Lightbulb, ShieldAlert, CloudSun,
  Users, ArrowRight, Activity, AlertTriangle, CheckCircle2, Sparkles, Images,
} from 'lucide-react';
import type { RenderNode } from '@/lib/vibe/runtime';
import { safeRichSegments } from '@/lib/vibe/pure';

export { safeRichSegments };

// ---------- helpers ----------

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const num = (v: unknown): number => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const asArr = (v: unknown): any[] => (Array.isArray(v) ? v : v == null ? [] : [v]);
const money = (v: unknown): string => `₹${num(v).toLocaleString('en-IN')}`;

function breakpointClass(node: RenderNode): string {
  const mobileHidden = node.responsive?.find(r => r.breakpoint === 'mobile' && r.hidden);
  const tabletHidden = node.responsive?.find(r => r.breakpoint === 'tablet' && r.hidden);
  return [mobileHidden ? 'hidden' : '', tabletHidden ? 'max-md:hidden' : ''].filter(Boolean).join(' ');
}

const cardLink = 'group block rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all';

// ---------- generic blocks ----------

function Hero(props: Record<string, unknown>) {
  const title = str(props.title) || 'Untitled';
  const subtitle = str(props.subtitle);
  const media = str(props.mediaUrl);
  const variant = str(props.variant) || 'FULLSCREEN';
  const tall = variant === 'FULLSCREEN' || variant === 'IMMERSIVE' || variant === 'CINEMATIC';
  return (
    <section className={`relative w-full ${tall ? 'min-h-[420px] md:min-h-[520px]' : 'min-h-[280px]'} flex items-end overflow-hidden rounded-none`}>
      {media ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-sky-950 to-indigo-950" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 w-full">
        {props.eyebrow ? <span className="inline-block text-[11px] font-black tracking-widest text-sky-300 uppercase mb-3">{str(props.eyebrow)}</span> : null}
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-3xl">{title}</h1>
        {subtitle ? <p className="mt-3 text-slate-200 text-base md:text-lg max-w-2xl">{subtitle}</p> : null}
        {props.ctaLabel ? (
          <Link href={str(props.ctaTarget) || '#'} className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm transition shadow-lg">
            {str(props.ctaLabel)} <ArrowRight className="w-4 h-4" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function Heading(props: Record<string, unknown>) {
  const level = ['h1', 'h2', 'h3', 'h4'].includes(str(props.level)) ? str(props.level) : 'h2';
  const Tag = level as 'h2';
  const cls = { h1: 'text-3xl md:text-4xl', h2: 'text-2xl md:text-3xl', h3: 'text-xl', h4: 'text-lg' }[level as 'h1' | 'h2' | 'h3' | 'h4'] ?? 'text-2xl';
  return (
    <div className="py-2">
      {props.eyebrow ? <div className="text-[11px] font-black tracking-widest text-sky-600 uppercase mb-1.5">{str(props.eyebrow)}</div> : null}
      <Tag className={`${cls} font-extrabold text-slate-900 tracking-tight`}>{str(props.text)}</Tag>
    </div>
  );
}

function RichText(props: Record<string, unknown>) {
  const paras = safeRichSegments(props.html);
  return (
    <div className="space-y-3 text-slate-600 leading-relaxed max-w-3xl py-2">
      {paras.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

function ImageBlock(props: Record<string, unknown>) {
  return (
    <figure className="py-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={str(props.src)} alt={str(props.alt)} className="rounded-2xl w-full object-cover" loading="lazy" />
      {props.caption ? <figcaption className="mt-2 text-xs text-slate-500">{str(props.caption)}</figcaption> : null}
    </figure>
  );
}

function Button(props: Record<string, unknown>, node: RenderNode) {
  const href = str(node.actions?.[0]?.type === 'NAVIGATE' ? node.actions[0].target : props.target ?? '#');
  const variant = str(props.variant);
  const cls = variant === 'primary'
    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow'
    : variant === 'ghost'
      ? 'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300'
      : 'bg-slate-900 hover:bg-slate-800 text-white';
  return (
    <Link href={href} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${cls}`}>
      {str(props.label)} <ArrowRight className="w-4 h-4" />
    </Link>
  );
}

function Badge(props: Record<string, unknown>) {
  const tone = str(props.tone) || 'sky';
  const tones: Record<string, string> = {
    sky: 'bg-sky-100 text-sky-700 border-sky-200', emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200', rose: 'bg-rose-100 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return <span className={`inline-block px-2.5 py-1 rounded-lg border text-[10px] font-black tracking-wide uppercase ${tones[tone] ?? tones.sky}`}>{str(props.text)}</span>;
}

function Grid(props: Record<string, unknown>, node: RenderNode) {
  const cols = Math.min(Math.max(num(props.columns) || 3, 1), 4);
  const gap = { sm: 'gap-3', md: 'gap-5', lg: 'gap-8' }[str(props.gap) as 'sm' | 'md' | 'lg'] ?? 'gap-5';
  const colCls = ({ 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' } as Record<number, string>)[cols] ?? 'lg:grid-cols-3';
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${colCls} ${gap} py-3`}>
      {node.children.map(c => <BlockRenderer key={c.id} node={c} />)}
    </div>
  );
}

function Divider() {
  return <hr className="my-6 border-slate-200" aria-hidden="true" />;
}

function Accordion(props: Record<string, unknown>) {
  const items = asArr(props.items);
  return (
    <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white">
      {items.map((it: any, i: number) => (
        <details key={i} className="group px-5 py-4">
          <summary className="cursor-pointer font-bold text-slate-800 text-sm list-none flex justify-between items-center">
            {str(it?.question ?? it?.title)} <span aria-hidden className="text-sky-600 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
          </summary>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{str(it?.answer)}</p>
        </details>
      ))}
    </div>
  );
}

// ---------- travel blocks ----------

function DestinationCard(props: Record<string, unknown>) {
  const d = (props.destination ?? {}) as any;
  return (
    <Link href={`/destinations/${str(d.slug)}`} className={cardLink}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={str(d.heroImageUrl) || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'} alt={str(d.name)} className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5 text-sky-600" /> {str(d.country?.name ?? d.country)}</div>
        <h3 className="mt-1 font-extrabold text-slate-900">{str(d.name)}</h3>
        {props.showPrice !== false && d.priceFrom ? <div className="mt-1 text-sm font-bold text-sky-700">from {money(d.priceFrom)}</div> : null}
      </div>
    </Link>
  );
}

function PlaceCard(props: Record<string, unknown>) {
  const p = (props.place ?? {}) as any;
  return (
    <Link href={`/places/${str(p.slug)}`} className={cardLink}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={str(p.coverImage) || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'} alt={str(p.name)} className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      <div className="p-4">
        <div className="text-[10px] font-black uppercase tracking-wider text-sky-600">{str(p.category)}</div>
        <h3 className="mt-0.5 font-extrabold text-slate-900">{str(p.name)}</h3>
        {p.bestTime ? <div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Calendar className="w-3.5 h-3.5" /> {str(p.bestTime)}</div> : null}
      </div>
    </Link>
  );
}

function JourneyCard(props: Record<string, unknown>) {
  const j = (props.journey ?? {}) as any;
  return (
    <Link href={`/journeys/${str(j.slug)}`} className={cardLink}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={str(j.coverImage) || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'} alt={str(j.title)} className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">{str(j.journeyType)}</span>
          {props.showDays !== false && j.durationDays ? <span className="text-xs text-slate-500">{num(j.durationDays)} days</span> : null}
        </div>
        <h3 className="mt-1 font-extrabold text-slate-900">{str(j.title)}</h3>
        {j.highlights?.length ? <p className="mt-1 text-xs text-slate-500 line-clamp-2">{asArr(j.highlights).slice(0, 3).join(' • ')}</p> : null}
      </div>
    </Link>
  );
}

function DiaryCard(props: Record<string, unknown>) {
  const d = (props.diary ?? {}) as any;
  return (
    <Link href={`/diaries/${str(d.slug)}`} className={cardLink}>
      <div className="p-5 border-l-4 border-sky-500">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Traveler diary {d.place?.name ? `• ${str(d.place.name)}` : ''}</div>
        <h3 className="mt-1 font-extrabold text-slate-900 leading-snug">{str(d.title)}</h3>
        <p className="mt-2 text-sm text-slate-600 line-clamp-3">{safeRichSegments(d.story)[0] ?? ''}</p>
        {d.author?.fullName ? <div className="mt-3 text-xs font-bold text-slate-500">— {str(d.author.fullName)}</div> : null}
      </div>
    </Link>
  );
}

function ProductCard(props: Record<string, unknown>) {
  const p = (props.product ?? {}) as any;
  return (
    <div className={cardLink}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={str(p.heroImageUrl) || 'https://images.unsplash.com/photo-1611892440504-42a793e19fa9?w=800'} alt={str(p.title)} className="h-36 w-full object-cover" loading="lazy" />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-600">{str(p.category)}</span>
          {p.rating ? <span className="flex items-center gap-1 text-xs font-bold text-amber-600"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{num(p.rating).toFixed(1)}</span> : null}
        </div>
        <h3 className="mt-1 font-extrabold text-slate-900">{str(p.title)}</h3>
        <div className="mt-1 text-sm font-black text-slate-900">{money(p.basePrice)} <span className="text-xs font-medium text-slate-400">/ night</span></div>
      </div>
    </div>
  );
}

function JourneyTimeline(props: Record<string, unknown>) {
  const days = asArr(props.days);
  return (
    <ol className="relative border-l-2 border-sky-200 ml-3 space-y-6 py-3" aria-label="Day by day itinerary">
      {days.map((d: any) => (
        <li key={str(d.id ?? d.dayNumber)} className="ml-6">
          <span className="absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] font-black">{num(d.dayNumber)}</span>
          <div className="font-extrabold text-slate-900">{str(d.title)}</div>
          {d.description ? <p className="mt-1 text-sm text-slate-600 leading-relaxed">{str(d.description)}</p> : null}
          {(d.startLocation || d.endLocation) ? <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5" />{str(d.startLocation)}{d.endLocation ? ` → ${str(d.endLocation)}` : ''}</div> : null}
          {asArr(d.items).length > 0 ? (
            <ul className="mt-2 space-y-1">
              {asArr(d.items).map((it: any, i: number) => (
                <li key={i} className="text-xs text-slate-600 flex gap-2">
                  <span className="font-mono text-slate-400">{str(it.startTime ?? '—')}</span>
                  <span>{str(it.title)} <span className="text-slate-400">({str(it.type)})</span></span>
                </li>
              ))}
            </ul>
          ) : null}
          {d.estimatedCost ? <div className="mt-1.5 text-xs font-bold text-emerald-700 flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />{money(d.estimatedCost)}</div> : null}
        </li>
      ))}
    </ol>
  );
}

function RouteMap(props: Record<string, unknown>) {
  const points = asArr(props.points);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 my-2">
      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><MapPin className="w-4 h-4 text-sky-600" />{str(props.title) || 'Route'}</div>
      <ol className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600" aria-label="Route stops">
        {points.map((p: any, i: number) => (
          <li key={i} className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 font-bold text-sky-800 text-xs">{str(p.name ?? p.place?.name ?? p)}</span>
            {i < points.length - 1 ? <ArrowRight className="w-3.5 h-3.5 text-slate-300" aria-hidden /> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function TravelBudget(props: Record<string, unknown>) {
  const b = (props.budget ?? {}) as any;
  const rows: Array<[string, unknown]> = [
    ['Estimated per person', b.perPerson ?? b.min],
    ['Group estimate', b.couple ?? b.max],
    ['Includes', Array.isArray(b.includes) ? asArr(b.includes).join(', ') : b.notes],
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 my-2">
      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><Wallet className="w-4 h-4 text-emerald-600" />Budget</div>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.filter(([, v]) => v != null && v !== '').map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4"><dt className="text-slate-500">{k}</dt><dd className="font-bold text-slate-900 text-right">{typeof v === 'number' ? money(v) : str(v)}</dd></div>
        ))}
      </dl>
    </div>
  );
}

function TravelTip(props: Record<string, unknown>) {
  const icon = str(props.icon);
  const Icon = { lightbulb: Lightbulb, shield: ShieldAlert, cloud: CloudSun, wallet: Wallet }[icon] ?? Lightbulb;
  return (
    <aside className="flex gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 my-2">
      <Icon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
      <div>
        <div className="text-xs font-black uppercase tracking-wide text-amber-700">{str(props.title) || 'Travel tip'}</div>
        <p className="mt-1 text-sm text-amber-900 leading-relaxed">{str(props.body)}</p>
      </div>
    </aside>
  );
}

function TravelAdvisory(props: Record<string, unknown>) {
  const sev = str(props.severity) || 'INFO';
  const tone = sev === 'CRITICAL' ? 'bg-rose-50 border-rose-200 text-rose-900' : sev === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-sky-50 border-sky-200 text-sky-900';
  return (
    <div role="status" className={`flex gap-3 rounded-2xl border p-4 my-2 text-sm ${tone}`}>
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
      <span className="leading-relaxed">{str(props.text)}</span>
    </div>
  );
}

function WeatherStrip(props: Record<string, unknown>) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-100 border border-slate-200 p-4 my-2 text-sm">
      <CloudSun className="w-6 h-6 text-sky-600" aria-hidden />
      <div><span className="font-black text-slate-800">Best time:</span> <span className="text-slate-600">{str(props.bestTime) || 'Year-round'}</span></div>
      {props.seasonNotes ? <div className="text-slate-500">{str(props.seasonNotes)}</div> : null}
    </div>
  );
}

function Gallery(props: Record<string, unknown>) {
  const images = asArr(props.images).map(im => (typeof im === 'string' ? { url: im } : im)).filter(Boolean);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-3">
      {images.map((im: any, i: number) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={str(im.url ?? im.src)} alt={str(im.alt ?? im.caption ?? `Photo ${i + 1}`)} className="rounded-xl h-44 w-full object-cover" loading="lazy" />
      ))}
      {images.length === 0 ? <div className="flex items-center gap-2 text-sm text-slate-400"><Images className="w-4 h-4" />No photos yet</div> : null}
    </div>
  );
}

function ReviewList(props: Record<string, unknown>) {
  const reviews = asArr(props.reviews);
  return (
    <ul className="space-y-4 py-2">
      {reviews.map((r: any, i: number) => (
        <li key={i}>
          <blockquote className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 leading-relaxed">“{str(r.text ?? r.comment)}”</blockquote>
          <div className="mt-1.5 text-xs font-bold text-slate-500">— {str(r.author ?? r.name)} {r.rating ? `(${num(r.rating)}★)` : ''}</div>
        </li>
      ))}
    </ul>
  );
}

function Availability(props: Record<string, unknown>) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 my-2 text-sm text-slate-600">
      Live availability for <span className="font-bold">{str(props.productId)}</span> is fetched through the Connect Hub at request time.
    </div>
  );
}

function BookingCta(props: Record<string, unknown>, node: RenderNode) {
  const book = node.actions?.find(a => a.type === 'BOOK' || a.type === 'START_WORKFLOW');
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-slate-900 text-white p-6 my-3">
      <div>
        {props.title ? <div className="text-xs font-black uppercase tracking-widest text-sky-400">{str(props.title)}</div> : null}
        <div className="text-2xl font-black mt-1">{str(props.price)}</div>
      </div>
      <Link href={book ? str(book.target) : '/checkout'} className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 rounded-xl font-black text-sm transition">
        {str(props.ctaLabel) || 'Start booking'} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function LeadForm(props: Record<string, unknown>) {
  return (
    <form method="post" action="/api/v1/crm/leads" className="rounded-2xl border border-slate-200 bg-white p-6 my-3 space-y-4">
      <div className="text-lg font-extrabold text-slate-900">{str(props.title) || 'Plan your trip'}</div>
      <input name="contactName" required placeholder="Your name" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
      <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
      <input name="phone" placeholder="Phone (optional)" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
      <input type="hidden" name="destination" value={str(props.destinationHint)} />
      <input type="hidden" name="source" value="WEB_FORM" />
      <input type="hidden" name="campaign" value={str(props.campaign)} />
      <textarea name="budget" placeholder="Approx. budget & travel dates" rows={2} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
      <button type="submit" className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm transition">Request a callback</button>
    </form>
  );
}

function FaqSection(props: Record<string, unknown>) {
  const items = asArr(props.items);
  const jsonLd = props.structuredData !== false && items.length > 0 ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map((it: any) => ({ '@type': 'Question', name: str(it?.question ?? it?.title), acceptedAnswer: { '@type': 'Answer', text: str(it?.answer) } })),
  } : null;
  return (
    <>
      {jsonLd ? <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} /> : null}
      <Accordion items={items} />
    </>
  );
}

function FooterCta(props: Record<string, unknown>) {
  return (
    <section className="rounded-3xl bg-gradient-to-tr from-sky-700 to-indigo-700 text-white px-8 py-12 text-center my-4">
      <h2 className="text-2xl md:text-3xl font-black tracking-tight">{str(props.title)}</h2>
      {props.subtitle ? <p className="mt-2 text-sky-100">{str(props.subtitle)}</p> : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {props.primaryLabel ? <Link href={str(props.primaryTarget) || '/trip-planner'} className="px-6 py-3 bg-white text-sky-800 rounded-xl font-black text-sm">{str(props.primaryLabel)}</Link> : null}
        {props.secondaryLabel ? <Link href={str(props.secondaryTarget) || '/packages'} className="px-6 py-3 border border-white/40 hover:bg-white/10 rounded-xl font-bold text-sm">{str(props.secondaryLabel)}</Link> : null}
      </div>
    </section>
  );
}

// ---------- dashboard blocks ----------

function Kpi(props: Record<string, unknown>) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{str(props.label)}</div>
      <div className="mt-2 text-2xl font-black text-slate-900">{str(props.value)}</div>
      {props.trend ? <div className={`mt-1 text-xs font-bold ${str(props.tone) === 'down' ? 'text-rose-600' : str(props.tone) === 'up' ? 'text-emerald-600' : 'text-slate-400'}`}>{str(props.trend)}</div> : null}
    </div>
  );
}

function DataTable(props: Record<string, unknown>) {
  const rows = asArr(props.rows);
  const columns = asArr(props.columns).map((c: any) => (typeof c === 'string' ? { key: c, label: c } : c));
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead><tr className="bg-slate-50 text-left">{columns.map((c: any) => <th key={str(c.key)} className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-500">{str(c.label ?? c.key)}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {rows.slice(0, num(props.pageSize) || 10).map((r: any, i: number) => (
            <tr key={i}>{columns.map((c: any) => <td key={str(c.key)} className="px-4 py-3 text-slate-700">{str(r?.[str(c.key)])}</td>)}</tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <div className="p-4 text-sm text-slate-400">No records in scope.</div> : null}
    </div>
  );
}

function Kanban(props: Record<string, unknown>) {
  const lanes = asArr(props.lanes);
  const items = asArr(props.items);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {lanes.map((lane: any) => {
        const laneItems = items.filter(it => str(it?.status) === str(lane?.key ?? lane?.status));
        return (
          <div key={str(lane?.key ?? lane?.label)} className="rounded-2xl bg-slate-100 border border-slate-200 p-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">{str(lane?.label ?? lane?.key)} ({laneItems.length})</div>
            <ul className="mt-2 space-y-2">
              {laneItems.slice(0, 12).map((it: any, i: number) => (
                <li key={i} className="rounded-xl bg-white border border-slate-200 p-3 text-sm font-bold text-slate-800">{str(it?.title ?? it?.name ?? it?.id)}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function ActivityFeed(props: Record<string, unknown>) {
  const items = asArr(props.items);
  return (
    <ol className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100" aria-label="Activity">
      {items.slice(0, 15).map((it: any, i: number) => (
        <li key={i} className="flex items-start gap-3 px-4 py-3 text-sm">
          <Activity className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" aria-hidden />
          <div><span className="font-bold text-slate-800">{str(it?.action ?? it?.title)}</span> <span className="text-slate-500">{str(it?.description ?? it?.resourceType)}</span></div>
        </li>
      ))}
      {items.length === 0 ? <li className="px-4 py-3 text-sm text-slate-400">No recent activity.</li> : null}
    </ol>
  );
}

function AlertPanel(props: Record<string, unknown>) {
  const items = asArr(props.items);
  return (
    <div role="alert" className="space-y-2">
      {items.map((it: any, i: number) => (
        <div key={i} className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
          <div><span className="font-bold">{str(it?.title)}</span> — {str(it?.message)}</div>
        </div>
      ))}
      {items.length === 0 ? <div className="flex items-center gap-2 text-sm text-emerald-700 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3"><CheckCircle2 className="w-4 h-4" />All clear in this workspace.</div> : null}
    </div>
  );
}

function Chart(props: Record<string, unknown>) {
  const series = asArr(props.series).map((s: any) => (typeof s === 'number' ? { label: '', value: s } : s));
  const max = Math.max(1, ...series.map((s: any) => num(s?.value)));
  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-5">
      <svg viewBox={`0 0 ${series.length * 44 || 44} 120`} className="w-full h-40" role="img" aria-label={`${str(props.chartType)} chart${props.unit ? ` in ${str(props.unit)}` : ''}`}>
        {series.map((s: any, i: number) => {
          const h = Math.max(4, (num(s?.value) / max) * 100);
          return <rect key={i} x={i * 44 + 8} y={110 - h} width={28} height={h} rx={4} className="fill-sky-500" />;
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
        {series.map((s: any, i: number) => <span key={i}>{str(s?.label)}: <b>{str(s?.value)}</b></span>)}
      </figcaption>
    </figure>
  );
}

function QuickActions(props: Record<string, unknown>) {
  const actions = asArr(props.actions);
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a: any, i: number) => (
        <Link key={i} href={str(a?.href ?? a?.target ?? '#')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:border-sky-500 hover:text-sky-700 transition">
          <Sparkles className="w-3.5 h-3.5" aria-hidden />{str(a?.label)}
        </Link>
      ))}
    </div>
  );
}

function AiSummary(props: Record<string, unknown>) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-tr from-indigo-50 to-sky-50 p-5">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-700"><Sparkles className="w-4 h-4" />Voyage8 AI · {str(props.title ?? props.scope)}</div>
      <p className="mt-2 text-sm text-slate-700 leading-relaxed">{str(props.summary ?? 'Executive digest will appear here once generated by the Voyage8 copilot.')}</p>
    </div>
  );
}

function RecentRecords(props: Record<string, unknown>) {
  const records = asArr(props.records ?? props.items);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-black uppercase tracking-wider text-slate-400">Recent · {str(props.collection)}</div>
      <ul className="mt-2 divide-y divide-slate-100 text-sm">
        {records.slice(0, num(props.limit) || 5).map((r: any, i: number) => <li key={i} className="py-2 font-bold text-slate-800">{str(r?.title ?? r?.name ?? r?.id)}</li>)}
        {records.length === 0 ? <li className="py-2 text-slate-400">None in scope.</li> : null}
      </ul>
    </div>
  );
}

function ProgressPanel(props: Record<string, unknown>) {
  const pct = Math.min(100, Math.max(0, num(props.percent)));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400"><span>{str(props.label)}</span><span>{pct}%</span></div>
      <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-sky-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function HealthPanel(props: Record<string, unknown>) {
  const items = asArr(props.items);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-black uppercase tracking-wider text-slate-400">{str(props.title) || 'System health'}</div>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((it: any, i: number) => (
          <li key={i} className="flex items-center justify-between"><span className="font-bold text-slate-700">{str(it?.name)}</span><Badge text={str(it?.status ?? 'OK')} tone={str(it?.status) === 'ACTIVE' || !it?.status ? 'emerald' : 'amber'} /></li>
        ))}
        {items.length === 0 ? <li className="text-slate-400">Connectors report through the health API.</li> : null}
      </ul>
    </div>
  );
}

// ---------- dispatcher ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BLOCKS: Record<string, (props: any, node: RenderNode) => React.ReactNode> = {
  hero: Hero as any, heading: Heading as any, richText: RichText as any, image: ImageBlock as any,
  button: Button as any, badge: Badge as any, grid: Grid as any, divider: Divider as any,
  accordion: Accordion as any, destinationCard: DestinationCard as any, placeCard: PlaceCard as any,
  journeyCard: JourneyCard as any, diaryCard: DiaryCard as any, productCard: ProductCard as any,
  journeyTimeline: JourneyTimeline as any, routeMap: RouteMap as any, travelBudget: TravelBudget as any,
  travelTip: TravelTip as any, travelAdvisory: TravelAdvisory as any, weatherStrip: WeatherStrip as any,
  gallery: Gallery as any, reviewList: ReviewList as any, availability: Availability as any,
  bookingCta: BookingCta as any, leadForm: LeadForm as any, faqSection: FaqSection as any,
  footerCta: FooterCta as any, kpi: Kpi as any, dataTable: DataTable as any, kanban: Kanban as any,
  activityFeed: ActivityFeed as any, alertPanel: AlertPanel as any, chart: Chart as any,
  quickActions: QuickActions as any, aiSummary: AiSummary as any, recentRecords: RecentRecords as any,
  progressPanel: ProgressPanel as any, healthPanel: HealthPanel as any,
};

/** Controlled fallback per §55 — broken node never crashes the page */
function VibeFallback({ node }: { node: RenderNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500" data-vibe-fallback={node.fallback?.diagnosticId}>
      Content temporarily unavailable. <span className="text-xs text-slate-400">({node.fallback?.diagnosticId})</span>
    </div>
  );
}

export function BlockRenderer({ node }: { node: RenderNode }): React.ReactNode {
  if (node.fallback) return <VibeFallback key={node.id} node={node} />;
  const Block = BLOCKS[node.componentKey];
  if (!Block) return <VibeFallback key={node.id} node={{ ...node, fallback: { reason: `No renderer for ${node.componentKey}`, diagnosticId: node.id } }} />;
  return (
    <div key={node.id} data-vibe-node={node.id} className={breakpointClass(node)}>
      {Block(node.props, node)}
    </div>
  );
}
