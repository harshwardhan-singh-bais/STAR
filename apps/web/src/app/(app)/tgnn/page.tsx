// =============================================================================
// STAR — TGNN Demo Page
// Route: /tgnn
// Full real-time AML detection dashboard with GATe TGNN + Neo4j
// Exact port of inference/frontend/src/dashboard.tsx by teammate
// =============================================================================
import type { Metadata } from "next";
import TGNNDashboard from "@/components/tgnn/TGNNDashboard";

export const metadata: Metadata = {
  title: "TGNN Demo | STAR — AML Intelligence",
  description: "Real-time AML detection using GATe TGNN, Rule Engine, and Neo4j Aura. Live transaction graph visualization with fraud pattern detection.",
};

export default function TGNNPage() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <TGNNDashboard />
    </div>
  );
}
