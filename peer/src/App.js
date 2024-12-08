import './App.css';

const startServer = () => {
  console.log('aaaa')
  fetch('http://localhost:5000/', {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
};

function App() {
  return (
    <div className="App">
          <button onClick={startServer}>click me !</button>
    </div>
  );
}

export default App;
