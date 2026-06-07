/* ============================================================
   Carnite website — shared helpers + section components
   Exposed on window for cross-file use.
   ============================================================ */
const { useState, useEffect, useRef } = React;

/* ---- Lucide icon as a React component ---------------------- */
function Icon({ name, size = 24, color, strokeWidth = 2, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = '';
      const i = document.createElement('i');
      i.setAttribute('data-lucide', name);
      ref.current.appendChild(i);
      window.lucide.createIcons({ attrs: { 'stroke-width': strokeWidth } });
    }
  }, [name, strokeWidth]);
  return (
    <span ref={ref} className="ic-wrap"
      style={{ display: 'inline-flex', width: size, height: size, color, ...style }} />
  );
}

/* ---- Count-up hook ----------------------------------------- */
function useCountUp(value, duration = 650) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { prev.current = value; setDisp(value); return; }
    const from = prev.current, to = value, start = performance.now();
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - k, 3);
      setDisp(from + (to - from) * e);
      if (k < 1) raf = requestAnimationFrame(tick); else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return disp;
}

/* Animated RM value */
function MoneyCount({ value, className }) {
  const d = useCountUp(value);
  return <span className={className}>{window.Carnite.fmtRM(d)}</span>;
}

/* ---- Navbar ------------------------------------------------- */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const go = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <nav className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="wrap nav-inner">
        <a href="#top" className="brand" onClick={go('top')}>
          <img src="assets/carnite-logomark.svg" alt="Carnite" />
          <span className="brand-name">Carnite</span>
        </a>
        <div className="nav-links">
          <a href="#calculator" onClick={go('calculator')}>Calculator</a>
          <a href="#why" onClick={go('why')}>Why Carnite</a>
          <a href="#rates" onClick={go('rates')}>Rates</a>
          <a href="#how" onClick={go('how')}>How it works</a>
        </div>
        <a href="#rates" className="btn btn-primary" onClick={go('rates')}>
          Compare Rates <Icon name="arrow-right" size={18} />
        </a>
      </div>
    </nav>
  );
}

/* ---- Hero --------------------------------------------------- */
function Hero({ headline, accent, sub }) {
  const go = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const lines = (headline || 'Know before|you').split('|');
  const accentText = accent || 'drive.';
  const subText = sub || 'Calculate your exact car loan repayment in seconds. Reducing balance, flat rate, and extra repayment — all in one place.';
  return (
    <header className="hero" id="top">
      <div className="hero-bg" />
      <div className="hero-glow" />
      <div className="hero-inner">
        <h1>{lines[0]}{lines[1] ? <><br />{lines[1]} </> : ' '}<span className="accent">{accentText}</span></h1>
        <p className="hero-sub">{subText}</p>
        <div className="hero-ctas">
          <a href="#calculator" className="btn btn-primary" onClick={go('calculator')}>
            Calculate now <Icon name="arrow-right" size={18} />
          </a>
          <a href="#how" className="btn btn-ghost" onClick={go('how')}>How it works</a>
        </div>
      </div>
      <div className="stats-strip">
        <span><b>RM0</b> <span className="lab">hidden fees</span></span>
        <span className="dot">·</span>
        <span><b>2</b> <span className="lab">loan methods</span></span>
        <span className="dot">·</span>
        <span className="lab" style={{ color: 'var(--fg1)', fontWeight: 600 }}>Extra repayment simulator</span>
      </div>
    </header>
  );
}

