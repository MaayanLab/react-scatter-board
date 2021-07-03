import ReactDOM from 'react-dom'
import React from 'react'

const ReactScatterBoardComponent = React.lazy(() => import('./components/ReactScatterBoard'))

export function ReactScatterBoard(container, { width, height, ...props }) {
  if (width === undefined) width = '100%'
  if (height === undefined) height = '500px'
  ReactDOM.render(
    <React.Suspense fallback={null}>
      <div style={{
        height,
        display: 'flex',
        flex: '1 1 auto',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <ReactScatterBoardComponent {...props} />
      </div>
    </React.Suspense>,
    container
  )
}
