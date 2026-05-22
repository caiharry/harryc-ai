// Shared hooks used across all three directions.
const { useState, useEffect, useRef } = React;

// Types text out one character at a time. Returns the partial string.
// onDone fires once when finished.
function useTypewriter(text, { speed = 22, startDelay = 200, enabled = true, onDone } = {}) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  useEffect(() => {
    if (!enabled) { setOut(text); setDone(true); return; }
    setOut("");
    setDone(false);
    doneRef.current = false;
    let i = 0;
    let timer;
    const start = setTimeout(function tick() {
      if (i >= text.length) {
        if (!doneRef.current) { doneRef.current = true; setDone(true); onDone && onDone(); }
        return;
      }
      i += 1;
      setOut(text.slice(0, i));
      timer = setTimeout(tick, speed);
    }, startDelay);
    return () => { clearTimeout(start); clearTimeout(timer); };
  }, [text, speed, startDelay, enabled]);
  return [out, done];
}

// Cycles through an array of strings with a typewriter effect on each.
function useRotatingTypewriter(items, { speed = 40, holdMs = 1800, deleteSpeed = 18 } = {}) {
  const [out, setOut] = useState("");
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let timer;
    const target = items[idx % items.length];
    let i = 0;
    function typeIn() {
      if (cancelled) return;
      if (i < target.length) {
        i += 1;
        setOut(target.slice(0, i));
        timer = setTimeout(typeIn, speed);
      } else {
        timer = setTimeout(typeOut, holdMs);
      }
    }
    function typeOut() {
      if (cancelled) return;
      if (i > 0) {
        i -= 1;
        setOut(target.slice(0, i));
        timer = setTimeout(typeOut, deleteSpeed);
      } else {
        setIdx((n) => n + 1);
      }
    }
    typeIn();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [idx]);
  return out;
}

// Blinking cursor character.
function BlinkCursor({ char = "█", color }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return <span style={{ opacity: on ? 1 : 0, color, transition: "opacity 80ms" }}>{char}</span>;
}

// IntersectionObserver helper.
function useInView(ref, { threshold = 0.15, once = true } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      });
    }, { threshold });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return inView;
}

Object.assign(window, { useTypewriter, useRotatingTypewriter, BlinkCursor, useInView });
