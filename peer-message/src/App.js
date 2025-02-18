import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [serverLogs, setServerLogs] = useState('"Server not setup yet"')
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
          console.log(parsedMessage)
          if(!parsedMessage.from){
            parsedMessage.from = 'Anonymous'
          }
          setReceivedMessages((old) => `${old} \n Recieved message from ${parsedMessage.from}: "${parsedMessage.message}"`)
        }catch(e){
          setReceivedMessages((old) => `${old} \n Error parsing message ${e}`)
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
        body: JSON.stringify({message: messageToSend ,from: port})
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
    console.log(e.target.value)
    setSendTo(e.target.value)
  }

  const changeMessageToSend = (e) => {
    setMessageToSend(e.target.value)
  }

  return (
    <div className="App">
      <h1> Messaging App</h1>
      <h3> This app allows you to message pother by putting their port number in the "Send to" box</h3>
      <div className='button-holder'>
        <button onClick={startServer}>start server</button>
        <button onClick={killServer}>kill server</button>
      </div>
      <div>
        LAST PORT: {port}
      </div>
      <div>
        Last server log: {serverLogs}
      </div>

      <div className='message-sending-small'>
        <div>Send to:</div>
        <textarea id="sendTo" cols="70" rows="1" onChange={changeSentTo}></textarea>
      </div>
      <div className='message-sending-medium'>
        <div>Send messsages</div>
        <textarea id="sendMessage" cols="70" rows="50" value={messageToSend} onChange={changeMessageToSend}></textarea>
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
