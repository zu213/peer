import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [serverState, setServerState] = useState('NOT SETUP')
  const [electronState, setElectonState] = useState('N/A')
  const [serverLogs, setServerLogs] = useState('N/A')
  const [receivedMessages, setReceivedMessages] = useState('')
  const [sendTo, setSendTo] = useState('')
  const [messageToSend, setMessageToSend] = useState('')
  const [port, setPort] = useState('No port set')

  useEffect(() => {
    // This is were messages from server a received/processed
    window.electron.onFromMain((_, message) => {
      if(message){
        setReceivedMessages((old) => old + '\n' + message)
      }
      setElectonState(message);
    });

    window.electron.receiveLog(((_, logMessage) => {
      setServerLogs(logMessage)
      window.electron.getServerPort().then((data) => {console.log(data); return data ? setPort(data) : "No server setup"})
    }));

    return () => {
      window.electron.removeListener('log-message');
      window.electron.removeListener('from-main');
    };
  }, []);

  const startServer = () => {
    window.electron.startServer()
  }

  const killServer = () => {
    window.electron.killServer()
  }

  const sendMessage = async () => {
    try{
      const response = await fetch(`http://localhost:${sendTo}/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({message: messageToSend ,from: port})
      })
      const text = await response.text()
      // Check if the process is a child process ending here tbd
      setServerState("Server is healthy")
    }catch(e){
      setServerState(`Server has errored: ${e}`)
    }
  }

  const changeSentTo = (e) => {
    console.log(e.target.value)
    setSendTo(e.target.value)
  }

  const changeMessageToSend = (e) => {
    setMessageToSend(e.target.value)
  }

  return (
    <div className="App">
      <h1> Peer template</h1>
      <h3> for starting local server that can be messaged </h3>
      <div className='button-holder'>
        <button onClick={startServer}>start server</button>
        <button onClick={killServer}>kill server</button>
      </div>
      <div>
        PORT: {port}
      </div>
      <div>
        Last Electron message: {electronState}
      </div>
      <div>
        Local server setup: {serverState}
      </div>
      <div>
        Last server log: {serverLogs}
      </div>

      <div className='message-sending-small'>
        <div>Send to:</div>
        <textarea id="sendTo" cols="70" rows="1" onChange={changeSentTo}></textarea>
      </div>
      <div className='message-sending'>
        <div>Send messsages</div>
        <textarea id="sendMessage" cols="70" rows="50" onChange={changeMessageToSend}></textarea>
      </div>
      <div className='message-received'>
        <div>Received messages</div>
        <textarea id="receivedMessages" value={receivedMessages} readOnly cols="70" rows="50"></textarea>
      </div>
      <button onClick={sendMessage}>Send message</button>

    </div>
  );
}

export default App;
