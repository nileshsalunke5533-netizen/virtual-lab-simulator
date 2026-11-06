import React from "react";
//NetworkDiagrams.jsx

/* ============================================================
   Shared Colors
============================================================ */

const BLUE = "#2c4fa0";
const GREEN = "#25a244";
const LIGHT = "#eef5ff";
const GRAY = "#5b6470";

// Compact diagram size
const DIAGRAM_STYLE = { width: "260px", height: "140px", maxWidth: "100%" };

/* ============================================================
   Shared Components
============================================================ */

function Line({ x1, y1, x2, y2 }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={GREEN}
      strokeWidth="3"
      strokeLinecap="round"
    />
  );
}

function Internet({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="18" fill="#d9ebff" stroke={BLUE} strokeWidth="2" />
      <text x={x} y={y + 34} fontSize="10" textAnchor="middle" fill={GRAY}>
        Internet
      </text>
    </g>
  );
}

function PC({ x, y, label = "PC" }) {
  return (
    <g>
      <rect x={x} y={y} width="28" height="20" rx="2" fill={BLUE} />
      <rect x={x + 8} y={y + 20} width="12" height="3" fill={GRAY} />
      <rect x={x + 5} y={y + 23} width="18" height="2" fill={GRAY} />
      <text x={x + 14} y={y + 38} fontSize="9" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function Server({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="26" height="34" rx="2" fill={BLUE} />
      <line x1={x + 5} y1={y + 10} x2={x + 21} y2={y + 10} stroke="#fff" />
      <line x1={x + 5} y1={y + 18} x2={x + 21} y2={y + 18} stroke="#fff" />
      <line x1={x + 5} y1={y + 26} x2={x + 21} y2={y + 26} stroke="#fff" />
      <text x={x + 13} y={y + 48} fontSize="9" textAnchor="middle">
        Server
      </text>
    </g>
  );
}

function RouterNode({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="70" height="34" rx="6" fill={BLUE} />
      <text x={x + 35} y={y + 22} fontSize="11" fill="white" textAnchor="middle">
        Router
      </text>
    </g>
  );
}

function SwitchNode({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="70" height="28" rx="5" fill="#315cb8" />
      <text x={x + 35} y={y + 18} fill="white" textAnchor="middle" fontSize="11">
        Switch
      </text>
    </g>
  );
}

function HubNode({ x, y }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx="28" ry="18" fill={BLUE} />
      <text x={x} y={y + 4} fill="white" textAnchor="middle" fontSize="11">
        Hub
      </text>
    </g>
  );
}

function BridgeNode({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="60" height="28" rx="4" fill={BLUE} />
      <text x={x + 30} y={y + 18} fill="white" fontSize="11" textAnchor="middle">
        Bridge
      </text>
    </g>
  );
}

function GatewayNode({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="70" height="34" rx="4" fill="#284d9f" />
      <text x={x + 35} y={y + 22} fill="white" fontSize="10" textAnchor="middle">
        Gateway
      </text>
    </g>
  );
}

function ModemNode({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="70" height="30" rx="15" fill={BLUE} />
      <text x={x + 35} y={y + 20} fill="white" textAnchor="middle" fontSize="11">
        Modem
      </text>
    </g>
  );
}

function RepeaterNode({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="18" fill={BLUE} />
      <text x={x} y={y + 4} fill="white" textAnchor="middle" fontSize="9">
        REP
      </text>
    </g>
  );
}

function AccessPointNode({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="58" height="26" rx="5" fill={BLUE} />
      <text x={x + 29} y={y + 17} fill="white" textAnchor="middle" fontSize="10">
        AP
      </text>
      <path d={`M ${x + 29} ${y - 2} q -10 -10 -20 -18`} stroke={GREEN} fill="none" strokeWidth="2" />
      <path d={`M ${x + 29} ${y - 2} q 10 -10 20 -18`} stroke={GREEN} fill="none" strokeWidth="2" />
    </g>
  );
}

function PrinterNode({ x, y }) {
  return (
    <g>
      <rect x={x} y={y - 8} width="26" height="10" fill="#c7cbd6" />
      <rect x={x - 2} y={y + 2} width="30" height="18" rx="2" fill={BLUE} />
      <rect x={x} y={y + 20} width="26" height="10" fill="#e7eaf2" stroke={GRAY} />
      <text x={x + 13} y={y + 42} fontSize="9" textAnchor="middle">
        Printer
      </text>
    </g>
  );
}

/* ============================================================
   Router Diagram
============================================================ */
function RouterDiagram() {
  return (
    <svg style={DIAGRAM_STYLE} viewBox="0 0 320 170">
      <Internet x={35} y={80} />
      <RouterNode x={110} y={63} />
      <PC x={255} y={10} label="PC" />
      <PC x={255} y={70} label="Laptop" />
      <Server x={255} y={120} />
      <Line x1={53} y1={80} x2={110} y2={80} />
      <Line x1={180} y1={80} x2={255} y2={20} />
      <Line x1={180} y1={80} x2={255} y2={80} />
      <Line x1={180} y1={80} x2={255} y2={137} />
    </svg>
  );
}

/* ============================================================
   Switch Diagram
============================================================ */
function SwitchDiagram() {
  return (
    <svg style={DIAGRAM_STYLE} viewBox="0 0 320 170">
      <SwitchNode x={125} y={70} />
      <PC x={20} y={20} label="PC" />
      <PC x={20} y={120} label="Printer" />
      <PC x={265} y={20} label="PC" />
      <Server x={265} y={110} />
      <Line x1={48} y1={30} x2={125} y2={84} />
      <Line x1={48} y1={130} x2={125} y2={84} />
      <Line x1={195} y1={84} x2={265} y2={30} />
      <Line x1={195} y1={84} x2={265} y2={126} />
    </svg>
  );
}

/* ============================================================
   Hub Diagram
============================================================ */
function HubDiagram() {
  return (
    <svg style={DIAGRAM_STYLE} viewBox="0 0 320 170">
      <HubNode x={160} y={85} />
      <PC x={25} y={20} label="PC-1" />
      <PC x={25} y={120} label="PC-2" />
      <PC x={265} y={20} label="PC-3" />
      <PC x={265} y={120} label="PC-4" />
      <Line x1={53} y1={30} x2={136} y2={74} />
      <Line x1={53} y1={130} x2={136} y2={96} />
      <Line x1={184} y1={74} x2={265} y2={30} />
      <Line x1={184} y1={96} x2={265} y2={130} />
    </svg>
  );
}

/* ============================================================
   Bridge Diagram
============================================================ */
function BridgeDiagram() {
  return (
    <svg style={DIAGRAM_STYLE} viewBox="0 0 340 170">
      <text x="50" y="18" textAnchor="middle" fontSize="10" fill={GRAY}>LAN 1</text>
      <text x="290" y="18" textAnchor="middle" fontSize="10" fill={GRAY}>LAN 2</text>
      <PC x={10} y={45} label="PC-A" />
      <PC x={10} y={110} label="PC-B" />
      <PC x={300} y={45} label="PC-C" />
      <PC x={300} y={110} label="PC-D" />
      <BridgeNode x={140} y={70} />
      <Line x1={38} y1={55} x2={140} y2={84} />
      <Line x1={38} y1={120} x2={140} y2={84} />
      <Line x1={200} y1={84} x2={300} y2={55} />
      <Line x1={200} y1={84} x2={300} y2={120} />
    </svg>
  );
}

/* ============================================================
   Gateway Diagram
============================================================ */
function GatewayDiagram() {
  return (
    <svg style={DIAGRAM_STYLE} viewBox="0 0 340 180">
      <Internet x={35} y={90} />
      <GatewayNode x={110} y={72} />
      <SwitchNode x={240} y={76} />
      <PC x={285} y={20} label="PC" />
      <Server x={285} y={115} />
      <Line x1={53} y1={90} x2={110} y2={90} />
      <Line x1={180} y1={90} x2={240} y2={90} />
      <Line x1={310} y1={76} x2={310} y2={40} />
      <Line x1={310} y1={104} x2={310} y2={132} />
    </svg>
  );
}

/* ============================================================
   Modem Diagram
============================================================ */
function ModemDiagram() {
  return (
    <svg style={DIAGRAM_STYLE} viewBox="0 0 340 180">
      <Internet x={35} y={90} />
      <ModemNode x={100} y={75} />
      <RouterNode x={205} y={73} />
      <Line x1={53} y1={90} x2={100} y2={90} />
      <Line x1={170} y1={90} x2={205} y2={90} />
      <PC x={285} y={20} label="PC" />
      <PC x={285} y={120} label="Laptop" />
      <Line x1={275} y1={90} x2={285} y2={30} />
      <Line x1={275} y1={90} x2={285} y2={130} />
    </svg>
  );
}

/* ============================================================
   Repeater Diagram
============================================================ */
function RepeaterDiagram() {
  return (
    <svg style={DIAGRAM_STYLE} viewBox="0 0 340 170">
      <PC x={15} y={65} label="PC-1" />
      <RepeaterNode x={170} y={80} />
      <PC x={295} y={65} label="PC-2" />
      <Line x1={43} y1={75} x2={152} y2={80} />
      <Line x1={188} y1={80} x2={295} y2={75} />
      <text x="170" y="130" textAnchor="middle" fontSize="11" fill={GRAY}>
        Signal Regeneration
      </text>
    </svg>
  );
}

/* ============================================================
   Access Point Diagram
============================================================ */
function AccessPointDiagram() {
  return (
    <svg style={DIAGRAM_STYLE} viewBox="0 0 340 190">
      <Internet x={35} y={95} />
      <RouterNode x={95} y={78} />
      <AccessPointNode x={225} y={82} />
      <Line x1={53} y1={95} x2={95} y2={95} />
      <Line x1={165} y1={95} x2={225} y2={95} />
      <PC x={260} y={10} label="Laptop" />
      <PC x={300} y={60} label="Phone" />
      <PC x={260} y={125} label="Tablet" />
      <line x1="254" y1="82" x2="274" y2="30" stroke={GREEN} strokeWidth="2" strokeDasharray="4 4" />
      <line x1="254" y1="95" x2="314" y2="75" stroke={GREEN} strokeWidth="2" strokeDasharray="4 4" />
      <line x1="254" y1="108" x2="274" y2="140" stroke={GREEN} strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  );
}

/* ============================================================
   Printer Diagram
============================================================ */
function PrinterDiagram() {
  return (
    <svg style={DIAGRAM_STYLE} viewBox="0 0 320 170">
      <SwitchNode x={130} y={70} />
      <PC x={20} y={20} label="PC-1" />
      <PC x={20} y={120} label="PC-2" />
      <PrinterNode x={260} y={75} />
      <Line x1={48} y1={30} x2={130} y2={84} />
      <Line x1={48} y1={130} x2={130} y2={84} />
      <Line x1={200} y1={84} x2={260} y2={84} />
    </svg>
  );
}

/* ============================================================
   PC / Workstation Diagram
============================================================ */
function PCDiagram() {
  return (
    <svg style={DIAGRAM_STYLE} viewBox="0 0 320 170">
      <text x="30" y="70" fontSize="9" fill={GRAY}>Wall</text>
      <rect x="20" y="78" width="16" height="18" fill="#c7cbd6" />
      <Line x1={36} y1={87} x2={130} y2={87} />
      <PC x={130} y={72} label="Lab PC" />
      <Line x1={158} y1={87} x2={230} y2={87} />
      <SwitchNode x={230} y={73} />
      <text x="265" y="55" fontSize="9" textAnchor="middle" fill={GRAY}>To Switch</text>
    </svg>
  );
}

/* ============================================================
   Reference Topology Diagram (used on Layout screen)
============================================================ */
export function ReferenceTopologyDiagram() {
  return (
    <svg style={DIAGRAM_STYLE} viewBox="0 0 320 170">
      <Internet x={35} y={85} />
      <RouterNode x={125} y={68} />
      <SwitchNode x={125} y={115} />
      <Line x1={53} y1={85} x2={125} y2={85} />
      <Line x1={160} y1={102} x2={160} y2={115} />
      <PC x={230} y={20} label="PC1" />
      <PC x={230} y={70} label="PC2" />
      <PC x={230} y={120} label="PC3" />
      <PrinterNode x={280} y={140} />
      <Line x1={195} y1={129} x2={230} y2={30} />
      <Line x1={195} y1={129} x2={230} y2={80} />
      <Line x1={195} y1={129} x2={230} y2={130} />
      <Line x1={195} y1={129} x2={280} y2={140} />
    </svg>
  );
}

/* ============================================================
   Main Component
============================================================ */

export default function NetworkDiagrams({ deviceKey }) {
  switch (deviceKey) {
    case "router":
      return <RouterDiagram />;

    case "switch":
      return <SwitchDiagram />;

    case "hub":
      return <HubDiagram />;

    case "bridge":
      return <BridgeDiagram />;

    case "gateway":
      return <GatewayDiagram />;

    case "modem":
      return <ModemDiagram />;

    case "repeater":
      return <RepeaterDiagram />;

    case "access-point":
      return <AccessPointDiagram />;

    case "printer":
      return <PrinterDiagram />;

    case "pc":
      return <PCDiagram />;

    default:
      return <RouterDiagram />;
  }
}