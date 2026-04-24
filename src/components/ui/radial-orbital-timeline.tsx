"use client";

import { ArrowRight, Link2, Zap, type LucideIcon } from "lucide-react";
import NextLink from "next/link";
import { type CSSProperties, type MouseEvent, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface OrbitalTimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: LucideIcon;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
  href: string;
}

export interface RadialOrbitalTimelineProps {
  timelineData: OrbitalTimelineItem[];
}

export function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const centerOffset = { x: 0, y: 0 };

  const handleContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (Number.parseInt(key, 10) !== id) {
          newState[Number.parseInt(key, 10)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulse: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulse[relId] = true;
        });
        setPulseEffect(newPulse);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: ReturnType<typeof setInterval> | undefined;

    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const next = (prev + 0.3) % 360;
          return Number(next.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) clearInterval(rotationTimer);
    };
  }, [autoRotate]);

  const centerViewOnNode = (nodeId: number) => {
    if (!nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    if (totalNodes === 0) return;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 200;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.45, Math.min(1, 0.45 + 0.55 * ((1 + Math.sin(radian)) / 2)));

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = (status: OrbitalTimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-slate-900 border-slate-500";
      case "in-progress":
        return "text-slate-900 bg-blue-200 border-blue-400";
      case "pending":
        return "text-slate-200 bg-slate-800/80 border-slate-500/60";
      default:
        return "text-slate-200 bg-slate-800/80 border-slate-500/60";
    }
  };

  return (
    <div
      className="flex h-[min(100dvh,900px)] w-full flex-col items-center justify-center overflow-hidden bg-lab-bg pt-20 pb-8"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative flex h-full w-full max-w-4xl items-center justify-center">
        <div
          className="absolute flex h-full w-full items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          <div className="absolute z-10 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-blue-500 to-teal-500">
            <div className="absolute h-20 w-20 animate-ping rounded-full border border-white/20 opacity-70" />
            <div
              className="absolute h-24 w-24 animate-ping rounded-full border border-white/10 opacity-50"
              style={{ animationDelay: "0.5s" }}
            />
            <div className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-md" />
          </div>

          <div className="absolute h-96 w-96 rounded-full border border-slate-600/30" />

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle: CSSProperties = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="absolute cursor-pointer transition-all duration-700"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`absolute -inset-1 rounded-full ${isPulsing ? "animate-pulse duration-1000" : ""}`}
                  style={{
                    background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0) 70%)",
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                />

                <div
                  className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
                  ${
                    isExpanded
                      ? "scale-150 border-white bg-white text-slate-900 shadow-lg shadow-blue-500/30"
                      : isRelated
                        ? "animate-pulse border-blue-300 bg-white/50 text-slate-900"
                        : "border-slate-500/50 bg-lab-surface text-slate-100"
                  }
                `}
                >
                  <Icon size={16} />
                </div>

                <div
                  className={`absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300 ${
                    isExpanded ? "scale-125 text-white" : "text-slate-400"
                  }`}
                >
                  {item.title}
                </div>

                {isExpanded ? (
                  <Card className="absolute left-1/2 top-20 z-[220] w-64 -translate-x-1/2 overflow-visible border-slate-600/50 bg-lab-surface/95 shadow-xl shadow-blue-900/20 backdrop-blur-lg">
                    <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-slate-500/60" />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`px-2 text-xs ${getStatusStyles(item.status)}`}>
                          {item.status === "completed"
                            ? "READY"
                            : item.status === "in-progress"
                              ? "ACTIVE"
                              : "COMING SOON"}
                        </Badge>
                        <span className="font-mono text-xs text-slate-500">{item.date}</span>
                      </div>
                      <CardTitle className="mt-2 text-sm text-white">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-300">
                      <p>{item.content}</p>

                      <div className="mt-4 border-t border-lab-border pt-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center text-slate-400">
                            <Zap size={10} className="mr-1" />
                            Activity
                          </span>
                          <span className="font-mono text-slate-300">{item.energy}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                            style={{ width: `${item.energy}%` }}
                          />
                        </div>
                      </div>

                      {item.relatedIds.length > 0 ? (
                        <div className="mt-4 border-t border-lab-border pt-3">
                          <div className="mb-2 flex items-center">
                            <Link2 size={10} className="mr-1 text-slate-500" />
                            <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">
                              Related areas
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId);
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  className="h-6 rounded-md border-lab-border bg-transparent px-2 py-0 text-xs text-slate-300 hover:bg-lab-border/40 hover:text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight size={8} className="ml-1 text-slate-500" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-4 border-t border-lab-border pt-3">
                        <Button asChild className="w-full" size="sm">
                          <NextLink href={item.href} onClick={(e) => e.stopPropagation()}>
                            Open {item.title}
                            <ArrowRight size={14} className="ml-2" />
                          </NextLink>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
