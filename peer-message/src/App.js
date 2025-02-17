import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [serverState, setServerState] = useState('NOT SETUP')
  const [electronState, setElectonState] = useState('N/A')
  const [serverLogs, setServerLogs] = useState('N/A')
  const [receivedMessages, setReceivedMessages] = useState('')
  const [sendTo, setSendTo] = useState('')
  const [port, setPort] = useState('No port set')

  useEffect(() => {
    // These could use the same stream but nice to seperate one for direct messages and one for messages received from server child process
    window.electron.onFromMain((_, message) => {
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

  
  const sendToElectron = () => {
    setElectonState((currentMessage) => `${currentMessage} ${currentMessage ? "\n" : ""}SENT: "Hello from React!"`);
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
      console.log(port)
      await fetch(`http://localhost:${port}/`, {
        method: 'GET',
      })
      //await response.text()
      setServerState("Server is healthy")
    }catch(e){
      setServerState(`Server has errored: ${e}`)
    }
  };

  const sendMessage = () => {
    console.log(sendTo)
  }

  const changeSentTo = (e) => {
    setSendTo(e.target.innerText)
  }


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
        <textarea id="sendMessage" cols="70" rows="50"></textarea>
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
