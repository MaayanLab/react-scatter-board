import ReactDOM from 'react-dom'
import React, { useState } from 'react'

const ReactScatterBoard = React.lazy(() => import('./ReactScatterBoard'))

function App() {
  const [data, setData] = useState([])
  useState(async () => {
    setData(await (await fetch('./4.json')).json())
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
