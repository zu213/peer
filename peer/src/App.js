import './App.css';

const pingServer = () => {
  console.log('aaaa')
  fetch('http://localhost:5000/', {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
};

const sendToElectron = () => {
  console.log(window.electron)
  window.electron.sendToMain('Hello from React!');
};

function App() {
  return (
    <div className="App">
          <button onClick={sendToElectron}>click me !</button>

          <button onClick={pingServer}>click me !</button>
    </div>
  );
}

export default App;
