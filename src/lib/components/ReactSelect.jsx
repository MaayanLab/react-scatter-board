import React from 'react'

const Select = React.lazy(() => import('react-select'))

export default function ReactSelect({ label, facets, current, onChange }) {
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
            zIndex: 10,
          }),
          menuPortal: styles => ({
            ...styles,
            opacity: 1,
            zIndex: 10,
          }),
        }}
        classNamePrefix="select"
        value={{ value: current, label: current }}
        onChange={evt => {
          if (evt === null) evt = { value: undefined }
          onChange(evt)
        }}
        isClearable={true}
        isSearchable={true}
        options={Object.keys(facets).map(value => ({ value, label: value }))}
      />
    </div>
  )
}
