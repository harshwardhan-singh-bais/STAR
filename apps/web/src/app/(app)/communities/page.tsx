"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { GlassCard } from "@/components/ui/GlassCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { Users, Activity, Network } from "lucide-react";
import { starApi, GraphData } from "@/lib/api";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// Helper to generate distinct colors for communities
const getCommunityColor = (communityId: number) => {
  const hue = (communityId * 137.508) % 360; // Use golden angle approximation
  return `hsl(${hue}, 70%, 50%)`;
};

export default function CommunitiesPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    starApi.getCommunities()
      .then(data => {
        setGraphData(data);
        setIsLoaded(true);
      })
      .catch(() => { /* silent */ });
  }, []);

  const handleNodeClick = useCallback(
    (node: any) => {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      if (fgRef.current) {
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(8, 2000);
      }
    },
    [fgRef]
  );

  const numCommunities = graphData ? new Set(graphData.nodes.map(n => n.community)).size : 0;

  return (
    <div className="p-6 max-w-[1600px] mx-auto flex flex-col" style={{ background: "#F4F6F9", minHeight: "100%" }}>
      <div className="mb-5">
        <h1 className="page-title">Community Detection</h1>
        <p className="page-subtitle">
          Louvain Modularity structural clustering of the transaction network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 shrink-0">
        <MetricCard label="Total Entities" value={graphData?.nodes.length || 0} icon={Users} color="#3B82F6" />
        <MetricCard label="Relationships" value={graphData?.links.length || 0} icon={Activity} color="#10B981" />
        <MetricCard label="Identified Syndicates" value={numCommunities} icon={Network} color="#A855F7" />
      </div>

      <GlassCard className="flex-1 relative overflow-hidden flex flex-col p-0 border border-white/10 shadow-2xl">
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(248,250,252,0.9)" }}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "#E2E8F0", borderTopColor: "#1A56DB" }} />
              <p style={{ color: "#1A56DB", fontSize: "13px", fontWeight: 500 }}>Running Louvain Modularity Algorithm...</p>
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 z-10 p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 className="font-semibold mb-2" style={{ fontSize: "12px", color: "#0F172A" }}>Topology Key</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(45,70%,50%)]" />
              <span className="text-[#94A3B8]">Community Colors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500" />
              <span className="text-[#94A3B8]">Suspicious Edge</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full h-full relative" style={{ cursor: 'crosshair' }}>
          {graphData && (
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeLabel={(n: any) => `Node: ${n.id}\nCommunity: ${n.community}\nRisk: ${n.risk}`}
              nodeColor={(n: any) => getCommunityColor(n.community)}
              nodeRelSize={4}
              linkColor={(l: any) => l.suspicious ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.1)'}
              linkWidth={(l: any) => l.suspicious ? 2 : 1}
              onNodeClick={handleNodeClick}
              backgroundColor="#020617"
              d3AlphaDecay={0.01}
              d3VelocityDecay={0.08}
              cooldownTicks={100}
            />
          )}
        </div>
      </GlassCard>
    </div>
  );
}
