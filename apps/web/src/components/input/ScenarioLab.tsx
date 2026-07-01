"use client";
// =============================================================================
// STAR — Scenario Lab  (/input)
// ForceGraph2D + collapsible sidebar + node-click IF scoring + animated flows
// Architecture mirrors TGNNDashboard exactly: same canvas graph, same layout
// =============================================================================
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  FlaskConical, Plus, Play, Trash2, AlertTriangle, CheckCircle,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  X, RotateCcw, Zap, Shield, Info, Activity,
} from "lucide-react";

// ForceGraph2D — no SSR (uses canvas)
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────
interface TxInput {
  from_account: string; to_account: string; amount: number;
  currency: string; payment_format: string; account_age_days: number | null;
  account_type: string; declared_business: string; kyc_method: string;
}

interface CtxTag { tag: string; label: string; severity: string; reason: string; category: string; }

interface TxResult {
  tx_id: string; from_account: string; to_account: string;
  amount: number; currency: string; payment_format: string;
  gnn_score: number; risk_score: number; tgnn_label: string;
  is_alert: boolean; reasons: string[]; contextual_tags: CtxTag[];
  account_age_days: number | null; account_type: string;
}

interface FGNode {
  id: string; risk_score: number; is_alert: boolean; label: string;
  x?: number; y?: number; vx?: number; vy?: number;
}
interface FGLink {
  source: string | FGNode; target: string | FGNode;
  tx_id: string; amount: number; risk_score: number;
  is_alert: boolean; tgnn_label: string; currency: string; format: string;
}

interface Summary {
  total: number; alerts: number; clean: number; avg_risk: number;
  typologies_detected: string[]; context_tags_fired: string[]; tgnn_available: boolean;
}

interface AnalysisResult {
  transactions: TxResult[];
  graph: { nodes: FGNode[]; links: FGLink[] };
  summary: Summary;
}

interface NodeRisk {
  account_id: string; risk_score: number; risk_level: string;
  features: Record<string, number>; top_signals: string[];
  if_available: boolean; txn_count: number;
  involvement: { sent: number; received: number };
}

// ── Colour helpers ─────────────────────────────────────────────────────────────
const LABEL_COLORS: Record<string, string> = {
  Circular:"#8B5CF6", Dispersion:"#F97316", Gathering:"#3B82F6",
  Layering:"#EC4899", Structuring:"#EAB308", Anomaly:"#EF4444", Normal:"#22C55E",
};
const SEV_COLORS: Record<string, string> = {
  critical:"#EF4444", high:"#F97316", medium:"#EAB308", low:"#3B82F6",
};
const RISK_COLOR = (r: number) => r >= 70 ? "#EF4444" : r >= 40 ? "#F97316" : "#22C55E";

// ── Preset scenarios ──────────────────────────────────────────────────────────
const SCENARIOS = [
  { key:"structuring_chain",     label:"💰 Structuring",    desc:"3× just-below-$10k transfers. CTR evasion via repeated near-threshold amounts." },
  { key:"crypto_exit_layering",  label:"₿ Crypto Exit",     desc:"Multi-hop ending in Bitcoin. Funds disappear into untraceable crypto off-ramp." },
  { key:"dormant_reactivation",  label:"💤 Dormant Acct",   desc:"Account silent for 2 years suddenly sends $250k wire — reactivation fraud." },
  { key:"mule_network",          label:"🕸 Mule Network",   desc:"Agent-KYC new accounts dispersing funds — UPI/mobile mule recruitment." },
  { key:"shell_company_circular",label:"🔄 Shell Circular",  desc:"Company accounts forming a closed loop — round-trip loan-back scheme." },
  { key:"profile_mismatch",      label:"🍕 Front Biz",      desc:"Restaurant declaring $180k cash flow — front business laundering." },
  { key:"fan_out_dispersion",    label:"📡 Dispersion",     desc:"1 source dispersing to 5 receivers — smurfing fan-out pattern." },
  { key:"layering_deep",         label:"🧅 Deep Layering",  desc:"5-hop passthrough chain ending in BTC — maximum layering depth." },
];

const EMPTY_TX: TxInput = {
  from_account:"", to_account:"", amount:9500, currency:"USD",
  payment_format:"Wire", account_age_days:null, account_type:"Personal",
  declared_business:"", kyc_method:"Branch",
};

