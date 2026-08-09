"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Destination = {
  id: string;
  name: string;
  short: string;
  detail: string;
  x: number;
  y: number;
  legs: number;
  symbol: string;
  bearing: string;
};

type ShipState = {
  hull: number;
  cheer: number;
  supplies: number;
};

type EventChoice = {
  label: string;
  note: string;
  effect: Partial<ShipState>;
};

type VoyageEvent = {
  id: string;
  type: string;
  icon: string;
  title: string;
  report: string;
  choices: [EventChoice, EventChoice];
};

type LogEntry = {
  time: string;
  text: string;
};

const destinations: Destination[] = [
  {
    id: "pillow",
    name: "Pillowfort Atoll",
    short: "Pillowfort",
    detail: "Soft shores, blanket reefs, and excellent snack anchorage.",
    x: 21,
    y: 25,
    legs: 3,
    symbol: "◒",
    bearing: "NNW",
  },
  {
    id: "galley",
    name: "Galley Bay",
    short: "Galley Bay",
    detail: "A warm harbor famous for cocoa currents and biscuit cargo.",
    x: 72,
    y: 23,
    legs: 3,
    symbol: "♨",
    bearing: "NE",
  },
  {
    id: "lookout",
    name: "Lookout Lighthouse",
    short: "Lookout",
    detail: "Climb high, sweep the horizon, and signal the whole fleet.",
    x: 84,
    y: 57,
    legs: 4,
    symbol: "✦",
    bearing: "ESE",
  },
  {
    id: "sofa",
    name: "Sofa Sea",
    short: "Sofa Sea",
    detail: "Deep blue cushions with mysterious creatures below.",
    x: 54,
    y: 74,
    legs: 4,
    symbol: "≈",
    bearing: "SSE",
  },
  {
    id: "bath",
    name: "Bubblewater Falls",
    short: "Bubblewater",
    detail: "A sparkling cascade where bath-toy boats gather.",
    x: 15,
    y: 70,
    legs: 4,
    symbol: "⁂",
    bearing: "SW",
  },
  {
    id: "moon",
    name: "Moonlight Cove",
    short: "Moonlight Cove",
    detail: "A hush-hush harbor best reached by lantern light.",
    x: 43,
    y: 42,
    legs: 3,
    symbol: "☾",
    bearing: "ENE",
  },
];

