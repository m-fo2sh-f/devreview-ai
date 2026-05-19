import { useState, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import Sidebar from '../components/Sidebar.jsx'
import CustomNode from '../components/CustomNode.jsx'

// Dagre layout function
function getLayoutedElements(nodes, edges) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 60, marginx: 40, marginy: 40 })

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 350, height: 70 })
  })
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPos = g.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPos.x - 110,
        y: nodeWithPos.y - 35,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

const nodeTypes = { custom: CustomNode }

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedNode, setSelectedNode] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const analysisData = location.state?.analysisData
  const fileName = location.state?.fileName || 'Untitled'

  if (analysisData) {
    console.log('AI Analysis Data Loaded in ResultPage:', analysisData)
  }

  // Build React Flow elements from AI data
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!analysisData) return { initialNodes: [], initialEdges: [] }

    const rawNodes = (analysisData.nodes || []).map((n) => ({
      id: n.id,
      type: 'custom',
      data: { label: n.label, details: n.details },
      position: { x: 0, y: 0 },
    }))

    const rawEdges = (analysisData.edges || []).map((e, i) => ({
      id: `edge-${i}`,
      source: e.source,
      target: e.target,
      animated: true,
      style: { stroke: '#6c5ce7', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: '#6c5ce7',
      },
    }))

    const { nodes, edges } = getLayoutedElements(rawNodes, rawEdges)
    return { initialNodes: nodes, initialEdges: edges }
  }, [analysisData])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node.data)
    setSidebarOpen(true)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
    setTimeout(() => setSelectedNode(null), 350)
  }, [])

  // If no data, redirect back
  if (!analysisData) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: '20px',
      }}>
        <div className="bg-grid" />
        <div style={{
          position: 'relative', zIndex: 10, textAlign: 'center',
        }}>
          <div style={{
            fontSize: '64px', marginBottom: '16px',
            animation: 'float 3s ease-in-out infinite',
          }}>📊</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
            No Analysis Data
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Please upload a file first to see results.
          </p>
          <button
            onClick={() => navigate('/upload')}
            style={{
              padding: '12px 28px', borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)', border: 'none',
              color: '#fff', fontWeight: 600, fontSize: '14px',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            ← Go to Upload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Top Bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            id="back-to-upload"
            onClick={() => navigate('/')}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)', fontSize: '13px',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              transition: 'all var(--transition-fast)',
            }}
          >
            ← Back
          </button>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>
              {fileName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
              {nodes.length} functions · {edges.length} connections
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12px', color: 'var(--color-text-muted)',
          padding: '6px 12px', borderRadius: 'var(--radius-sm)',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--color-success)',
          }} />
          Click any node for details
        </div>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--color-bg)' }}
      >
        <Controls position="bottom-left" />
        <Background color="rgba(255,255,255,0.03)" gap={30} size={1} />
      </ReactFlow>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        nodeData={selectedNode}
        onClose={closeSidebar}
      />
    </div>
  )
}
