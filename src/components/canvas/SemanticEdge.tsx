'use client'

import React, { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Edge, type EdgeProps } from '@xyflow/react'
import { TensionStatus } from '../../types/graph'

export type SemanticEdgeType = Edge<{
  label: string
  tension: TensionStatus
}, 'semantic'>

const SemanticEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<SemanticEdgeType>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const tensionColors: Record<TensionStatus, string> = {
    none: '#10b981',
    tension: '#f59e0b',
    contradiction: '#ef4444',
  }

  const tension = data?.tension || 'none'
  const strokeColor = tensionColors[tension]

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: strokeColor, strokeWidth: 2 }} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className="px-2 py-1 text-[10px] font-medium bg-white border border-gray-200 rounded shadow-sm opacity-0 hover:opacity-100 transition-opacity cursor-help whitespace-nowrap">
              {data.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export default memo(SemanticEdge)