// ── Tag badge with tooltip ────────────────────────────────────────────────────
function TagBadge({ tag }: { tag: CtxTag }) {
  const [show, setShow] = useState(false);
  const c = SEV_COLORS[tag.severity] || "#64748B";
  return (
    <span style={{ position:"relative", display:"inline-block" }}>
      <span onClick={() => setShow(v => !v)} style={{
        display:"inline-flex", alignItems:"center", gap:3, cursor:"pointer",
        padding:"2px 7px", borderRadius:99, fontSize:9, fontWeight:700,
        background:`${c}18`, border:`1px solid ${c}50`, color:c, whiteSpace:"nowrap",
      }}>{tag.label}</span>
      {show && (
        <div onClick={() => setShow(false)} style={{
          position:"absolute", bottom:"calc(100% + 6px)", left:0, zIndex:200,
          background:"#1E2A3A", border:"1px solid #334155", borderRadius:8,
          padding:"10px 12px", width:240, boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span style={{ color:c, fontWeight:700, fontSize:10 }}>{tag.label}</span>
            <span style={{ color:"#475569", fontSize:9 }}>{tag.category}</span>
          </div>
          <p style={{ color:"#94A3B8", fontSize:10, lineHeight:1.5, margin:0 }}>{tag.reason}</p>
        </div>
      )}
    </span>
  );
}

// ── Result row ────────────────────────────────────────────────────────────────
function ResultRow({ r }: { r: TxResult }) {
  const [open, setOpen] = useState(false);
  const lc = LABEL_COLORS[r.tgnn_label] || "#64748B";
  const rc = RISK_COLOR(r.risk_score);
  return (
    <>
      <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}
        onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.03)")}
        onMouseLeave={e => (e.currentTarget.style.background="transparent")}>
        <td style={{ padding:"7px 10px", color:"#64748B", fontSize:10 }}>{r.tx_id}</td>
        <td style={{ padding:"7px 10px", fontSize:10 }}>
          <span style={{ color:"#93C5FD" }}>{r.from_account}</span>
          <span style={{ color:"#334155", margin:"0 4px" }}>→</span>
          <span style={{ color:"#CBD5E1" }}>{r.to_account}</span>
        </td>
        <td style={{ padding:"7px 10px", color:"#E2E8F0", fontSize:10, fontWeight:600 }}>
          ${r.amount.toLocaleString()} <span style={{ color:"#475569", fontWeight:400, fontSize:9 }}>{r.currency}</span>
        </td>
        <td style={{ padding:"7px 10px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ flex:1, background:"#0F172A", borderRadius:99, height:4 }}>
              <div style={{ width:`${r.risk_score}%`, background:rc, height:"100%", borderRadius:99, transition:"width 0.5s" }} />
            </div>
            <span style={{ color:rc, fontSize:10, fontWeight:700, minWidth:30 }}>{r.risk_score}%</span>
          </div>
        </td>
        <td style={{ padding:"7px 10px" }}>
          <span style={{ padding:"2px 7px", borderRadius:99, fontSize:9, fontWeight:700,
            background:`${lc}20`, border:`1px solid ${lc}60`, color:lc }}>{r.tgnn_label}</span>
        </td>
        <td style={{ padding:"7px 10px" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
            {r.contextual_tags.slice(0,3).map(t => <TagBadge key={t.tag} tag={t} />)}
            {r.contextual_tags.length > 3 && <span style={{ fontSize:9, color:"#475569" }}>+{r.contextual_tags.length-3}</span>}
          </div>
        </td>
        <td style={{ padding:"7px 10px", textAlign:"center" }}>
          {r.is_alert ? <AlertTriangle size={13} style={{ color:"#EF4444" }} /> : <CheckCircle size={13} style={{ color:"#22C55E" }} />}
        </td>
        <td style={{ padding:"7px 4px" }}>
          <button onClick={() => setOpen(v => !v)} style={{ background:"none", border:"none", cursor:"pointer", color:"#475569" }}>
            {open ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={8} style={{ padding:"0 10px 10px" }}>
            <div style={{ background:"#0A1525", borderRadius:8, padding:"10px 12px", marginTop:4 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <p style={{ color:"#475569", fontSize:9, fontWeight:600, marginBottom:5, textTransform:"uppercase" }}>Rule Engine Reasons</p>
                  {r.reasons.map((rz,i) => <div key={i} style={{ display:"flex", gap:5, marginBottom:3 }}>
                    <span style={{ color:"#F97316", fontSize:10 }}>•</span>
                    <span style={{ color:"#94A3B8", fontSize:10 }}>{rz}</span>
                  </div>)}
                </div>
                <div>
                  <p style={{ color:"#475569", fontSize:9, fontWeight:600, marginBottom:5, textTransform:"uppercase" }}>Contextual Red Flags</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                    {r.contextual_tags.length > 0
                      ? r.contextual_tags.map(t => <TagBadge key={t.tag} tag={t} />)
                      : <span style={{ color:"#334155", fontSize:10 }}>No flags fired</span>}
                  </div>
                  <div style={{ marginTop:8, display:"flex", gap:12 }}>
                    {[["GNN Score",(r.gnn_score*100).toFixed(1)+"%"],["Age",r.account_age_days!=null?`${r.account_age_days}d`:"?"],["Type",r.account_type]].map(([k,v])=>(
                      <div key={k}><div style={{ color:"#475569", fontSize:9 }}>{k}</div><div style={{ color:"#CBD5E1", fontSize:11, fontWeight:700 }}>{v}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Node Risk Panel (shown when user clicks a graph node) ─────────────────────
function NodePanel({ nodeRisk, onClose }: { nodeRisk: NodeRisk; onClose: () => void }) {
  const rc = RISK_COLOR(nodeRisk.risk_score);
  const topFeats = Object.entries(nodeRisk.features)
    .sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0,8);

  return (
    <div style={{
      position:"absolute", top:12, right:12, width:280, zIndex:100,
      background:"rgba(15,23,42,0.97)", border:"1px solid #334155",
      borderRadius:12, padding:16, boxShadow:"0 12px 40px rgba(0,0,0,0.6)",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <Shield size={14} style={{ color:"#6366F1" }} />
          <span style={{ color:"#F1F5F9", fontWeight:700, fontSize:13 }}>Node Risk</span>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer" }}><X size={14}/></button>
      </div>

      <div style={{ background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.4)", borderRadius:6, padding:"6px 8px", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
        <CheckCircle size={12} style={{ color:"#22C55E" }} />
        <span style={{ color:"#86EFAC", fontSize:9, fontWeight:600 }}>Success: Scored via Isolation Forest Trained Weights</span>
      </div>

      <div style={{ marginBottom:10 }}>
        <div style={{ color:"#64748B", fontSize:10, marginBottom:2 }}>Account</div>
        <div style={{ color:"#93C5FD", fontWeight:700, fontSize:12 }}>{nodeRisk.account_id}</div>
      </div>

      <div style={{ display:"flex", gap:12, marginBottom:12 }}>
        <div>
          <div style={{ color:"#64748B", fontSize:9 }}>IF Risk Score</div>
          <div style={{ color:rc, fontWeight:800, fontSize:22 }}>{nodeRisk.risk_score}%</div>
        </div>
        <div>
          <div style={{ color:"#64748B", fontSize:9 }}>Level</div>
          <div style={{ color:rc, fontWeight:700, fontSize:13, textTransform:"capitalize" }}>{nodeRisk.risk_level}</div>
        </div>
        <div>
          <div style={{ color:"#64748B", fontSize:9 }}>TXs Sent/Recv</div>
          <div style={{ color:"#CBD5E1", fontWeight:700, fontSize:13 }}>{nodeRisk.involvement?.sent || 0} / {nodeRisk.involvement?.received || 0}</div>
        </div>
      </div>

      <div style={{ background:"#0F172A", borderRadius:6, padding:"6px 8px", marginBottom:10 }}>
        <div style={{ height:4, background:"#1E2A3A", borderRadius:99, overflow:"hidden" }}>
          <div style={{ width:`${nodeRisk.risk_score}%`, background:`linear-gradient(90deg, ${rc}88, ${rc})`, height:"100%", transition:"width 0.8s", borderRadius:99 }} />
        </div>
      </div>

      <div style={{ marginBottom:10 }}>
        <div style={{ color:"#475569", fontSize:9, fontWeight:600, marginBottom:5, textTransform:"uppercase" }}>Top IF Signals</div>
        {nodeRisk.top_signals.map((s,i) => (
          <div key={i} style={{ display:"flex", gap:5, marginBottom:3 }}>
            <span style={{ color:"#EAB308", fontSize:10 }}>⚑</span>
            <span style={{ color:"#94A3B8", fontSize:10, lineHeight:1.4 }}>{s}</span>
          </div>
        ))}
      </div>

      {topFeats.length > 0 && (
        <div>
          <div style={{ color:"#475569", fontSize:9, fontWeight:600, marginBottom:5, textTransform:"uppercase" }}>Feature Scores</div>
          {topFeats.map(([k, v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:3, alignItems:"center" }}>
              <span style={{ color:"#64748B", fontSize:9 }}>{k.replace(/_/g," ")}</span>
              <span style={{ color: Math.abs(v)>0.5?"#F97316":"#64748B", fontSize:10, fontWeight:600 }}>{(v as number).toFixed(3)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ScenarioLab() {
  const [txList, setTxList]         = useState<TxInput[]>([]);
  const [form, setForm]             = useState<TxInput>({ ...EMPTY_TX });
  const [result, setResult]         = useState<AnalysisResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [loadingScen, setLoadingScen] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab]   = useState<"graph"|"table">("graph");
  const [selectedNode, setSelectedNode] = useState<FGNode | null>(null);
  const [nodeRisk, setNodeRisk]     = useState<NodeRisk | null>(null);
  const [loadingNode, setLoadingNode] = useState(false);
  const graphRef = useRef<any>(null);

  // ── Load preset scenario from backend ──────────────────────────────────────
  const loadScenario = async (key: string) => {
    setLoadingScen(key);
    setError(null);
    try {
      const r = await fetch(`${API}/input/scenarios/${key}`);
      const data = await r.json();
      const mapped: TxInput[] = (data.transactions || []).map((t: any) => ({
        from_account: t.from_account, to_account: t.to_account,
        amount: t.amount, currency: t.currency || "USD",
        payment_format: t.payment_format || "Wire",
        account_age_days: t.account_age_days ?? null,
        account_type: t.account_type || "Personal",
        declared_business: t.declared_business || "",
        kyc_method: t.kyc_method || "Branch",
      }));
      setTxList(mapped);
      setResult(null);
      setSelectedNode(null);
      setNodeRisk(null);
    } catch {
      setError("Failed to load scenario");
    } finally {
      setLoadingScen(null);
    }
  };

  // ── Run TGNN analysis on current txList ───────────────────────────────────
  const runAnalysis = async () => {
    if (txList.length === 0) return;
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    setNodeRisk(null);
    try {
      const res = await fetch(`${API}/input/analyze`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ transactions: txList }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: AnalysisResult = await res.json();
      setResult(data);
      setActiveTab("graph");
      setTimeout(() => graphRef.current?.zoomToFit(800, 40), 800);
    } catch (e: any) {
      setError(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Node click → IF scoring ──────────────────────────────────────────────
  const onNodeClick = useCallback(async (node: FGNode) => {
    if (txList.length === 0) return;
    setSelectedNode(node);
    setLoadingNode(true);
    try {
      const res = await fetch(`${API}/input/node-risk`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ account_id: node.id, transactions: txList }),
      });
      const data: NodeRisk = await res.json();
      setNodeRisk(data);
    } catch {
      setNodeRisk(null);
    } finally {
      setLoadingNode(false);
    }
  }, [txList]);

  // ── ForceGraph node painter ───────────────────────────────────────────────
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, scale: number) => {
    // Guard: x/y are undefined during the first simulation ticks
    const nx: number = node.x ?? 0;
    const ny: number = node.y ?? 0;
    if (!isFinite(nx) || !isFinite(ny)) return;

    const r = 6 + Math.min((node.risk_score || 0) / 20, 4);
    const isSelected = selectedNode?.id === node.id;
    const isAlert = node.is_alert;

    // Glow for selected
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(nx, ny, r + 6, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(99,102,241,0.2)";
      ctx.fill();
    }

    // Pulse ring for alert nodes
    if (isAlert) {
      ctx.beginPath();
      ctx.arc(nx, ny, r + 3, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(239,68,68,0.4)";
      ctx.lineWidth = 1.5 / scale;
      ctx.stroke();
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(nx, ny, r, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(nx - 1, ny - 1, 0, nx, ny, r);
    if (isAlert) {
      grad.addColorStop(0, "#7F1D1D");
      grad.addColorStop(1, "#EF4444");
    } else if (isSelected) {
      grad.addColorStop(0, "#4338CA");
      grad.addColorStop(1, "#6366F1");
    } else {
      grad.addColorStop(0, "#1E3A5F");
      grad.addColorStop(1, "#1A56DB");
    }
    ctx.fillStyle = grad;
    ctx.fill();

    // Border
    ctx.strokeStyle = isSelected ? "#818CF8" : isAlert ? "#DC2626" : "#3B82F6";
    ctx.lineWidth = (isSelected ? 2 : 1) / scale;
    ctx.stroke();

    // Label
    const label = node.id.length > 10 ? node.id.slice(0, 10) : node.id;
    ctx.font = `${Math.max(3, 4 / scale)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#E2E8F0";
    ctx.fillText(label, nx, ny + r + 5 / scale);

    // Risk % under label
    if (node.risk_score > 0) {
      ctx.font = `bold ${Math.max(2.5, 3.5 / scale)}px Inter, sans-serif`;
      ctx.fillStyle = RISK_COLOR(node.risk_score);
      ctx.fillText(`${node.risk_score.toFixed(0)}%`, nx, ny + r + 10 / scale);
    }
  }, [selectedNode]);

  // ── ForceGraph link painter (animated flow arrows) ────────────────────────
  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const start = link.source as FGNode;
    const end   = link.target as FGNode;
    if (start?.x == null || end?.x == null) return;

    // Destructure with explicit non-null defaults so TS treats them as number
    const sx = start.x ?? 0, sy = start.y ?? 0;
    const ex = end.x   ?? 0, ey = end.y   ?? 0;

    const isAlert = link.is_alert;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = isAlert ? "rgba(239,68,68,0.7)" : "rgba(51,65,85,0.6)";
    ctx.lineWidth = isAlert ? 1.5 : 0.8;
    ctx.stroke();

    // Directional arrow at 60% along edge
    const angle = Math.atan2(ey - sy, ex - sx);
    const mx = sx + (ex - sx) * 0.6;
    const my = sy + (ey - sy) * 0.6;
    const aLen = 5;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx - aLen * Math.cos(angle - 0.4), my - aLen * Math.sin(angle - 0.4));
    ctx.lineTo(mx - aLen * Math.cos(angle + 0.4), my - aLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = isAlert ? "#EF4444" : "#475569";
    ctx.fill();

    // Amount label on edge
    const amtStr = `$${(link.amount as number).toLocaleString()}`;
    ctx.font = "3px Inter, sans-serif";
    ctx.fillStyle = isAlert ? "#FCA5A5" : "#64748B";
    ctx.textAlign = "center";
    ctx.fillText(amtStr, mx, my - 4);
  }, []);

  const F = (field: keyof TxInput, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const addTx = () => {
    if (!form.from_account.trim() || !form.to_account.trim()) return;
    setTxList(prev => [...prev, { ...form }]);
    setForm({ ...EMPTY_TX });
  };

  const removeTx = (i: number) => setTxList(prev => prev.filter((_,j) => j !== i));

  const inputSx: React.CSSProperties = {
    background:"rgba(15,23,42,0.8)", border:"1px solid #334155",
    borderRadius:6, color:"#E2E8F0", fontSize:11, padding:"5px 8px",
    outline:"none", width:"100%",
  };

  const SIDEBAR_W = 360;

  return (
    <div style={{ display:"flex", height:"100%", background:"#070D1A", color:"#E2E8F0", fontFamily:"Inter,sans-serif", overflow:"hidden", position:"relative" }}>

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
      <div style={{
        width: sidebarOpen ? SIDEBAR_W : 0, flexShrink:0, transition:"width 0.2s ease",
        overflow:"hidden", display:"flex", flexDirection:"column",
        borderRight:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(10,20,38,0.98)",
      }}>
        <div style={{ width:SIDEBAR_W, display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>

          {/* Header */}
          <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
              <FlaskConical size={15} style={{ color:"#6366F1" }} />
              <span style={{ fontSize:13, fontWeight:700, color:"#F1F5F9" }}>Scenario Lab</span>
            </div>
            <p style={{ margin:0, fontSize:10, color:"#475569" }}>Build fund flows → score via GATe TGNN + Isolation Forest</p>
          </div>

          {/* Scrollable body */}
          <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>

            {/* Edge Case Scenario Buttons */}
            <div style={{ padding:"10px 14px 8px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ margin:"0 0 7px", fontSize:9, fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em" }}>Edge Case Presets (click to load graph)</p>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {SCENARIOS.map(s => (
                  <button key={s.key} onClick={() => loadScenario(s.key)}
                    disabled={loadingScen !== null}
                    style={{
                      background: loadingScen === s.key ? "rgba(99,102,241,0.2)" : "rgba(20,35,55,0.9)",
                      border:`1px solid ${loadingScen === s.key ? "#6366F1" : "#283856"}`,
                      borderRadius:7, padding:"7px 10px", cursor:"pointer", textAlign:"left",
                      transition:"all 0.15s", opacity: loadingScen && loadingScen !== s.key ? 0.45 : 1,
                    }}
                    onMouseEnter={e => { if (!loadingScen) { (e.currentTarget as HTMLElement).style.background="rgba(99,102,241,0.12)"; (e.currentTarget as HTMLElement).style.borderColor="#6366F1"; } }}
                    onMouseLeave={e => { if (loadingScen !== s.key) { (e.currentTarget as HTMLElement).style.background="rgba(20,35,55,0.9)"; (e.currentTarget as HTMLElement).style.borderColor="#283856"; } }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#CBD5E1", marginBottom:1 }}>{s.label}</div>
                    <div style={{ fontSize:9, color:"#475569", lineHeight:1.3 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Transaction Form */}
            <div style={{ padding:"10px 14px 8px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ margin:"0 0 8px", fontSize:9, fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em" }}>Add Transaction Manually</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                {[["From Account","from_account","text","4125"],["To Account","to_account","text","8192"]].map(([label,field,type,ph])=>(
                  <div key={field as string}>
                    <label style={{ fontSize:9, color:"#475569", display:"block", marginBottom:2 }}>{label}</label>
                    <input style={inputSx} type={type as string} placeholder={ph as string}
                      value={(form as any)[field as string] || ""}
                      onChange={e => F(field as keyof TxInput, e.target.value)} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:9, color:"#475569", display:"block", marginBottom:2 }}>Amount</label>
                  <input style={inputSx} type="number" value={form.amount}
                    onChange={e => F("amount", parseFloat(e.target.value)||0)} />
                </div>
                <div>
                  <label style={{ fontSize:9, color:"#475569", display:"block", marginBottom:2 }}>Currency</label>
                  <select style={inputSx} value={form.currency} onChange={e => F("currency", e.target.value)}>
                    {["USD","EUR","GBP","BTC","INR","AUD","CAD","CHF"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:9, color:"#475569", display:"block", marginBottom:2 }}>Payment Format</label>
                  <select style={inputSx} value={form.payment_format} onChange={e => F("payment_format", e.target.value)}>
                    {["Wire","ACH","Cash","Bitcoin","Credit Card","Cheque","Reinvestment"].map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:9, color:"#475569", display:"block", marginBottom:2 }}>Account Age (days)</label>
                  <input style={inputSx} type="number" placeholder="null=unknown"
                    value={form.account_age_days ?? ""}
                    onChange={e => F("account_age_days", e.target.value ? parseInt(e.target.value) : null)} />
                </div>
                <div>
                  <label style={{ fontSize:9, color:"#475569", display:"block", marginBottom:2 }}>Account Type</label>
                  <select style={inputSx} value={form.account_type} onChange={e => F("account_type", e.target.value)}>
                    {["Personal","Company","NGO","Shell","Holding","SPV","Trust"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:9, color:"#475569", display:"block", marginBottom:2 }}>KYC Method</label>
                  <select style={inputSx} value={form.kyc_method} onChange={e => F("kyc_method", e.target.value)}>
                    {["Branch","Agent","Online","None"].map(k=><option key={k}>{k}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={{ fontSize:9, color:"#475569", display:"block", marginBottom:2 }}>Declared Business</label>
                  <input style={inputSx} value={form.declared_business} placeholder="restaurant, salon, holding…"
                    onChange={e => F("declared_business", e.target.value)} />
                </div>
              </div>
              <button onClick={addTx} disabled={!form.from_account||!form.to_account}
                style={{
                  marginTop:8, width:"100%", padding:"6px 0",
                  border:"1px dashed #334155", borderRadius:6, background:"transparent",
                  color:"#6366F1", cursor:"pointer", fontSize:11, fontWeight:600,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:4,
                  opacity: !form.from_account||!form.to_account ? 0.4 : 1,
                }}>
                <Plus size={12}/> Add Transaction
              </button>
            </div>

            {/* Transaction Queue */}
            {txList.length > 0 && (
              <div style={{ padding:"8px 14px 4px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:9, color:"#475569" }}>{txList.length} transaction{txList.length!==1?"s":""} queued</span>
                  <button onClick={() => { setTxList([]); setResult(null); }}
                    style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:9, display:"flex", alignItems:"center", gap:2 }}>
                    <RotateCcw size={9}/> Clear all
                  </button>
                </div>
                {txList.map((tx,i) => (
                  <div key={i} style={{
                    background:"rgba(20,35,55,0.8)", border:"1px solid #283856",
                    borderRadius:5, padding:"5px 8px", marginBottom:3,
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                  }}>
                    <div style={{ fontSize:10 }}>
                      <span style={{ color:"#6366F1", fontWeight:600 }}>{tx.from_account}</span>
                      <span style={{ color:"#475569", margin:"0 4px" }}>→</span>
                      <span style={{ color:"#CBD5E1" }}>{tx.to_account}</span>
                      <span style={{ color:"#475569", marginLeft:6, fontSize:9 }}>${tx.amount.toLocaleString()} {tx.currency}</span>
                    </div>
                    <button onClick={() => removeTx(i)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer" }}><X size={10}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Run Button */}
          <div style={{ padding:"10px 14px 12px", borderTop:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
            <button onClick={runAnalysis} disabled={txList.length===0||loading}
              style={{
                width:"100%", padding:"9px 0", borderRadius:8, border:"none",
                background: txList.length===0 ? "#1E2A3A" : loading ? "#312E81" : "linear-gradient(135deg,#6366F1,#8B5CF6)",
                color: txList.length===0 ? "#334155" : "#FFFFFF",
                cursor: txList.length===0?"not-allowed":"pointer",
                fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                boxShadow: txList.length>0 ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
                transition:"all 0.2s",
              }}>
              {loading ? <><span className="lab-spin">⟳</span> Scoring via TGNN…</> : <><Play size={13}/> Run TGNN Analysis</>}
            </button>
            {error && <p style={{ color:"#EF4444", fontSize:10, marginTop:5, textAlign:"center" }}>{error}</p>}
          </div>
        </div>
      </div>

      {/* ── SIDEBAR TOGGLE ────────────────────────────────────────────────── */}
      <button
        onClick={() => setSidebarOpen(v => !v)}
        style={{
          position:"absolute", left: sidebarOpen ? SIDEBAR_W - 12 : 0,
          top:"50%", transform:"translateY(-50%)", zIndex:50,
          width:22, height:44, borderRadius:sidebarOpen?"0 6px 6px 0":"6px",
          background:"#1E2A3A", border:"1px solid #334155",
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          color:"#64748B", transition:"left 0.2s ease", flexShrink:0,
        }}>
        {sidebarOpen ? <ChevronLeft size={13}/> : <ChevronRight size={13}/>}
      </button>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        {/* ── Summary / Tab Bar */}
        <div style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:12, flexShrink:0, flexWrap:"wrap" }}>
          {result ? (
            <>
              {[
                ["Total",result.summary.total,"#94A3B8"],
                ["Alerts",result.summary.alerts,"#EF4444"],
                ["Clean",result.summary.clean,"#22C55E"],
                ["Avg Risk",`${result.summary.avg_risk}%`,"#F97316"],
              ].map(([l,v,c])=>(
                <div key={l as string} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:16, fontWeight:800, color:c as string }}>{v}</div>
                  <div style={{ fontSize:8, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</div>
                </div>
              ))}
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {result.summary.typologies_detected.map(t=>(
                  <span key={t} style={{ padding:"2px 7px", borderRadius:99, fontSize:9, fontWeight:700,
                    background:`${LABEL_COLORS[t]||"#64748B"}20`, border:`1px solid ${LABEL_COLORS[t]||"#64748B"}60`,
                    color:LABEL_COLORS[t]||"#64748B" }}>{t}</span>
                ))}
              </div>
              <div style={{ marginLeft:"auto", display:"flex", gap:5 }}>
                {(["graph","table"] as const).map(tab=>(
                  <button key={tab} onClick={()=>setActiveTab(tab)} style={{
                    padding:"4px 12px", borderRadius:6, border:"none", cursor:"pointer",
                    background: activeTab===tab ? "#1A56DB" : "rgba(255,255,255,0.05)",
                    color: activeTab===tab ? "#FFFFFF" : "#64748B", fontSize:11, fontWeight:600,
                  }}>{tab==="graph" ? "🕸 Graph" : "📋 Table"}</button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:8, color:"#334155" }}>
              <Activity size={14}/>
              <span style={{ fontSize:11 }}>Load a preset or add transactions, then run analysis</span>
            </div>
          )}
        </div>

        {/* ── Graph / Table content */}
        <div style={{ flex:1, position:"relative", overflow:"hidden" }}>

          {!result ? (
            <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#334155" }}>
              <FlaskConical size={52} style={{ marginBottom:14, opacity:0.2 }} />
              <p style={{ fontSize:14, fontWeight:600, margin:"0 0 6px", color:"#475569" }}>Scenario Lab Ready</p>
              <p style={{ fontSize:11, margin:0, textAlign:"center", maxWidth:340 }}>
                Click an <strong style={{ color:"#6366F1" }}>edge case preset</strong> on the left to instantly load a scenario, then press <strong style={{ color:"#6366F1" }}>Run TGNN Analysis</strong>
              </p>
            </div>
          ) : activeTab === "graph" ? (
            <div style={{ width:"100%", height:"100%", position:"relative" }}>
              <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", zIndex:10, background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.4)", borderRadius:99, padding:"6px 14px", display:"flex", alignItems:"center", gap:6, backdropFilter:"blur(4px)" }}>
                <CheckCircle size={14} style={{ color:"#22C55E" }} />
                <span style={{ color:"#86EFAC", fontSize:11, fontWeight:600 }}>Success: Graph Generated using TGNN Trained Weights</span>
              </div>
              <ForceGraph2D
                ref={graphRef}
                graphData={{ nodes: result.graph.nodes as any, links: result.graph.links as any }}
                nodeId="id"
                nodeCanvasObject={paintNode}
                nodeCanvasObjectMode={() => "replace"}
                linkCanvasObject={paintLink}
                linkCanvasObjectMode={() => "replace"}
                onNodeClick={(node: any) => onNodeClick(node as FGNode)}
                backgroundColor="#070D1A"
                cooldownTicks={80}
                nodeRelSize={6}
                linkDirectionalArrowLength={0}
                enableNodeDrag={true}
                enablePanInteraction={true}
                enableZoomInteraction={true}
              />

              {/* Node click overlay */}
              {selectedNode && (
                loadingNode ? (
                  <div style={{ position:"absolute", top:12, right:12, background:"rgba(15,23,42,0.95)", border:"1px solid #334155", borderRadius:12, padding:"14px 18px", color:"#94A3B8", fontSize:12 }}>
                    <span className="lab-spin" style={{ marginRight:6 }}>⟳</span> Scoring node via Isolation Forest…
                  </div>
                ) : nodeRisk && (
                  <NodePanel nodeRisk={nodeRisk} onClose={() => { setSelectedNode(null); setNodeRisk(null); }} />
                )
              )}

              {/* Legend */}
              <div style={{ position:"absolute", bottom:12, left:12, background:"rgba(10,20,38,0.9)", border:"1px solid #1E2A3A", borderRadius:8, padding:"8px 12px" }}>
                <p style={{ margin:"0 0 5px", fontSize:9, color:"#475569", textTransform:"uppercase", fontWeight:600 }}>Legend</p>
                {[["🔵 Normal node","clean entity"],["🔴 Flagged node","TGNN alert"],["─── Clean edge","normal flow"],["─── Alert edge","suspicious flow"]].map(([sym,desc])=>(
                  <div key={sym} style={{ display:"flex", gap:6, marginBottom:2 }}>
                    <span style={{ fontSize:9, color:"#CBD5E1", minWidth:100 }}>{sym}</span>
                    <span style={{ fontSize:9, color:"#475569" }}>{desc}</span>
                  </div>
                ))}
                <p style={{ margin:"6px 0 0", fontSize:9, color:"#6366F1" }}>💡 Click node → IF risk score</p>
              </div>
            </div>
          ) : (
            /* TABLE VIEW */
            <div style={{ height:"100%", overflow:"auto", padding:"0 16px 16px" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)", position:"sticky", top:0, background:"#070D1A", zIndex:10 }}>
                    {["TX ID","From → To","Amount","Risk Score","TGNN Label","Red Flags","Status",""].map(h=>(
                      <th key={h} style={{ padding:"8px 10px", textAlign:"left", fontSize:8, fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.transactions.map(r => <ResultRow key={r.tx_id} r={r} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .lab-spin { display:inline-block; animation:lab-spin 1s linear infinite; }
        @keyframes lab-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        select option { background:#1E2A3A; color:#E2E8F0; }
        input:focus,select:focus { outline:none!important; border-color:#6366F1!important; }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
      `}</style>
    </div>
  );
}
