import React, { useCallback, useEffect, useState } from 'react';
import Graph from './graph';
import Pie from './pie';
import './App.css';

const  secondsToDHMS = (seconds) => {
  seconds = Number(seconds);
  const y = Math.floor(seconds * 3.17098e-8);
  const d = Math.floor(seconds / (3600*24));
  const h = Math.floor(seconds % (3600*24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  
  const yDisplay = y > 0 ? y + (y === 1 ? " year " : " years ") : "";
  const dDisplay = d > 0 ? d + (d === 1 ? " day " : " days ") : "";
  const hDisplay = h > 0 && d < 60 ? h + (h === 1 ? " hour " : " hours ") : "";
  const mDisplay = m > 0 && d < 1 ? m + (m === 1 ? " minute " : " minutes ") : "";
  const sDisplay = s > 0 && m < 5 ? s + (s === 1 ? " second" : " seconds") : "";
  return yDisplay + dDisplay + hDisplay + mDisplay + sDisplay;
}
const duePoint = (t, h) => ((h/100)**(1/8))*(112 + (0.9*t)) + (0.1*t) - 112 + 273.16;
const humidex = (t, h) => t + 0.5555*(6.11 * Math.exp(5417.7530 * ((1/273.16) - (1/duePoint(t,h))))-10);
function App() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [showDots, setShowDots] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [Tminus, setTminus] = useState(60);  // from the last 10 minutes
  const [progress, setProgress] = useState(0);
  const [updateTime, setUpdateTime] = useState(5000);
  const [averages, setAverages] = useState({averageHumidity: undefined, averageTemp: undefined, averageHumidex: undefined});;
  
  const updateData = useCallback(() =>
  {
    const requestOptions = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"fromTimestamp": (Math.round(Date.now() / 1000) - Tminus)}),
    };
    setLoading(true);
    fetch(process.env.REACT_APP_API, requestOptions) // TODO: change to env var
      .then(result => result.json())
      .then(response => JSON.parse(response.body))
      .then(
        (body) =>{
          if(!body.ok){
            console.log("Get Items Failed (ok = false)");
          }else{
            let data = body.message.map(item => {return {timestamp: item.timestamp, temperature: item.value.Temperature, humidity: item.value.Humidity, humidex: humidex(item.value.Temperature, item.value.Humidity)};});
            setData(data);
            let averageHumidity = 0;
            let averageTemp = 0;
            let averageHumidex = 0;
            data.forEach(element => {
              averageHumidity = averageHumidity + element.humidity;
              averageTemp = averageTemp + element.temperature;
              averageHumidex = averageHumidex + element.humidex;
            });
            
            averageHumidity = Math.round(averageHumidity / data.length* 100)/100;
            averageTemp = Math.round(averageTemp / data.length* 100)/100;
            averageHumidex = Math.round(averageHumidex / data.length* 100)/100;
            
            setAverages({averageHumidity: averageHumidity, averageTemp: averageTemp, averageHumidex: averageHumidex});
          }
        },
        (error) => console.log("Error!\n" + error)
      ).then(
        () => setLoading(false)
      );
      setProgress(0);
  }, [Tminus]);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    updateData();
    setUpdateTime(Tminus/60/60 < 1 ? 10000 : Tminus/0.36);
  }, [updateData, Tminus]);
  
  useEffect(() => {if(progress >= 1) updateData()}, [progress, updateData]);
  useEffect(() => {
    const interval = setInterval(() => {if(autoUpdate) setProgress(progress + 1/500);}, updateTime/500);
    return () => clearInterval(interval);
  }, [updateData, autoUpdate, progress, updateTime])
  
  return (
    <div className="App">
      <div className="Container">
      <br />
      <br />
      <div style={{width: '100vw', height: '0.2em', position: 'fixed', top: 0, left: 0}}>
        <div style={{width: `${progress*100}vw`, backgroundColor: '#000000', height: '0.2em'}} />
      </div>
      <h1>Sensor Data</h1>
      <br />
      <h2>SIT123: Data Capture Technologies</h2>
      <h3>Mark Blashki (220228182)</h3>
      <hr />
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div style={{"display": "inline"}}>
            <h4>
              Auto Updating &nbsp;
              <div style={{"display": "inline-flex"}}>
                <input type="button" disabled={autoUpdate === true} value="On" onClick={e => setAutoUpdate(true)} />
                <input type="button" disabled={autoUpdate === false} value="Off" onClick={e => setAutoUpdate(false)} />
              </div>
            </h4>
          </div>
          <div style={{"display": "inline"}}>
            <h4>
              Show points &nbsp;
              <div style={{"display": "inline-flex"}}>
                <input type="button" disabled={showDots === true} value="On" onClick={e => setShowDots(true)} />
                <input type="button" disabled={showDots === false} value="Off" onClick={e => setShowDots(false)} />
              </div>
            </h4>
          </div>
          <h4 style={{display: 'inline-flex'}}>Number of datapoints: {data?.length}</h4>
          <h4 style={{display: 'inline-flex'}}>Refresh Rate: {secondsToDHMS(updateTime/1000)}</h4>
        </div>
        <hr />
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <h4>
              History
            </h4>
            &nbsp;
            <input type="button" disabled={Tminus===1*60} value="1m" onClick={e => setTminus(1*60)} />
            <input type="button" disabled={Tminus===5*60} value="5m" onClick={e => setTminus(5*60)} />
            <input type="button" disabled={Tminus===10*60} value="10m" onClick={e => setTminus(10*60)} />
            <input type="button" disabled={Tminus===30*60} value="30m" onClick={e => setTminus(30*60)} />
            <input type="button" disabled={Tminus===1*60*60} value="1h" onClick={e => setTminus(1*60*60)} />
            <input type="button" disabled={Tminus===2*60*60} value="2h" onClick={e => setTminus(2*60*60)} />
            <input type="button" disabled={Tminus===6*60*60} value="6h" onClick={e => setTminus(6*60*60)} />
            <input type="button" disabled={Tminus===12*60*60} value="12h" onClick={e => setTminus(12*60*60)} />
            <input type="button" disabled={Tminus===24*60*60} value="1d" onClick={e => setTminus(24*60*60)} />
            <input type="button" disabled={Tminus===2*24*60*60} value="2d" onClick={e => setTminus(2*24*60*60)} />
            <input type="button" disabled={Tminus===3*24*60*60} value="3d" onClick={e => setTminus(3*24*60*60)} />
            &nbsp;
            <h4>
              ({secondsToDHMS(Tminus)})
            </h4>
          </div>
          <h4>
            <input style={{backgroundColor: (loading ? '#86ba7f' : "#2cb01a"), width: '10em', border: 'none', padding: '1em', color: 'white', borderRadius: '0.5em'}} type="button" disabled={loading} onClick={() => updateData()} value={(loading ? "Loading..." : "Update")}/>
          </h4>
        </div>
        <hr />
        <br />
      </div>
        {data?.length > 1 &&
          <div style={{margin: "auto"}}>
            <div style={{display: 'flex', justifyContent: 'space-around'}}>
              <div>
                <Pie value={data[data.length-1].humidity} max={100} datakey="humidity" fill="#adc6e0" size={250}/>
                <h2 style={{marginTop: '-3em', marginBottom: '2em'}}>{data[data.length-1].humidity}%</h2>
                <h2>Humidity</h2>
                <br />
              </div>
              <div>
                <Pie value={data[data.length-1].temperature} max={43} datakey="humidity" fill="#e61531" size={250}/>
                <h2 style={{marginTop: '-3em', marginBottom: '2em'}}>{data[data.length-1].temperature}&deg;C</h2>
                <h2>Temperature</h2>
                <br />
              </div>
            </div>
            
            <h2>Temperature</h2>
            <Graph data={data} dot={showDots} datakey="temperature" stroke="#b84921" fill="#e61531" showSeconds={Tminus < 5*60}/>
            <br />
            
            <h2>Humidity</h2>
            <Graph data={data} dot={showDots} datakey="humidity" stroke="#2f74b5" fill="#adc6e0" showSeconds={Tminus < 5*60}/>
            <br />
            
            <h2>Humidex</h2>
            <Graph data={data} dot={showDots} datakey="humidex" stroke="#8c840f" fill="#e3d732" showSeconds={Tminus < 5*60}/>
            <br />
            <div style={{display: 'flex', justifyContent: 'space-around'}}>
              <div>
                <Pie value={averages.averageHumidity} max={100} datakey="humidity" fill="#adc6e0" size={150}/>
                <h2 style={{marginTop: '-3em', marginBottom: '2em'}}>{averages.averageHumidity}%</h2>
                <h2>Average Humidity</h2>
                <br />
              </div>
              <div>
                <Pie value={averages.averageTemp} max={43} datakey="humidity" fill="#e61531" size={150}/>
                <h2 style={{marginTop: '-3em', marginBottom: '2em'}}>{averages.averageTemp}&deg;C</h2>
                <h2>Average Temperature</h2>
                <br />
              </div>
              <div>
                <Pie value={averages.averageHumidex} max={43} datakey="humidity" fill="#e3d732" size={150}/>
                <h2 style={{marginTop: '-3em', marginBottom: '2em'}}>{averages.averageHumidex}</h2>
                <h2>Average Humidex</h2>
                <br />
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default App;
