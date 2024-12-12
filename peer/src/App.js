import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [serverMessages, setServerMessages] = useState('')
  const [electronMessages, setElectonMessages] = useState('')

  useEffect(() => {
    window.electron.onFromMain((event, message) => {
      console.log(message)
      setElectonMessages(message);
    });
  }, []);

  
  const sendToElectron = () => {
    console.log(window.electron)
    window.electron.sendToMain('Hello from React!');
  };

  const startServer = () => {
    window.electron.startServer()
  }

  const killServer = () => {
    window.electron.killServer()
  }

  const pingServer = async () => {
    try{
      const response = await fetch('http://localhost:5000/', {
        method: 'GET',
      })
      const data = await response.text()
      setServerMessages(data)
    }catch(e){
      setServerMessages(e)
    }


  };


  return (
    <div className="App">
      <div>
        <button onClick={sendToElectron}>message elctron</button>
        <button onClick={startServer}>start server!</button>
        <button onClick={pingServer}>ping server</button>
        <button onClick={killServer}>kill server</button>
      </div>
      <div>
        <textarea value={electronMessages}></textarea>
      </div>
      <div>
        <textarea value={serverMessages}></textarea>
      </div>
    </div>
  );
}

export default App;
