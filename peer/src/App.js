import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [serverMessages, setServerMessages] = useState('')
  const [electronMessages, setElectonMessages] = useState('')
  const [serverLogs, setServerLogs] = useState('')

  useEffect(() => {
    // These could use the same stream but nice to seperate one for direct messages and one for messages received from server child process
    window.electron.onFromMain((_, message) => {
      setElectonMessages((currentMessage) => `${currentMessage} \n RECEIVED: ${message}`);
    });

    window.electron.receiveLog(((_, logMessage) => {
      setServerLogs((previousLogs) => previousLogs ? previousLogs + '\n' + logMessage: logMessage)
    }));

    return () => {
      window.electron.removeListener('log-message');
      window.electron.removeListener('from-main');
    };
  }, []);

  
  const sendToElectron = () => {
    setElectonMessages((currentMessage) => `${currentMessage} ${currentMessage ? "\n" : ""}SENT: "Hello from React!"`);
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
      setServerMessages((previousData) => previousData ? previousData + '\n' + data : data)
    }catch(e){
      setServerMessages((previousData) => previousData ? previousData + '\n' + e : e)
    }
  };


  return (
    <div className="App">
      <h1> Peer template</h1>
      <h3> for starting local server that can be messaged </h3>
      <div className='button-holder'>
        <button onClick={sendToElectron}>message electron</button>
        <button onClick={startServer}>start server</button>
        <button onClick={pingServer}>ping server</button>
        <button onClick={killServer}>kill server</button>
      </div>
      <div className='message-handler'>
        <div>Electron messages</div>
        <textarea id="electronMessages" value={electronMessages} readOnly cols="70" rows="50"></textarea>
      </div>
      <div className='message-handler'>
        <div>Server messages</div>
        <textarea id="serverMessages" value={serverMessages} readOnly cols="70" rows="50"></textarea>
      </div>
      <div className='message-handler'>
        <div>Server logs</div>
        <textarea id="serverLogs" value={serverLogs} readOnly cols="70" rows="50"></textarea>
      </div>
    </div>
  );
}

export default App;
