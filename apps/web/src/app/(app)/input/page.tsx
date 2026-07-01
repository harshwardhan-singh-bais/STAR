// =============================================================================
// STAR — Scenario Lab Page
// Route: /input
// Custom transaction input + TGNN scoring + contextual red-flag tagging
// =============================================================================
import type { Metadata } from "next";
import ScenarioLab from "@/components/input/ScenarioLab";

export const metadata: Metadata = {
  title: "Scenario Lab | STAR — AML Intelligence",
  description:
    "Build custom transaction scenarios and score them through the GATe TGNN model. Detect AML typologies with TGNN structural classification and contextual red-flag tagging.",
};

export default function InputPage() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ScenarioLab />
    </div>
  );
}
