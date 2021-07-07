import React from 'react'
import ReactDOM from 'react-dom'
import Suspense from './components/Suspense'

const ReactScatterBoard = React.lazy(() => import('./components/ReactScatterBoard'))
const ReactSelect = React.lazy(() => import('./components/ReactSelect'))

function App() {
  const sources = {
    'React Scatter Board': {
      is3d: true,
      source: 'https://s3.amazonaws.com/maayanlab-public/react_scatter_board/react-scatter-board.json',
    },
    'L1000FWD': {
      is3d: false,
      source: 'https://s3.amazonaws.com/maayanlab-public/react_scatter_board/l1000fwd.json',
    },
    'ARCHS4 Genes': {
      is3d: true,
      source: 'https://s3.amazonaws.com/maayanlab-public/react_scatter_board/archs4-genes.json',
    },
    'ARCHS4 Samples': {
      is3d: true,
      source: 'https://s3.amazonaws.com/maayanlab-public/react_scatter_board/archs4-samples.json',
    },
  }
  const [scale, setScale] = React.useState(2000)
  const [autoScale, setAutoScale] = React.useState(true)
  const [source, setSource] = React.useState()
  const [data, setData] = React.useState([])
  React.useEffect(async () => {
    if (source === undefined) {
      setData([])
    } else {
      const req = await fetch(sources[source].source)
      const ret = await req.json()
      setData(ret)
    }
  }, [source])
  return (
    <Suspense>
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'stretch', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <ReactSelect
            label="Pick a Dataset"
            facets={sources}
            current={source}
            onChange={({ value }) => setSource(value)}
          />
          <input
            type="range"
            min="1000"
            max="100000"
            value={scale}
            disabled={autoScale}
            onChange={evt => setScale(evt.target.value|0)}
          />
          <input
            type="checkbox"
            checked={autoScale}
            onChange={evt => setAutoScale(evt.target.checked)}
          />
        </div>
        <ReactScatterBoard
          is3d={(sources[source]||{}).is3d}
          toggle3d={(sources[source]||{}).is3d}
          data={data}
          scale={!autoScale ? scale/500 : undefined}
        />
      </div>
    </Suspense>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root'),
)