/* ---- Why Carnite ------------------------------------------- */
function WhyCarnite() {
  const items = [
    { ic: 'trending-down', h: 'Reducing Balance', p: 'Interest charged only on what you still owe. Watch the balance — and the interest — shrink every single month.' },
    { ic: 'wallet', h: 'Extra Repayment Simulator', p: 'Throw in a lump sum or pay a little extra monthly. See exactly how much interest you save and when you\'re free.' },
    { ic: 'git-compare', h: 'Side-by-Side Comparison', p: 'Reducing balance vs flat rate, head to head. No jargon — just the real numbers, side by side.' },
  ];
  return (
    <section className="section-pad" id="why">
      <div className="wrap">
        <p className="eyebrow">Why Carnite</p>
        <h2 className="section-head">Built different.</h2>
        <div className="features">
          {items.map((it) => (
            <div key={it.h} className="glass feature">
              <Icon name={it.ic} size={38} color="var(--papaya)" />
              <h3>{it.h}</h3>
              <p>{it.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Bank rate comparison teaser --------------------------- */
function RatesTeaser() {
  const [flat, setFlat] = useState(3.00);
  const banks = ['Maybank', 'CIMB', 'RHB', 'Public Bank', 'Bank Islam', 'Affin Bank'];
  const eff = (flat * 1.86).toFixed(2);
  const fmtFlat = flat.toFixed(2);
  const handle = (v) => {
    const n = Math.max(0, Math.min(15, Number(v) || 0));
    setFlat(n);
  };
  return (
    <section className="section-pad" id="rates">
      <div className="wrap">
        <p className="eyebrow">Live market · indicative</p>
        <h2 className="section-head">Current car loan rates in Malaysia.</h2>
        <p className="section-sub">New-car hire purchase. Adjust the indicative rate to model the market.</p>

        <div className="rate-control">
          <label>
            <span className="rl">Indicative flat rate</span>
            <div className="rate-input">
              <input type="number" step="0.05" min="0" max="15" value={fmtFlat}
                onChange={(e) => handle(e.target.value)} />
              <span className="suf">%</span>
            </div>
          </label>
          <input type="range" className="slider" min="0" max="6" step="0.05"
            value={flat} onChange={(e) => handle(e.target.value)} />
          <span className="hint">≈ {eff}% effective over 7 yrs</span>
        </div>

        <div className="rates-wrap card" style={{ overflow: 'hidden', paddingBottom: 8 }}>
          <table className="rates">
            <thead>
              <tr><th>Bank</th><th className="r">Flat rate (p.a.)</th><th className="r">Effective rate</th></tr>
            </thead>
            <tbody>
              {banks.map((bank, i) => (
                <tr key={bank} className={i >= 2 ? 'blur' : ''}>
                  <td className="bank">{bank}</td>
                  <td className="r">{fmtFlat}%</td>
                  <td className="r">{eff}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="rates-overlay">
            <a href="#calculator" className="btn btn-primary"
               onClick={(e) => { e.preventDefault(); document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }); }}>
              See all rates <Icon name="arrow-right" size={18} />
            </a>
            <span style={{ color: 'var(--fg2)', fontSize: 13 }}>6 banks · sample values</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- How it works ------------------------------------------ */
function HowItWorks() {
  const steps = [
    { n: '01', h: 'Enter price & down payment', p: 'Punch in the car price and how much you\'re putting down.' },
    { n: '02', h: 'Choose method & tenure', p: 'Reducing balance or flat rate, and how many years to pay.' },
    { n: '03', h: 'See full breakdown instantly', p: 'Monthly instalment, total interest, chart and schedule — live.' },
  ];
  return (
    <section className="section-pad" id="how">
      <div className="wrap">
        <p className="eyebrow">How it works</p>
        <h2 className="section-head">Three steps to clarity.</h2>
        <div className="steps">
          <div className="dash" />
          {steps.map((s) => (
            <div key={s.n} className="step">
              <div className="n">{s.n}</div>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Footer ------------------------------------------------- */
function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-top">
        <div>
          <div className="brand" style={{ gap: 10 }}>
            <img src="assets/carnite-logomark.svg" width="30" height="30" alt="" />
            <span className="brand-name">Carnite</span>
          </div>
          <div className="footer-tag">Know before you drive.</div>
        </div>
        <div className="footer-nav">
          <a href="#calculator">Calculator</a>
          <a href="#why">Why Carnite</a>
          <a href="#rates">Rates</a>
          <a href="#how">How it works</a>
        </div>
        <div className="footer-my">Built for Malaysian car buyers 🇲🇾</div>
      </div>
      <div className="wrap">
        <p className="footer-disc">
          Rates shown are indicative only. Always confirm with your bank before
          making any financial decision.
        </p>
      </div>
    </footer>
  );
}

Object.assign(window, {
  Icon, useCountUp, MoneyCount, Navbar, Hero, WhyCarnite, RatesTeaser, HowItWorks, Footer,
});
