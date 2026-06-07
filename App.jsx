/* Carnite — App shell with Tweaks panel */
const { useEffect: aEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent":     "#FF8000",
  "accentName": "papaya",
  "headline":   "Know before|you",
  "headlineAccent": "drive.",
  "heroSub":    "Calculate your exact car loan repayment in seconds. Reducing balance, flat rate, and extra repayment — all in one place.",
  "calcPrice":  "100,000",
  "calcDown":   "10,000",
  "calcRate":   "2.85",
  "calcYears":  7,
  "calcMethod": "reducing"
}/*EDITMODE-END*/;

// Apply accent color by overwriting the --papaya CSS variable
// and a few derived shades. Done at <html> so all tokens cascade.
function applyAccent(hex) {
  const root = document.documentElement;
  root.style.setProperty('--papaya', hex);
  root.style.setProperty('--papaya-hover', shade(hex, 0.10));
  root.style.setProperty('--papaya-press', shade(hex, -0.12));
  root.style.setProperty('--focus-ring', `0 0 0 2px ${hexA(hex, 0.40)}`);
  root.style.setProperty('--shadow-papaya', `0 12px 40px ${hexA(hex, 0.28)}`);
}
function shade(hex, amt) {
  const { r, g, b } = hex2rgb(hex);
  const k = amt >= 0 ? 255 : 0;
  const t = Math.abs(amt);
  const mix = (c) => Math.round(c + (k - c) * t);
  return rgb2hex(mix(r), mix(g), mix(b));
}
function hexA(hex, a) {
  const { r, g, b } = hex2rgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function hex2rgb(h) {
  const m = h.replace('#', '');
  return { r: parseInt(m.slice(0, 2), 16), g: parseInt(m.slice(2, 4), 16), b: parseInt(m.slice(4, 6), 16) };
}
function rgb2hex(r, g, b) {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}

const ACCENT_OPTIONS = [
  { hex: '#FF8000', name: 'Papaya' },
  { hex: '#38D39F', name: 'Mint' },
  { hex: '#FF3D5A', name: 'Crimson' },
  { hex: '#FFD400', name: 'Sunburst' },
  { hex: '#7C5CFF', name: 'Violet' },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  aEffect(() => { applyAccent(t.accent); }, [t.accent]);

  const calcDefaults = {
    price: t.calcPrice,
    down: t.calcDown,
    rate: t.calcRate,
    years: Number(t.calcYears) || 7,
    method: t.calcMethod,
  };

  return (
    <React.Fragment>
      <Navbar />
      <Hero headline={t.headline} accent={t.headlineAccent} sub={t.heroSub} />
      <Calculator key={t.accent + '|' + JSON.stringify(calcDefaults)} defaults={calcDefaults} />
      <WhyCarnite />
      <ComparisonTable />
      <RatesTeaser />
      <Testimonials />
      <HowItWorks />
      <FAQ />
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand" />
        <TweakColor
          label="Accent color"
          value={t.accent}
          options={ACCENT_OPTIONS.map((o) => o.hex)}
          onChange={(v) => setTweak('accent', v)}
        />

        <TweakSection label="Hero copy" />
        <TweakText
          label="Headline"
          value={t.headline}
          placeholder="Use | to split lines"
          onChange={(v) => setTweak('headline', v)}
        />
        <TweakText
          label="Accent word"
          value={t.headlineAccent}
          onChange={(v) => setTweak('headlineAccent', v)}
        />
        <TweakText
          label="Subhead"
          value={t.heroSub}
          onChange={(v) => setTweak('heroSub', v)}
        />

        <TweakSection label="Calculator defaults" />
        <TweakRadio
          label="Default method"
          value={t.calcMethod}
          options={[
            { value: 'reducing', label: 'Reducing' },
            { value: 'flat',     label: 'Flat' },
            { value: 'compare',  label: 'Compare' },
          ]}
          onChange={(v) => setTweak('calcMethod', v)}
        />
        <TweakText  label="Car price (RM)"    value={t.calcPrice} onChange={(v) => setTweak('calcPrice', v)} />
        <TweakText  label="Down payment (RM)" value={t.calcDown}  onChange={(v) => setTweak('calcDown',  v)} />
        <TweakText  label="Interest rate (%)" value={t.calcRate}  onChange={(v) => setTweak('calcRate',  v)} />
        <TweakSlider
          label="Tenure"
          value={Number(t.calcYears) || 7}
          min={1} max={9} step={1} unit=" yrs"
          onChange={(v) => setTweak('calcYears', v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
