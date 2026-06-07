/* ============================================================
   Carnite website — Calculator (the centerpiece)
   ============================================================ */
const { useState: cState, useEffect: cEffect, useRef: cRef, useMemo } = React;
const C = () => window.Carnite;

/* Reducing-balance amortisation honoring an array of extra payments. */
function reducingExtraSchedule(P, annualRate, months, extras) {
  const r = annualRate / 100 / 12;
  const M = C().reducingInstalment(P, annualRate, months);
  const monthlyExtra = extras.filter((e) => e.type === 'monthly')
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const lumps = extras.filter((e) => e.type === 'lump');
  let balance = P, i = 0, totalInterest = 0;
  const schedule = [];
  while (balance > 0.005 && i < months * 3 + 5) {
    i++;
    const interest = balance * r;
    let principal = M - interest + monthlyExtra;
    lumps.forEach((l) => { if (i === (Number(l.month) || 1)) principal += Number(l.amount) || 0; });
    if (principal > balance) principal = balance;
    totalInterest += interest;
    balance = Math.max(0, balance - principal);
    schedule.push({ month: i, payment: interest + principal, interest, principal, balance });
  }
  return { instalment: M, months: i, totalInterest, totalPayable: P + totalInterest, schedule };
}

/* ---- Input field with RM / % affix ------------------------- */
function AffixField({ label, pre, suf, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-wrap">
        {pre && <span className="pre">{pre}</span>}
        <input type="text" inputMode="decimal" value={value}
          onChange={(e) => onChange(e.target.value)} />
        {suf && <span className="suf">{suf}</span>}
      </div>
    </div>
  );
}

/* ---- Result card ------------------------------------------- */
function RCard({ value, label, money = true, hi = false }) {
  const animated = useCountUp(money ? value : value);
  const display = money ? C().fmtRM(animated) : Math.round(animated).toLocaleString('en-MY');
  return (
    <div className={'rcard' + (hi ? ' hi' : '')}>
      <div className="rv">{display}</div>
      <div className="rl">{label}</div>
    </div>
  );
}

