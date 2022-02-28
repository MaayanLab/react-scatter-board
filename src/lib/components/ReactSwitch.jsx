import React from 'react'

export default function ReactSwitch({
  on, off, current, onChange
}) {
  return (
    <div
      style={{
        alignSelf: 'center',
        display: 'flex',
        justifyContent: 'center',
        borderRadius: '4px',
        border: 'solid 1px grey',
        pointerEvents: 'auto',
        cursor: 'pointer',
        opacity: 0.8,
      }}
      onClick={evt => onChange(!current)}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '40px',
        height: '40px',
        backgroundColor: current ? 'white' : '#0088aa'
      }}>{off}</div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '40px',
        height: '40px',
        backgroundColor: current ? '#0088aa' : 'white'
      }}>{on}</div>
    </div>
  )
}
