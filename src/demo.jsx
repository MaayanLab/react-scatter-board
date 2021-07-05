import React from 'react'
import ReactDOM from 'react-dom'
import Suspense from './components/Suspense'

const ReactScatterBoard = React.lazy(() => import('./components/ReactScatterBoard'))

function App() {
  const [data, setData] = React.useState([])
  React.useEffect(async () => {
    const req = await fetch(require('./examples/4.json?url-loader').default)
    const ret = await req.json()
    setData(ret)
  }, [])
  return (
    <Suspense>
      <ReactScatterBoard
        toggle3d
        data={data}
      />
    </Suspense>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root'),
)