/* ---- The Calculator ---------------------------------------- */
function Calculator({ defaults = {} }) {
  const [method, setMethod] = cState(defaults.method || 'reducing');
  const [priceStr, setPriceStr] = cState(defaults.price || '100,000');
  const [downStr, setDownStr] = cState(defaults.down || '10,000');
  const [rateStr, setRateStr] = cState(defaults.rate || '2.85');
  const [years, setYears] = cState(defaults.years || 7);
  const [extraOpen, setExtraOpen] = cState(false);
  const [extras, setExtras] = cState([{ id: 1, type: 'monthly', amount: '300', month: 12 }]);
  const [view, setView] = cState('chart');
  const [page, setPage] = cState(0);

  const num = (s) => Number(String(s).replace(/[^0-9.]/g, '')) || 0;
  const price = num(priceStr), down = num(downStr), rate = num(rateStr);
  const P = Math.max(0, price - down);
  const months = years * 12;

  const reducing = useMemo(() => C().reducingSummary(P, rate, months), [P, rate, months]);
  const flat = useMemo(() => C().flatSummary(P, rate, months), [P, rate, months]);
  const withExtra = useMemo(
    () => (method === 'reducing' && extraOpen ? reducingExtraSchedule(P, rate, months, extras) : null),
    [method, extraOpen, P, rate, months, extras]
  );

  const active = method === 'flat' ? flat : reducing;
  const scheduleSrc = withExtra ? withExtra : active;

  const interestSaved = withExtra ? reducing.totalInterest - withExtra.totalInterest : 0;
  const monthsSaved = withExtra ? reducing.months - withExtra.months : 0;
  const compareSaved = flat.totalInterest - reducing.totalInterest;

  // ---- Chart ----
  const canvasRef = cRef(null);
  const chartRef = cRef(null);
  cEffect(() => {
    if (view !== 'chart' || !canvasRef.current || !window.Chart) return;
    const src = method === 'compare' ? reducing : scheduleSrc;
    const yr = C().yearly(src.schedule);
    const labels = yr.map((y) => 'Yr ' + y.year);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--papaya').trim() || '#FF8000';
    const data = {
      labels,
      datasets: [
        { label: 'Principal', data: yr.map((y) => Math.round(y.principal)),
          backgroundColor: accent, borderRadius: 4, stack: 's' },
        { label: 'Interest', data: yr.map((y) => Math.round(y.interest)),
          backgroundColor: '#C9CDD6', borderRadius: 4, stack: 's' },
      ],
    };
    if (chartRef.current) { chartRef.current.data = data; chartRef.current.update(); return; }
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar', data,
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#A0A0A0', font: { family: 'DM Sans', size: 13 }, boxWidth: 12, boxHeight: 12, usePointStyle: true, pointStyle: 'rectRounded' } },
          tooltip: {
            backgroundColor: '#141414', borderColor: '#2A2A2A', borderWidth: 1,
            titleColor: '#fff', bodyColor: '#A0A0A0', padding: 12,
            titleFont: { family: 'Syne', weight: '700' }, bodyFont: { family: 'JetBrains Mono' },
            callbacks: { label: (ctx) => ' ' + ctx.dataset.label + ': ' + C().fmtRM(ctx.raw) },
          },
        },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: '#A0A0A0', font: { family: 'DM Sans' } } },
          y: { stacked: true, grid: { color: '#1B1B1B' }, ticks: { color: '#6A6A6A', font: { family: 'JetBrains Mono', size: 11 },
            callback: (v) => 'RM' + (v / 1000) + 'k' } },
        },
      },
    });
  }, [view, method, scheduleSrc, reducing]);
  cEffect(() => () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } }, []);
  cEffect(() => { if (view !== 'chart' && chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } }, [view]);

  // ---- Extra repayment rows ----
  const addExtra = () => setExtras((x) => [...x, { id: Date.now(), type: 'monthly', amount: '200', month: 12 }]);
  const rmExtra = (id) => setExtras((x) => x.filter((e) => e.id !== id));
  const setExtra = (id, patch) => setExtras((x) => x.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  // ---- Schedule pagination ----
  const PER = 12;
  const sched = scheduleSrc.schedule;
  const pages = Math.ceil(sched.length / PER);
  const pageRows = sched.slice(page * PER, page * PER + PER);
  cEffect(() => setPage(0), [method, P, rate, months, extraOpen, extras]);

  return (
    <section className="section-pad" id="calculator">
      <div className="wrap">
        <p className="eyebrow">Car loan calculator</p>
        <h2 className="section-head">Your numbers, instantly.</h2>

        <div className="glass calc-panel">
          {/* method toggle */}
          <div className="method-toggle">
            {[['reducing', 'Reducing Balance'], ['flat', 'Flat Rate'], ['compare', 'Compare Both']].map(([k, l]) => (
              <button key={k} className={method === k ? 'active' : ''} onClick={() => setMethod(k)}>{l}</button>
            ))}
          </div>

          <div className="calc-grid">
            {/* inputs */}
            <div>
              <AffixField label="Car price" pre="RM" value={priceStr}
                onChange={(v) => setPriceStr(v.replace(/[^0-9.,]/g, ''))} />
              <AffixField label="Down payment" pre="RM" value={downStr}
                onChange={(v) => setDownStr(v.replace(/[^0-9.,]/g, ''))} />
              <AffixField label={method === 'flat' ? 'Flat rate (p.a.)' : 'Interest rate (p.a.)'} suf="%"
                value={rateStr} onChange={(v) => setRateStr(v.replace(/[^0-9.]/g, ''))} />
              <div className="field">
                <label>Loan tenure — {years} years</label>
                <input className="slider" type="range" min="1" max="9" step="1"
                  value={years} onChange={(e) => setYears(Number(e.target.value))} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg2)', fontFamily: 'var(--font-mono)' }}>
                Loan amount: <span style={{ color: 'var(--fg1)' }}>{C().fmtRM(P)}</span>
              </div>

              {/* Extra repayment — reducing only */}
              {method === 'reducing' && (
                <div className={'disclosure' + (extraOpen ? ' open' : '')}>
                  <div className="disclosure-head" onClick={() => setExtraOpen((o) => !o)}>
                    <span className="t"><Icon name="plus-circle" size={18} color="var(--papaya)" /> Extra repayment</span>
                    <span className="chev"><Icon name="chevron-down" size={18} /></span>
                  </div>
                  <div className="disclosure-body">
                    {extras.map((e) => (
                      <div className="extra-row" key={e.id}>
                        <div>
                          <label style={{ fontSize: 12, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>Type</label>
                          <div className="mini-select">
                            <button className={e.type === 'monthly' ? 'active' : ''} onClick={() => setExtra(e.id, { type: 'monthly' })}>Monthly</button>
                            <button className={e.type === 'lump' ? 'active' : ''} onClick={() => setExtra(e.id, { type: 'lump' })}>Lump sum</button>
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 12, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>
                            {e.type === 'lump' ? 'Amount @ month ' + e.month : 'Extra / month'}
                          </label>
                          <div className="input-wrap" style={{ padding: '0 12px' }}>
                            <span className="pre" style={{ fontSize: 14 }}>RM</span>
                            <input style={{ fontSize: 16, padding: '11px 6px' }} value={e.amount}
                              onChange={(ev) => setExtra(e.id, { amount: ev.target.value.replace(/[^0-9.]/g, '') })} />
                          </div>
                        </div>
                        <button className="x" onClick={() => rmExtra(e.id)} title="Remove">×</button>
                      </div>
                    ))}
                    <button className="add-row" onClick={addExtra}>
                      <Icon name="plus" size={15} /> Add another
                    </button>
                    {withExtra && (interestSaved > 1 || monthsSaved > 0) && (
                      <div className="savings-pills">
                        <div className="spill"><div className="v">{C().fmtRM(interestSaved)}</div><div className="l">Interest saved</div></div>
                        <div className="spill"><div className="v">{monthsSaved} mo</div><div className="l">Sooner payoff</div></div>
                        <div className="spill"><div className="v">{C().payoffDate(withExtra.months)}</div><div className="l">New payoff date</div></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* results */}
            <div>
              {method !== 'compare' ? (
                <div className="results">
                  <RCard hi value={scheduleSrc.instalment} label="Monthly instalment" />
                  <RCard value={scheduleSrc.totalInterest} label="Total interest" />
                  <RCard value={scheduleSrc.totalPayable} label="Total payable" />
                  <RCard money={false} value={scheduleSrc.months} label="Months to clear" />
                </div>
              ) : (
                <div>
                  <div className="compare-grid">
                    <div className="compare-col win">
                      <h4>Reducing Balance</h4>
                      <span style={{ fontSize: 12, color: 'var(--fg2)' }}>Interest on outstanding</span>
                      <div className="cm">{C().fmtRM(reducing.instalment)}</div>
                      <span style={{ fontSize: 12, color: 'var(--fg2)' }}>per month</span>
                      <div style={{ marginTop: 14, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg2)' }}>
                        Total interest<br /><span style={{ color: 'var(--fg1)', fontSize: 16 }}>{C().fmtRM(reducing.totalInterest)}</span>
                      </div>
                    </div>
                    <div className="compare-col">
                      <h4>Flat Rate</h4>
                      <span style={{ fontSize: 12, color: 'var(--fg2)' }}>Interest on full sum</span>
                      <div className="cm">{C().fmtRM(flat.instalment)}</div>
                      <span style={{ fontSize: 12, color: 'var(--fg2)' }}>per month</span>
                      <div style={{ marginTop: 14, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg2)' }}>
                        Total interest<br /><span style={{ color: 'var(--fg1)', fontSize: 16 }}>{C().fmtRM(flat.totalInterest)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="savings-banner">
                    <Icon name="piggy-bank" size={30} color="var(--positive)" />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--positive)' }}>Reducing balance saves you</div>
                      <div className="v">{C().fmtRM(Math.max(0, compareSaved))} in interest over {years} years</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* chart / schedule */}
          <div className="chart-tabs">
            <button className={view === 'chart' ? 'active' : ''} onClick={() => setView('chart')}>Amortisation chart</button>
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Schedule</button>
          </div>
          {view === 'chart' ? (
            <div className="chart-box"><canvas ref={canvasRef} /></div>
          ) : (
            <div>
              <table className="schedule">
                <thead><tr><th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={r.month}>
                      <td>{r.month}</td><td>{C().fmtRM(r.payment)}</td><td>{C().fmtRM(r.principal)}</td>
                      <td>{C().fmtRM(r.interest)}</td><td>{C().fmtRM(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pager">
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                <span style={{ color: 'var(--fg2)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                  Page {page + 1} / {pages} · {sched.length} months
                </span>
                <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

window.Calculator = Calculator;
