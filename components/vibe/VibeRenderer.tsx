/**
 * VibeRenderer (§41) — the ONLY public runtime for VIBE experiences.
 * Depends on registry data + resolved RenderNodes; never imports the editor.
 */

import React from 'react';
import { RenderNode } from '@/lib/vibe/runtime';
import { BlockRenderer } from './blocks';

export function VibeRenderer({ nodes }: { nodes: RenderNode[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-2">
      {nodes.map(node => <BlockRenderer key={node.id} node={node} />)}
    </div>
  );
}
