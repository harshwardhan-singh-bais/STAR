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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    starApi.getCommunities()
      .then(data => {
        setGraphData(data);
        setIsLoaded(true);
      })
      .catch(() => { /* silent */ });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: width || 800, height: height || 500 });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const handleNodeClick = useCallback(
    (node: any) => {
      if (fgRef.current) {
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(8, 2000);
      }
    },
    [fgRef]
  );

  const numCommunities = graphData ? new Set(graphData.nodes.map(n => n.community)).size : 0;

  return (
    <div className="p-6 max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-56px)]" style={{ background: "#F4F6F9" }}>
      <div className="mb-5 shrink-0">
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

      <GlassCard className="flex-1 relative overflow-hidden flex flex-col p-0 border border-[#E2E8F0] shadow-sm rounded-2xl bg-white">
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[#E2E8F0] border-t-[#1A56DB] rounded-full animate-spin" />
              <p className="text-[#1A56DB] text-sm font-medium">Running Louvain Modularity Algorithm...</p>
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 z-10 p-4 rounded-lg bg-white/95 border border-[#E2E8F0] shadow-sm">
          <h3 className="font-semibold mb-2 text-[#0F172A]" style={{ fontSize: "12px" }}>Topology Key</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCommunityColor(1) }} />
              <span className="text-[#64748B]">Community Groups</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500" />
              <span className="text-[#64748B]">Suspicious Edge</span>
            </div>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 w-full h-full relative" style={{ cursor: 'crosshair' }}>
          {graphData && isLoaded && (
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              nodeLabel={(n: any) => `Node: ${n.id}\nCommunity: ${n.community}\nRisk: ${n.risk}`}
              nodeColor={(n: any) => getCommunityColor(n.community)}
              nodeRelSize={5}
              linkColor={(l: any) => l.suspicious ? 'rgba(239, 68, 68, 0.95)' : 'rgba(100, 116, 139, 0.15)'}
              linkWidth={(l: any) => l.suspicious ? 2.5 : 1}
              onNodeClick={handleNodeClick}
              backgroundColor="#0F172A"
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.15}
              cooldownTicks={100}
            />
          )}
        </div>
      </GlassCard>
    </div>
  );
}
