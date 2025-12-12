import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="text-3xl bg-black text-white ">
      Hello world
    </div >
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <h1>CAADRIA 2026</h1>
      <div className="card">

      </div>
      <p className="read-the-docs">
this is a webwite for caadria 26 chat bot test</p>
    </>
  )
}

export default App
