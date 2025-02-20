import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [serverLogs, setServerLogs] = useState('Server not setup yet')
  const [receivedMessages, setReceivedMessages] = useState('Start of log:')
  const [sendTo, setSendTo] = useState('')
  const [messageToSend, setMessageToSend] = useState('')
  const [port, setPort] = useState('No port set')

  useEffect(() => {
    // This is were messages from server a received/processed
    window.electron.onFromMain((_, message) => {
      if(message){
        try{
          const parsedMessage = JSON.parse(message)
          if(!parsedMessage.from){
            parsedMessage.from = 'Anonymous'
          }
          setReceivedMessages((old) => `${old} \n Recieved message from ${parsedMessage.from}: "${parsedMessage.message}"`)
        }catch(e){
          setServerLogs(message)
          window.electron.getServerPort().then((data) => data ? setPort(data) : "No server setup")
        }
      }
    });

    window.electron.receiveLog(((_, logMessage) => {
      setServerLogs(logMessage)
      window.electron.getServerPort().then((data) => data ? setPort(data) : "No server setup")
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
        body: JSON.stringify({message: messageToSend ,from: port === 'No port set' ? 'Anonymous' : port})
      })
      await response.text()
      setReceivedMessages((old) => `${old}\nSent message to ${sendTo}: "${messageToSend}"`)
      // Check if the process is a child process ending here tbd
    }catch(e){
      setReceivedMessages((old) => `${old}\nMessage failed to send: ${e}`)
    }
    setMessageToSend("")
  }

  const changeSentTo = (e) => {
    setSendTo(e.target.value)
  }

  const changeMessageToSend = (e) => {
    setMessageToSend(e.target.value)
  }

  return (
    <div className="App">
      <h1> Messaging App</h1>
      <h4> This app allows you to message other users on the same app by setting up its own 
        server. When you start the server you'll be given a port number that is used to message
        others.</h4>
      <div className='button-holder'>
        <button onClick={startServer}>start server</button>
        <button onClick={killServer}>kill server</button>
      </div>
      <div>
        LAST PORT: <span className='server-info'>{port}</span>
      </div>
      <div>
        Last server log: <span className='server-info'>{serverLogs}</span>
      </div>

      <div className='messaging-container'>
        <div className='message-sending-small'>
          <div className='textbox-title inline'>Send to:</div>
          <textarea className='inline' id="sendTo" cols="70" rows="1" onChange={changeSentTo}></textarea>
        </div>
        <div className='message-sending-medium'>
          <div className='textbox-title'>Type message here:</div>
          <textarea id="sendMessage" cols="70" rows="50" value={messageToSend} onChange={changeMessageToSend}></textarea>
        </div>
        <div className='message-received'>
          <div className='textbox-title'>Received messages</div>
          <textarea id="receivedMessages" value={receivedMessages} readOnly cols="70" rows="50"></textarea>
        </div>
        <button onClick={sendMessage}>Send message</button>
      </div>

    </div>
  );
}

export default App;