const voyageEvents: VoyageEvent[] = [
  {
    id: "squall",
    type: "WEATHER",
    icon: "☂",
    title: "Cushion Squall Ahead!",
    report: "A wall of wild wind is tossing cushions across the forward deck.",
    choices: [
      { label: "Lash the cargo", note: "Safe and steady", effect: { supplies: 4, hull: 2 } },
      { label: "Ride the gust", note: "Fast but bumpy", effect: { cheer: 8, hull: -6 } },
    ],
  },
  {
    id: "whale",
    type: "CREATURE",
    icon: "♬",
    title: "A Whale Is Singing",
    report: "A great blue shadow swims alongside, humming a three-note song.",
    choices: [
      { label: "Sing back", note: "Crew chorus", effect: { cheer: 10 } },
      { label: "Offer a biscuit", note: "A diplomatic snack", effect: { supplies: -6, cheer: 6 } },
    ],
  },
  {
    id: "fog",
    type: "NAVIGATION",
    icon: "≋",
    title: "Blanket Fog!",
    report: "The sea has vanished under a thick, quiet blanket of fog.",
    choices: [
      { label: "Sound the horn", note: "Make our position known", effect: { hull: 3 } },
      { label: "Follow the compass", note: "Trust the instruments", effect: { cheer: 4 } },
    ],
  },
  {
    id: "pirates",
    type: "ENCOUNTER",
    icon: "⚑",
    title: "Laundry Pirates!",
    report: "A basket-ship approaches under a striped sock flag. They demand tribute.",
    choices: [
      { label: "Challenge: dance-off", note: "All hands boogie", effect: { cheer: 12 } },
      { label: "Trade one sock", note: "Peaceful passage", effect: { supplies: -3, hull: 2 } },
    ],
  },
  {
    id: "engine",
    type: "ENGINEERING",
    icon: "⚙",
    title: "Rattle in the Engine Room",
    report: "Clank-clank-WHUM! The chief engineer requests immediate assistance.",
    choices: [
      { label: "Turn the big valve", note: "Three turns clockwise", effect: { hull: 8 } },
      { label: "Tap it gently", note: "The traditional repair", effect: { hull: 3, cheer: 4 } },
    ],
  },
  {
    id: "island",
    type: "DISCOVERY",
    icon: "✦",
    title: "Uncharted Snack Island",
    report: "Lookout reports a tiny island with a suspiciously delicious treasure chest.",
    choices: [
      { label: "Send a shore party", note: "Explore together", effect: { supplies: 10, cheer: 5 } },
      { label: "Mark it on the chart", note: "Save it for later", effect: { cheer: 3 } },
    ],
  },
  {
    id: "octopus",
    type: "CREATURE",
    icon: "❋",
    title: "Ticklish Octopus",
    report: "Eight curious arms are inspecting every porthole at once.",
    choices: [
      { label: "Wave eight times", note: "Proper octopus manners", effect: { cheer: 9 } },
      { label: "Deploy bubbles", note: "A sparkling distraction", effect: { supplies: -4, hull: 3 } },
    ],
  },
  {
    id: "current",
    type: "NAVIGATION",
    icon: "↝",
    title: "Backward Current",
    report: "The carpet current is pushing the whole ship toward yesterday.",
    choices: [
      { label: "Full steam ahead", note: "Power through", effect: { hull: -3, cheer: 5 } },
      { label: "Zigzag course", note: "Clever navigation", effect: { supplies: -2, hull: 3 } },
    ],
  },
  {
    id: "stars",
    type: "WONDER",
    icon: "✷",
    title: "Stars Below the Ship",
    report: "The sea turns dark and glittery. For one minute, down looks exactly like up.",
    choices: [
      { label: "Make a wish", note: "Everyone gets one", effect: { cheer: 12 } },
      { label: "Chart a new star", note: "Name it together", effect: { cheer: 8, supplies: 2 } },
    ],
  },
  {
    id: "cargo",
    type: "SHIPBOARD",
    icon: "▦",
    title: "Mystery Cargo Is Wiggling",
    report: "Crate number seven just sneezed. The manifest says it contains hats.",
    choices: [
      { label: "Open it carefully", note: "Prepare for anything", effect: { cheer: 7, supplies: 3 } },
      { label: "Ask it a question", note: "Use your captain voice", effect: { cheer: 9 } },
    ],
  },
  {
    id: "rainbow",
    type: "WEATHER",
    icon: "⌒",
    title: "Rainbow Waterspout",
    report: "A spinning ribbon of color is dancing directly across our course.",
    choices: [
      { label: "Sail through the colors", note: "Very sparkly", effect: { cheer: 10, hull: -2 } },
      { label: "Circle and salute", note: "A grand parade turn", effect: { cheer: 7 } },
    ],
  },
  {
    id: "message",
    type: "RADIO",
    icon: "⌁",
    title: "Tiny Radio Message",
    report: "A crackly voice whispers: ‘To the brave crew—look under the nearest chair.’",
    choices: [
      { label: "Investigate!", note: "Send the bravest scout", effect: { supplies: 7, cheer: 5 } },
      { label: "Reply in code", note: "Beep beep, boop boop", effect: { cheer: 8 } },
    ],
  },
];

const clamp = (value: number) => Math.max(0, Math.min(100, value));

const nowTime = () =>
  new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date());

