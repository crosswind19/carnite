/* ============================================================
   Carnite — extra sections: Comparison · Testimonials · FAQ
   Loads after components.jsx (Icon already on window).
   ============================================================ */
const { useState: xState } = React;

/* ---- Comparison table -------------------------------------- */
function ComparisonTable() {
  const rows = [
    {
      f: 'Reducing balance + flat rate',
      sub: 'Both methods, one screen',
      us: 'check', bank: 'half', sheet: 'half',
    },
    {
      f: 'Extra repayment simulator',
      sub: 'Monthly add-ons and lump sums',
      us: 'check', bank: 'x', sheet: 'half',
    },
    {
      f: 'Side-by-side comparison',
      sub: 'See the savings, instantly',
      us: 'check', bank: 'x', sheet: 'x',
    },
    {
      f: 'Live amortisation chart',
      sub: 'Principal vs interest, by year',
      us: 'check', bank: 'x', sheet: 'half',
    },
    {
      f: 'Time to first answer',
      sub: 'From landing to instalment',
      us: 'val:~3 sec', bank: 'val:2 min', sheet: 'val:15 min',
    },
    {
      f: 'Hidden fees',
      sub: 'Sign-ups, upsells, retargeting',
      us: 'val:RM0', bank: 'x', sheet: 'check',
    },
  ];

  const Cell = ({ kind }) => {
    if (typeof kind === 'string' && kind.startsWith('val:')) {
      return <span className="cmp-cell-val">{kind.slice(4)}</span>;
    }
    if (kind === 'check') return <span className="cmp-check"><Icon name="check" size={22} strokeWidth={2.5} /></span>;
    if (kind === 'half')  return <span className="cmp-x" style={{ color: 'var(--fg2)' }}><Icon name="minus" size={22} strokeWidth={2.5} /></span>;
    return <span className="cmp-x"><Icon name="x" size={22} strokeWidth={2.5} /></span>;
  };

  return (
    <section className="section-pad compare-section" id="compare">
      <div className="wrap">
        <div className="head-row">
          <div>
            <p className="eyebrow">Compare</p>
            <h2 className="section-head">Carnite vs the rest.</h2>
            <p className="section-sub">
              What you get here, and what you don't get anywhere else.
            </p>
          </div>
          <span className="ks">6 dimensions · honest</span>
        </div>

        <div className="cmp-wrap">
          <div className="cmp-row head">
            <div>Feature</div>
            <div className="cmp-us">Carnite</div>
            <div className="cmp-hide">Bank calculator</div>
            <div>Spreadsheet</div>
          </div>
          {rows.map((r) => (
            <div className="cmp-row" key={r.f}>
              <div className="cmp-feat">
                <div>
                  <div>{r.f}</div>
                  <small>{r.sub}</small>
                </div>
              </div>
              <div className="cmp-us"><Cell kind={r.us} /></div>
              <div className="cmp-hide"><Cell kind={r.bank} /></div>
              <div><Cell kind={r.sheet} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Testimonials ------------------------------------------ */
function Testimonials() {
  const quotes = [
    {
      q: 'I almost signed a 7-year flat rate. Carnite showed me reducing balance saved me RM8,400. Twenty seconds of math, real money back in my pocket.',
      name: 'Aisyah R.',
      meta: 'Petaling Jaya · Honda City',
      avatar: 'AR',
      saved: 'RM8,400 saved',
    },
    {
      q: 'The extra-repayment simulator is the part nobody else has. I tried lump sums on month 12, 18, 24 — saw exactly which one pays the loan off two years early.',
      name: 'Daniel T.',
      meta: 'KL · Perodua Ativa',
      saved: '23 months sooner',
      avatar: 'DT',
    },
    {
      q: "Numbers in JetBrains Mono, properly aligned. I'm a finance person — I cannot tell you how rare that is. The math feels trustworthy because it looks engineered.",
      name: 'Priya M.',
      meta: 'Johor Bahru · Mazda CX-5',
      saved: 'RM12,180 saved',
      avatar: 'PM',
    },
  ];
  return (
    <section className="section-pad" id="loved">
      <div className="wrap">
        <p className="eyebrow">Loved by buyers</p>
        <h2 className="section-head">Money back, screenshot worthy.</h2>
        <p className="section-sub">
          Real Malaysians, real loans, real numbers. No paid placements.
        </p>
        <div className="tt-grid">
          {quotes.map((t) => (
            <article className="card tt-card" key={t.name}>
              <span className="quote-mark">"</span>
              <blockquote>{t.q}</blockquote>
              <span className="saved">{t.saved}</span>
              <div className="who">
                <div className="avatar">{t.avatar}</div>
                <div>
                  <div className="name">{t.name}</div>
                  <div className="meta">{t.meta}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- FAQ ---------------------------------------------------- */
function FAQ() {
  const qs = [
    {
      q: "What's the difference between reducing balance and flat rate?",
      a: "Reducing balance charges interest only on what you still owe — so as you pay down the loan, the interest portion shrinks. Flat rate charges interest on the full original amount for the entire tenure. For the same headline rate, reducing balance is almost always cheaper. Carnite shows you both, side by side.",
    },
    {
      q: "Are the bank rates live?",
      a: "Not yet. The rates teaser shows indicative, market-representative values you can adjust to model the current landscape. We're working with banks to pipe in live rates — until then, always confirm with your bank before signing.",
    },
    {
      q: "Do I need to sign up to use the calculator?",
      a: "No. No account, no email, no upsell. Everything runs in your browser. We don't store your inputs, and we don't sell your data.",
    },
    {
      q: "Can I model extra repayments properly?",
      a: "Yes — this is the feature most calculators get wrong. Add as many extra payments as you want, mix monthly add-ons with one-off lump sums at specific months, and see the exact interest saved, months saved, and your new payoff date.",
    },
    {
      q: "How accurate is the calculation?",
      a: "We use the standard amortisation formula M = P·r·(1+r)ⁿ / ((1+r)ⁿ − 1) for reducing balance, and (P + P·rate·years) / months for flat. The schedule is computed month by month at full precision — no rounding shortcuts. Final-month balance is cleaned to zero.",
    },
    {
      q: "Is this affiliated with any bank?",
      a: "No. Carnite is independent. We don't take referral fees from banks. Our only goal is to help you make a clearer decision.",
    },
  ];
  const [open, setOpen] = xState(0);
  return (
    <section className="section-pad" id="faq">
      <div className="wrap">
        <p className="eyebrow">Frequently asked</p>
        <h2 className="section-head">Questions, answered straight.</h2>

        <div className="faq-layout">
          <aside className="glass faq-cta">
            <Icon name="message-circle-question" size={28} color="var(--papaya)" />
            <h3>Still got questions?</h3>
            <p>
              Stuck on a number? Spotting something off? We answer every email
              — usually within a day.
            </p>
            <a href="mailto:hello@carnite.my" className="btn btn-ghost">
              <Icon name="mail" size={16} /> hello@carnite.my
            </a>
          </aside>

          <div className="faq-list">
            {qs.map((item, i) => (
              <div key={item.q} className={'faq-item' + (open === i ? ' open' : '')}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{item.q}</span>
                  <span className="chev"><Icon name="plus" size={20} strokeWidth={2.5} /></span>
                </button>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ComparisonTable, Testimonials, FAQ });
