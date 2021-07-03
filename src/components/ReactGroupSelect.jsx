import React from 'react'

const Select = React.lazy(() => import('react-select'))

function formatGroupLabel(data) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: 0.8,
      }}
    >
      <span>{data.label}</span>
      <span
        style={{
          display: 'inline-block',
        }}
      >{data.options.length}</span>
    </div>
  )
}

export default function ReactGroupSelect({ label, facets, current, onChange }) {
  return (
    <div
      style={{
        width: '200px',
        marginBottom: '10px',
        color: 'black',
        pointerEvents: 'auto',
        opacity: 0.8,
      }}
    >
      <b>{label}</b>
      <Select
        menuPortalTarget={document.body}
        styles={{
          menu: styles => ({
            ...styles,
            opacity: 1,
            zIndex: 2,
          }),
          menuPortal: styles => ({
            ...styles,
            opacity: 1,
            zIndex: 2,
          }),
        }}
        classNamePrefix="select"
        value={current}
        onChange={evt => {
          if (evt === null) evt = undefined
          onChange(evt)
        }}
        isClearable={true}
        isSearchable={true}
        options={Object.keys(facets).map(key => ({
          label: key,
          options: Object.keys(facets[key].values).map(value => ({
            key,
            label: value,
            value,
          }))
        }))}
        formatGroupLabel={formatGroupLabel}
      />
    </div>
  )
}
