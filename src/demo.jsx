import ReactDOM from 'react-dom'
import React, { useState } from 'react'

const ReactScatterBoard = React.lazy(() => import('./components/ReactScatterBoard'))

function App() {
  const [data, setData] = useState([])
  useState(async () => {
    setData(await (await fetch('./sample_human_tsne.json')).json())
  }, [])
  return (
    <React.Suspense fallback={null}>
      <ReactScatterBoard is3d={true} data={data} />
    </React.Suspense>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root'),
)