export default function Home() {
  const [selectedId, setSelectedId] = useState("moon");
  const [phase, setPhase] = useState<"docked" | "underway" | "event" | "arrived">("docked");
  const [leg, setLeg] = useState(0);
  const [ship, setShip] = useState<ShipState>({ hull: 92, cheer: 76, supplies: 84 });
  const [eventIndex, setEventIndex] = useState(0);
  const [usedEvents, setUsedEvents] = useState<number[]>([]);
  const [engine, setEngine] = useState<"STOP" | "HALF" | "FULL">("STOP");
  const [soundOn, setSoundOn] = useState(true);
  const [lightsOn, setLightsOn] = useState(true);
  const [radarOn, setRadarOn] = useState(true);
  const [logOpen, setLogOpen] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([
    { time: "Now", text: "All stations ready. Awaiting the captain’s orders." },
  ]);
  const [announcement, setAnnouncement] = useState("Choose a destination on the chart.");
  const [hydrated, setHydrated] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  const destination = destinations.find((item) => item.id === selectedId) ?? destinations[0];
  const activeEvent = voyageEvents[eventIndex];
  const progress = phase === "arrived" ? 100 : Math.round((leg / destination.legs) * 100);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("hms-home-voyage-v1");
      if (saved) {
        const parsed = JSON.parse(saved) as {
          selectedId?: string;
          phase?: "docked" | "underway" | "event" | "arrived";
          leg?: number;
          ship?: ShipState;
          engine?: "STOP" | "HALF" | "FULL";
          log?: LogEntry[];
          usedEvents?: number[];
          eventIndex?: number;
        };
        if (parsed.selectedId && destinations.some((item) => item.id === parsed.selectedId)) {
          setSelectedId(parsed.selectedId);
        }
        if (parsed.phase) setPhase(parsed.phase);
        if (typeof parsed.leg === "number") setLeg(parsed.leg);
        if (parsed.ship) setShip(parsed.ship);
        if (parsed.engine) setEngine(parsed.engine);
        if (parsed.log?.length) setLog(parsed.log);
        if (parsed.usedEvents) setUsedEvents(parsed.usedEvents);
        if (typeof parsed.eventIndex === "number") setEventIndex(parsed.eventIndex);
      }
    } catch {
      // A fresh voyage is safer than blocking play on invalid saved data.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      "hms-home-voyage-v1",
      JSON.stringify({ selectedId, phase, leg, ship, engine, log, usedEvents, eventIndex }),
    );
  }, [selectedId, phase, leg, ship, engine, log, usedEvents, eventIndex, hydrated]);

  const weather = useMemo(() => {
    if (phase === "arrived") return { icon: "✦", label: "Clear harbor", temp: "CALM" };
    if (progress > 60) return { icon: "≋", label: "Rolling fog", temp: "MIST" };
    return { icon: "◒", label: "Cushion breeze", temp: "FAIR" };
  }, [phase, progress]);

  const addLog = (text: string) => {
    setLog((entries) => [{ time: nowTime(), text }, ...entries].slice(0, 16));
  };

  const playTone = (frequency: number, duration = 0.18, type: OscillatorType = "sine") => {
    if (!soundOn) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      const context = audioContext.current ?? new Context();
      audioContext.current = context;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.13, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration + 0.03);
    } catch {
      // Sound is optional; visual feedback remains available.
    }
  };

  const selectDestination = (item: Destination) => {
    if (phase !== "docked") return;
    setSelectedId(item.id);
    setAnnouncement(`${item.name} selected. Ready to cast off.`);
    playTone(430, 0.12, "triangle");
  };

  const castOff = () => {
    setPhase("underway");
    setLeg(0);
    setEngine("HALF");
    setShip({ hull: 92, cheer: 76, supplies: 84 });
    setUsedEvents([]);
    setAnnouncement(`Voyage to ${destination.name} is underway!`);
    addLog(`Cast off for ${destination.name}, bearing ${destination.bearing}.`);
    playTone(260, 0.22, "square");
    window.setTimeout(() => playTone(330, 0.28, "square"), 160);
  };

  const chooseNextEvent = () => {
    const available = voyageEvents.map((_, index) => index).filter((index) => !usedEvents.includes(index));
    const pool = available.length ? available : voyageEvents.map((_, index) => index);
    const next = pool[Math.floor(Math.random() * pool.length)];
    setEventIndex(next);
    setUsedEvents((items) => [...items, next]);
    setPhase("event");
    setAnnouncement("New report from the forward deck!");
    playTone(520, 0.1, "square");
    window.setTimeout(() => playTone(660, 0.12, "square"), 120);
  };

  const sailOn = () => {
    if (engine === "STOP") {
      setAnnouncement("Engine is at STOP. Set HALF or FULL to make way.");
      playTone(130, 0.14, "sawtooth");
      return;
    }
    chooseNextEvent();
  };

  const resolveEvent = (choice: EventChoice) => {
    setShip((current) => ({
      hull: clamp(current.hull + (choice.effect.hull ?? 0)),
      cheer: clamp(current.cheer + (choice.effect.cheer ?? 0)),
      supplies: clamp(current.supplies + (choice.effect.supplies ?? 0)),
    }));
    const nextLeg = leg + 1;
    setLeg(nextLeg);
    addLog(`${activeEvent.title} — crew chose “${choice.label}.”`);
    playTone(740, 0.16, "triangle");
    if (nextLeg >= destination.legs) {
      setPhase("arrived");
      setEngine("STOP");
      setAnnouncement(`Land ho! ${destination.name} is dead ahead.`);
      addLog(`Arrived safely at ${destination.name}. Voyage complete!`);
    } else {
      setPhase("underway");
      setAnnouncement(`${choice.label}! The ship sails on.`);
    }
  };

  const startNewVoyage = () => {
    setPhase("docked");
    setLeg(0);
    setEngine("STOP");
    setShip({ hull: 92, cheer: 76, supplies: 84 });
    setUsedEvents([]);
    setLog([{ time: nowTime(), text: "Ship reset at Home Harbor. Awaiting orders." }]);
    setAnnouncement("Choose our next destination, Captain.");
  };

  const setEngineSpeed = (speed: "STOP" | "HALF" | "FULL") => {
    setEngine(speed);
    setAnnouncement(`Engine telegraph set to ${speed}.`);
    addLog(`Engine order: ${speed}.`);
    playTone(speed === "STOP" ? 150 : speed === "HALF" ? 300 : 460, 0.15, "square");
  };

  const soundHorn = () => {
    setAnnouncement("BWAAAAAAH! Ship’s horn sounded.");
    playTone(155, 0.62, "sawtooth");
    window.setTimeout(() => playTone(130, 0.72, "sawtooth"), 180);
  };

  return (
    <main className={`bridge ${lightsOn ? "lights-on" : "night-watch"}`}>
      <header className="topbar">
        <div className="ship-mark" aria-label="HMS Home captain's bridge">
          <span className="ship-wheel" aria-hidden="true">✺</span>
          <div>
            <span className="eyebrow">CAPTAIN’S BRIDGE</span>
            <strong>H.M.S. HOME</strong>
          </div>
        </div>

        <div className="voyage-strip" aria-live="polite">
          <span className={`status-lamp ${phase !== "docked" ? "active" : ""}`} />
          <div>
            <span className="eyebrow">{phase === "docked" ? "IN HOME HARBOR" : phase === "arrived" ? "VOYAGE COMPLETE" : "VOYAGE 01 • UNDERWAY"}</span>
            <strong>{phase === "docked" ? "Awaiting orders" : `Course: ${destination.name}`}</strong>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`utility-button ${soundOn ? "active" : ""}`}
            onClick={() => setSoundOn((value) => !value)}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Mute ship sounds" : "Turn on ship sounds"}
          >
            <span aria-hidden="true">{soundOn ? "♫" : "×"}</span>
            {soundOn ? "SOUND ON" : "MUTED"}
          </button>
          <button className="utility-button" onClick={() => setLogOpen(true)}>
            <span aria-hidden="true">▤</span> LOGBOOK
          </button>
        </div>
      </header>

      <section className="bridge-grid">
        <section className="panel chart-panel" aria-labelledby="chart-title">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">HOME WATERS • CHART 01</span>
              <h1 id="chart-title">THE GREAT INDOOR SEA</h1>
            </div>
            <div className="coordinates">
              <span>48° HOME</span>
              <strong>{destination.bearing}</strong>
            </div>
          </div>

          <div className="chart" aria-label="Map of house destinations">
            <div className="chart-grid" aria-hidden="true" />
            <div className="depth depth-one" aria-hidden="true">120</div>
            <div className="depth depth-two" aria-hidden="true">80</div>
            <div className="depth depth-three" aria-hidden="true">40</div>
            <div className="home-harbor" aria-label="Current location: Home Harbor">
              <span className="boat-icon" aria-hidden="true">▲</span>
              <div><b>H.M.S. HOME</b><small>HOME HARBOR</small></div>
            </div>

            {phase !== "docked" && (
              <div
                className="route-line"
                style={{
                  width: `${Math.hypot(destination.x - 49, destination.y - 56)}%`,
                  transform: `rotate(${Math.atan2(destination.y - 56, destination.x - 49) * (180 / Math.PI)}deg)`,
                }}
                aria-hidden="true"
              >
                <span style={{ left: `${progress}%` }} className="route-ship">◆</span>
              </div>
            )}

            {destinations.map((item) => {
              const active = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  className={`map-port ${active ? "selected" : ""} ${phase !== "docked" ? "locked" : ""}`}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  onClick={() => selectDestination(item)}
                  aria-pressed={active}
                  aria-label={`${item.name}. ${item.detail}`}
                >
                  <span className="port-symbol" aria-hidden="true">{item.symbol}</span>
                  <span className="port-label">{item.short}</span>
                </button>
              );
            })}

            <div className="compass" aria-label={`Compass bearing ${destination.bearing}`}>
              <span>N</span>
              <div className="compass-ring"><i /></div>
              <small>{destination.bearing}</small>
            </div>
            <div className="chart-legend"><i /> SAFE PASSAGE <span>•</span> TAP A PORT</div>
          </div>

          <div className="destination-dock">
            <div className="destination-symbol" aria-hidden="true">{destination.symbol}</div>
            <div className="destination-copy">
              <span className="eyebrow">{phase === "docked" ? "SELECTED DESTINATION" : "CURRENT DESTINATION"}</span>
              <h2>{destination.name}</h2>
              <p>{destination.detail}</p>
            </div>
            <div className="distance-block">
              <span>PASSAGES</span>
              <strong>{destination.legs}</strong>
            </div>
            {phase === "docked" ? (
              <button className="primary-button" onClick={castOff}>CAST OFF <span>→</span></button>
            ) : phase === "arrived" ? (
              <button className="primary-button" onClick={startNewVoyage}>NEW VOYAGE <span>↻</span></button>
            ) : (
              <div className="progress-block" aria-label={`${progress}% of voyage completed`}>
                <div><span>VOYAGE PROGRESS</span><strong>{progress}%</strong></div>
                <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
              </div>
            )}
          </div>
        </section>

        <section className="middle-stack" aria-label="Voyage reports and ship status">
          <section className={`panel report-panel ${phase === "event" ? "urgent" : ""}`}>
            {phase === "docked" && (
              <div className="mission-state">
                <span className="state-icon">⚓</span>
                <span className="eyebrow">CAPTAIN’S ORDERS</span>
                <h2>Where shall we sail today?</h2>
                <p>Choose a port on the chart, gather the crew, and cast off when everyone is aboard.</p>
                <div className="crew-call">
                  <span>1</span><b>Choose</b><i />
                  <span>2</span><b>Cast off</b><i />
                  <span>3</span><b>Sail</b>
                </div>
              </div>
            )}

            {phase === "underway" && (
              <div className="mission-state underway-state">
                <span className="state-icon wake">≈</span>
                <span className="eyebrow">NEXT PASSAGE • {leg + 1} OF {destination.legs}</span>
                <h2>The open house-sea awaits.</h2>
                <p>Check the engine order, scan the radar, then lead the crew into the next stretch of water.</p>
                <button className="passage-button" onClick={sailOn}>
                  <span>SAIL THE NEXT PASSAGE</span>
                  <b>ALL HANDS READY →</b>
                </button>
              </div>
            )}

            {phase === "event" && (
              <div className="event-card" role="dialog" aria-modal="true" aria-labelledby="event-title">
                <div className="event-ribbon"><span>●</span> INCOMING REPORT • {activeEvent.type}</div>
                <div className="event-icon" aria-hidden="true">{activeEvent.icon}</div>
                <h2 id="event-title">{activeEvent.title}</h2>
                <p>{activeEvent.report}</p>
                <div className="choice-list">
                  {activeEvent.choices.map((choice, index) => (
                    <button key={choice.label} onClick={() => resolveEvent(choice)}>
                      <span className="choice-key">{String.fromCharCode(65 + index)}</span>
                      <span><b>{choice.label}</b><small>{choice.note}</small></span>
                      <i>→</i>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === "arrived" && (
              <div className="mission-state arrival-state">
                <span className="state-icon">⚑</span>
                <span className="eyebrow">LAND HO • VOYAGE COMPLETE</span>
                <h2>Welcome to {destination.name}!</h2>
                <p>The anchor is down and the crew has earned a grand captain’s cheer.</p>
                <div className="arrival-score">
                  <div><span>SEAMANSHIP</span><strong>{Math.round((ship.hull + ship.supplies) / 2)}</strong></div>
                  <div><span>CREW SPIRIT</span><strong>{ship.cheer}</strong></div>
                </div>
                <button className="celebrate-button" onClick={soundHorn}>SOUND THE ARRIVAL HORN</button>
              </div>
            )}
          </section>

          <section className="panel status-panel">
            <div className="mini-heading"><span>SHIP’S CONDITION</span><b>ALL SYSTEMS</b></div>
            <Gauge label="HULL" value={ship.hull} color="teal" />
            <Gauge label="CREW CHEER" value={ship.cheer} color="gold" />
            <Gauge label="SUPPLIES" value={ship.supplies} color="coral" />
          </section>

          <div className="announcement" aria-live="polite">
            <span aria-hidden="true">⌁</span><p>{announcement}</p>
          </div>
        </section>

        <aside className="instrument-stack" aria-label="Ship controls">
          <section className="panel weather-panel">
            <div className="mini-heading"><span>WEATHER STATION</span><b>{weather.temp}</b></div>
            <div className="weather-readout">
              <span className="weather-icon" aria-hidden="true">{weather.icon}</span>
              <div><strong>{weather.label}</strong><small>Wind 3 knots • Indoors</small></div>
            </div>
          </section>

          <section className="panel radar-panel">
            <div className="mini-heading">
              <span>RADAR • 5 NM</span>
              <button className={radarOn ? "toggle-on" : ""} onClick={() => setRadarOn((value) => !value)} aria-pressed={radarOn}>
                {radarOn ? "ON" : "OFF"}
              </button>
            </div>
            <button className={`radar ${radarOn ? "scanning" : ""}`} onClick={() => setAnnouncement(radarOn ? "Radar contact: one friendly sea creature nearby." : "Radar is powered down.")} aria-label="Scan radar">
              <i className="radar-sweep" />
              <span className="radar-ring ring-one" />
              <span className="radar-ring ring-two" />
              <span className="radar-ring ring-three" />
              {radarOn && <><b className="contact contact-one" /><b className="contact contact-two" /></>}
              <em>HMS</em>
            </button>
            <div className="radar-caption"><i /> {radarOn ? "2 FRIENDLY CONTACTS" : "STANDBY"}</div>
          </section>

          <section className="panel telegraph-panel">
            <div className="mini-heading"><span>ENGINE TELEGRAPH</span><b>{engine}</b></div>
            <div className="telegraph">
              {(["STOP", "HALF", "FULL"] as const).map((speed) => (
                <button key={speed} className={engine === speed ? "selected" : ""} onClick={() => setEngineSpeed(speed)} aria-pressed={engine === speed}>
                  <span>{speed === "STOP" ? "■" : speed === "HALF" ? "▶" : "▶▶"}</span>{speed}
                </button>
              ))}
            </div>
          </section>

          <section className="toy-grid">
            <button className="toy-button horn" onClick={soundHorn}>
              <span aria-hidden="true">◖</span><b>SHIP’S HORN</b><small>PRESS &amp; SOUND</small>
            </button>
            <button className={`toy-button ${lightsOn ? "active" : ""}`} onClick={() => { setLightsOn((value) => !value); setAnnouncement(lightsOn ? "Night watch lighting engaged." : "Cabin lights restored."); }} aria-pressed={lightsOn}>
              <span aria-hidden="true">☼</span><b>CABIN LIGHTS</b><small>{lightsOn ? "GLOWING" : "NIGHT WATCH"}</small>
            </button>
          </section>
        </aside>
      </section>

      {logOpen && (
        <div className="drawer-scrim" role="presentation" onMouseDown={() => setLogOpen(false)}>
          <aside className="log-drawer" role="dialog" aria-modal="true" aria-labelledby="log-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="log-top">
              <div><span className="eyebrow">H.M.S. HOME • VOYAGE 01</span><h2 id="log-title">Captain’s Log</h2></div>
              <button onClick={() => setLogOpen(false)} aria-label="Close logbook">×</button>
            </div>
            <div className="log-rule" />
            <div className="log-entries">
              {log.map((entry, index) => (
                <article key={`${entry.time}-${index}`}>
                  <time>{entry.time}</time><p>{entry.text}</p>
                </article>
              ))}
            </div>
            <button className="new-voyage-link" onClick={() => { startNewVoyage(); setLogOpen(false); }}>RESET AT HOME HARBOR</button>
          </aside>
        </div>
      )}
    </main>
  );
}

function Gauge({ label, value, color }: { label: string; value: number; color: "teal" | "gold" | "coral" }) {
  return (
    <div className="gauge">
      <div><span>{label}</span><strong>{value}%</strong></div>
      <div className="gauge-track"><i className={color} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
