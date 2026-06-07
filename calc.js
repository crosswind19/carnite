/* ============================================================
   Carnite — calculation logic (pure functions)
   Exposed on window.Carnite
   ============================================================ */
(function () {
  const round = (x) => Math.round(x);

  // Reducing balance monthly instalment.
  // M = P * r(1+r)^n / ((1+r)^n - 1)
  function reducingInstalment(P, annualRate, months) {
    const r = annualRate / 100 / 12;
    if (r === 0) return P / months;
    const f = Math.pow(1 + r, months);
    return (P * r * f) / (f - 1);
  }

  // Flat rate monthly instalment.
  // M = (P + P*rate*years) / totalMonths
  function flatInstalment(P, annualRate, months) {
    const years = months / 12;
    const totalInterest = P * (annualRate / 100) * years;
    return (P + totalInterest) / months;
  }

  // Full reducing-balance summary + per-month schedule.
  function reducingSummary(P, annualRate, months) {
    const r = annualRate / 100 / 12;
    const M = reducingInstalment(P, annualRate, months);
    let balance = P;
    const schedule = [];
    for (let i = 1; i <= months; i++) {
      const interest = balance * r;
      let principal = M - interest;
      if (i === months) principal = balance; // clean final
      balance = Math.max(0, balance - principal);
      schedule.push({ month: i, payment: interest + principal, interest, principal, balance });
    }
    const totalInterest = schedule.reduce((s, x) => s + x.interest, 0);
    return { method: 'reducing', instalment: M, months, totalInterest,
             totalPayable: P + totalInterest, principal: P, schedule };
  }

  // Flat-rate summary + schedule (interest spread evenly).
  function flatSummary(P, annualRate, months) {
    const years = months / 12;
    const totalInterest = P * (annualRate / 100) * years;
    const M = (P + totalInterest) / months;
    const monthlyInterest = totalInterest / months;
    const monthlyPrincipal = P / months;
    let balance = P;
    const schedule = [];
    for (let i = 1; i <= months; i++) {
      balance = Math.max(0, balance - monthlyPrincipal);
      schedule.push({ month: i, payment: M, interest: monthlyInterest,
                      principal: monthlyPrincipal, balance });
    }
    return { method: 'flat', instalment: M, months, totalInterest,
             totalPayable: P + totalInterest, principal: P, schedule };
  }

  // Extra repayment on a reducing-balance loan. Instalment stays fixed;
  // extra reduces principal so the loan ends earlier.
  // extraMonthly: added every month. lumpSum at lumpMonth (1-based).
  function reducingWithExtra(P, annualRate, months, extraMonthly, lumpSum, lumpMonth) {
    const r = annualRate / 100 / 12;
    const M = reducingInstalment(P, annualRate, months);
    let balance = P;
    let i = 0;
    let totalInterest = 0;
    const schedule = [];
    while (balance > 0.005 && i < months * 2 + 5) {
      i++;
      const interest = balance * r;
      let principal = M - interest + (extraMonthly || 0);
      if (lumpSum && i === lumpMonth) principal += lumpSum;
      if (principal > balance) principal = balance;
      totalInterest += interest;
      balance = Math.max(0, balance - principal);
      schedule.push({ month: i, payment: interest + principal, interest, principal, balance });
    }
    return { method: 'reducing-extra', instalment: M, months: i, totalInterest,
             totalPayable: P + totalInterest, principal: P, schedule };
  }

  // Aggregate a schedule into yearly principal/interest buckets (for the chart).
  function yearly(schedule) {
    const out = [];
    schedule.forEach((row) => {
      const y = Math.ceil(row.month / 12);
      if (!out[y - 1]) out[y - 1] = { year: y, principal: 0, interest: 0 };
      out[y - 1].principal += row.principal;
      out[y - 1].interest += row.interest;
    });
    return out;
  }

  // Add n months to a date -> "Mon YYYY".
  function payoffDate(months, from) {
    const d = from ? new Date(from) : new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }

  // Formatting helpers.
  const fmtRM = (x) => 'RM' + round(x).toLocaleString('en-MY');
  const fmtRM2 = (x) => 'RM' + Number(x).toLocaleString('en-MY',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  window.Carnite = {
    reducingInstalment, flatInstalment, reducingSummary, flatSummary,
    reducingWithExtra, yearly, payoffDate, fmtRM, fmtRM2, round,
  };
})();
