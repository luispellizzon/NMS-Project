'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, LoaderCircle, Search, FileText, Sparkles } from 'lucide-react';

export interface AgentArtifact {
  id: string;
  type: 'search' | 'analysis' | 'summary' | 'complete';
  agent: string;
  title: string;
  content: string;
  timestamp: Date;
  status: 'in_progress' | 'completed';
}

interface AgentArtifactsAccordionProps {
  topic: string;
  artifacts: AgentArtifact[];
}

const getIconForType = (type: AgentArtifact['type'], status: AgentArtifact['status']) => {
  if (status === 'completed') {
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  }

  switch (type) {
    case 'search':
      return <Search className="w-4 h-4 text-blue-500 animate-pulse" />;
    case 'analysis':
      return <FileText className="w-4 h-4 text-yellow-500 animate-pulse" />;
    case 'summary':
      return <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />;
    case 'complete':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    default:
      return <LoaderCircle className="w-4 h-4 animate-spin" />;
  }
};

function ArtifactItem({ artifact }: { artifact: AgentArtifact }) {
  const [isExpanded, setIsExpanded] = useState(artifact.status === 'in_progress');

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {getIconForType(artifact.type, artifact.status)}
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">{artifact.title}</p>
            <p className="text-xs text-muted-foreground">{artifact.agent}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {artifact.timestamp.toLocaleTimeString()}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 bg-muted/30">
          <p className="text-sm text-secondary-foreground/80 whitespace-pre-wrap">
            {artifact.content}
          </p>
        </div>
      )}
    </div>
  );
}

export default function AgentArtifactsAccordion({ topic, artifacts }: AgentArtifactsAccordionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const latestArtifactRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest artifact when new ones are added
  useEffect(() => {
    if (latestArtifactRef.current && artifacts.length > 0) {
      latestArtifactRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [artifacts.length]);

  return (
    <div className="flex flex-col h-[300px]">
      <div className="pb-4 border-b border-border">
        <h4 className="font-semibold text-foreground">Agent Workflow</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Generating report on: <span className="font-medium text-foreground">{topic}</span>
        </p>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mt-4 space-y-2 pr-2">
        {artifacts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">Initializing agents...</p>
            </div>
          </div>
        ) : (
          artifacts.map((artifact, index) => (
            <div
              key={artifact.id}
              ref={index === artifacts.length - 1 ? latestArtifactRef : null}
            >
              <ArtifactItem artifact={artifact} />
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-border mt-4">
        <p className="text-xs text-muted-foreground text-center">
          This may take a moment. Please keep this page open.
        </p>
      </div>
    </div>
  );
}