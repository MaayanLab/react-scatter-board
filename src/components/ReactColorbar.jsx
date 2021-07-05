import React from 'react'

export default function ReactColorbar({ label, facet, children }) {
  const [min, max] = facet.colorbar
  const range = max - min
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
      &nbsp;{min}
      
      {[0,1,2,3,4]
        .map(i => facet.colorScale(min + (range * i / 4.0)))
        .map((c, i) =>
          <div
            key={i}
            style={{
              width: 24,
              height: 24,
              backgroundColor: c,
            }}
          >&nbsp;</div>
        )}
      &nbsp;{max}
    </div>
  )
}