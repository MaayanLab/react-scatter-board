import React from 'react'

export default function ReactLegend({ label, facet, children }) {
  const Child = children
  return (
    <div
      style={{
        width: '200px',
        maxHeight: '50%',
        marginBottom: '10px',
        color: 'black',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        opacity: 0.8,
      }}
    >
      <b>{label}</b>
      {Object.keys(facet.values).map((value) => (
        <Child key={value} value={value} count={facet.values[value]} />
      ))}
    </div>
  )
}