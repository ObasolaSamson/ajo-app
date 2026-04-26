import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="bg-white text-zinc-900 font-sans">
      <LandingNav />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <WhyAjo />
      <Testimonials />
      <CtaBanner />
      <LandingFooter />
    </div>
  )
}

/* ─── Nav ─────────────────────────────────────────────────────────────────── */

function LandingNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-2xl font-bold tracking-tight text-white">Ajo</span>
        <Link
          href="/login"
          className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
        >
          Sign in
        </Link>
      </nav>
    </header>
  )
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B1512] px-6 pb-24 pt-36 sm:pb-32 sm:pt-44">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-ajo/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-ajo/10 blur-[80px]"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ajo/40 bg-ajo/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-ajo uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-ajo" />
          Rotating savings circles — now online
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
          Save together,{' '}
          <span className="text-ajo">win together.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-zinc-400 sm:text-lg leading-relaxed">
          Ajo brings the age-old susu/ajo savings tradition online. Pool money
          with people you trust, contribute monthly, and each member takes the
          full pot in rotation — no banks, no interest, no fees.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto rounded-full bg-ajo px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-ajo/30 hover:bg-ajo-dark transition-colors"
          >
            Create a Circle
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Join a Circle
          </Link>
        </div>
      </div>

      {/* Hero card mockup */}
      <div className="relative mx-auto mt-16 max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Lagos Hustle Circle</p>
              <p className="text-lg font-bold text-white mt-0.5">Round 3 of 8</p>
            </div>
            <span className="rounded-full bg-ajo/20 border border-ajo/30 px-3 py-1 text-xs font-semibold text-ajo">Monthly</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 mb-4 overflow-hidden">
            <div className="h-full w-3/8 rounded-full bg-ajo" style={{ width: '37.5%' }} />
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Chioma A.', slot: 1, paid: true },
              { name: 'Tunde B.', slot: 2, paid: true },
              { name: 'Amaka O.', slot: 3, paid: false },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-3">
                <div className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${m.paid ? 'bg-ajo text-white' : 'bg-white/10 text-zinc-400'}`}>
                  {m.slot}
                </div>
                <span className="flex-1 text-sm text-zinc-300">{m.name}</span>
                {m.paid
                  ? <span className="text-xs font-medium text-ajo">✓ Paid</span>
                  : <span className="text-xs text-zinc-500">Pending</span>}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-ajo/10 border border-ajo/20 px-4 py-2.5 text-center">
            <p className="text-xs text-ajo font-semibold">$12,000 payout → Chioma A.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Social Proof ────────────────────────────────────────────────────────── */

function SocialProof() {
  const stats = [
    { value: '500+', label: 'Active members' },
    { value: '$2.4M', label: 'Paid out to date' },
    { value: '120+', label: 'Circles completed' },
    { value: '4.9★', label: 'Average trust rating' },
  ]

  return (
    <div className="border-y border-zinc-100 bg-zinc-50 px-6 py-10">
      <dl className="mx-auto max-w-4xl grid grid-cols-2 gap-y-8 sm:grid-cols-4 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-2xl font-bold text-ajo">{s.value}</dt>
            <dd className="mt-1 text-sm text-zinc-500">{s.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ─── How it works ────────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Start or join a circle',
      desc: 'Create a new savings circle and invite people you trust, or join one with an invite code from a friend.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
    {
      n: '02',
      title: 'Everyone contributes monthly',
      desc: 'Each member contributes the agreed amount every cycle. The organizer marks payments and keeps the circle on track.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
    },
    {
      n: '03',
      title: 'Each member wins in rotation',
      desc: 'When the round is complete, the full pot goes to the next person in line. Every member gets their turn — guaranteed.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      ),
    },
  ]

  return (
    <section id="how-it-works" className="bg-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-ajo mb-3">Simple by design</p>
          <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">How it works</h2>
          <p className="mt-4 text-zinc-500 max-w-lg mx-auto">
            Ajo is the digital home for a tradition that's been working for generations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.n} className="relative flex flex-col items-start">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute top-5 left-12 hidden sm:block h-px w-full bg-gradient-to-r from-ajo/40 to-transparent" />
              )}
              <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ajo/10 text-ajo ring-1 ring-ajo/20">
                {step.icon}
              </div>
              <p className="text-xs font-bold tracking-widest text-zinc-300 mb-1">{step.n}</p>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Why Ajo ─────────────────────────────────────────────────────────────── */

function WhyAjo() {
  const benefits = [
    {
      title: 'No banks, no interest, no fees',
      desc: "Your money goes directly to members — not to a bank's bottom line. Zero platform fees. Zero interest charges.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Built on trust and community',
      desc: 'You choose who joins your circle. Every member is accountable to people they already know — the way it was always meant to work.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      title: 'Track everything in one place',
      desc: 'See who has paid, who is next in line, and how much has been collected — in real time. Full transparency for every member.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="bg-zinc-50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-ajo mb-3">Built different</p>
          <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Why Ajo?</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl bg-white border border-zinc-100 shadow-sm p-7 hover:shadow-md hover:border-ajo/20 transition-all"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ajo/10 text-ajo">
                {b.icon}
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2">{b.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials ────────────────────────────────────────────────────────── */

function Testimonials() {
  const quotes = [
    {
      quote: "I've been in ajo groups for years, but tracking payments was always a nightmare. Ajo App made it effortless — everyone can see exactly what's happening.",
      name: 'Chioma Adeyemi',
      role: 'Organizer, Lagos Hustle Circle',
      initials: 'CA',
    },
    {
      quote: "Our family susu has been running for three years online now. We raised enough for my brother's business and my sister's education. Life-changing.",
      name: 'Kwame Asante',
      role: 'Member, Family Circle',
      initials: 'KA',
    },
    {
      quote: "I was skeptical about doing this online but the transparency is incredible. I can see every payment, every round. It's exactly what our group needed.",
      name: 'Amara Okonkwo',
      role: 'Member, Diaspora Savings',
      initials: 'AO',
    },
  ]

  return (
    <section className="bg-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-ajo mb-3">Real stories</p>
          <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Members love Ajo</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {quotes.map((q) => (
            <div
              key={q.name}
              className="flex flex-col justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-7 shadow-sm"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="flex-1 text-sm text-zinc-600 leading-relaxed">
                &ldquo;{q.quote}&rdquo;
              </blockquote>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ajo text-white text-xs font-bold">
                  {q.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{q.name}</p>
                  <p className="text-xs text-zinc-400">{q.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CTA Banner ──────────────────────────────────────────────────────────── */

function CtaBanner() {
  return (
    <section className="bg-ajo px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Ready to start saving together?
        </h2>
        <p className="mt-4 text-ajo-light/80 text-base">
          Set up your first circle in under two minutes. No bank account needed.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-ajo shadow-lg hover:bg-ajo-light transition-colors"
          >
            Create a Circle — it&apos;s free
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
          >
            Already have an account?
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */

function LandingFooter() {
  return (
    <footer className="bg-[#0B1512] px-6 py-12">
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-xl font-bold text-white">Ajo</p>
          <p className="mt-1 text-xs text-zinc-500">
            Rotating savings circles — built with trust.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/login" className="hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-white transition-colors">
            Create account
          </Link>
        </div>
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} Ajo App. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
