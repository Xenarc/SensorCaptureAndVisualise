import React, { useCallback, useEffect, useState } from 'react';
import './App.css';

import {LineChart, Line, Tooltip, YAxis, XAxis, CartesianGrid, ResponsiveContainer} from 'recharts'

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
function App() {
  const [data, setData] = useState();
  const [showDots, setShowDots] = useState(true);
  const [autoUpdate, setSutoUpdate] = useState(false);
  const [Tminus, setTminus] = useState(94000);  // from the last 10 minutes
  const [fromTimestamp, setFromTimestamp] = useState(Math.floor(new Date().getTime()/1000 - Math.pow(1.0001, Tminus)));
  
  const updateData = useCallback(() =>
  {
    const requestOptions = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"fromTimestamp": fromTimestamp}),
    };
    fetch("https://8n9c6elcti.execute-api.ap-southeast-2.amazonaws.com", requestOptions) // TODO: change to env var
      .then(result => result.json())
      .then(response => JSON.parse(response.body))
      .then(
        (body) =>{
          if(!body.ok){
            console.log("Get Items Failed: ok = false")
          }else{
            setData(body.message.Items);
            console.log(body.message.Items.length);
            setFromTimestamp(Math.floor(new Date().getTime()/1000 - Math.pow(1.0001, Tminus)));
          }
        },
        (error) => console.log("Error!\n" + error)
      );
  }, [fromTimestamp]); // TODO: fix not having Tminus in the deps array
  
  useEffect(() => { updateData(); }, [updateData]);
  
  useEffect(() => {
    if(autoUpdate){
      const interval = setInterval(() => {
        updateData();
      }, 20000);
    
      return () => clearInterval(interval);
    }
  }, [updateData, autoUpdate])
  
  return (
    <div className="App">
      <h1>Hello World!</h1>
      <h4>
        History: 
        <input
          type="range"
          min="1"
          max="180000"
          step="10"
          style={{width:" 25vw"}}
          defaultValue={Tminus}
          onChange={e => setTminus(e.target.value)}
        />
        <br />
        ({secondsToDHMS(Math.pow(1.0001, Tminus))})
      </h4>
      <h4>
        Show points?
        <input type="checkbox" checked={showDots} onChange={() => setShowDots(!showDots)}/>
      </h4>
      <h4>
        Auto Update?
        <input type="checkbox" checked={autoUpdate} onChange={() => setSutoUpdate(!autoUpdate)}/>
      </h4>
      <input type="button" onClick={() => updateData()} value="Update"/>
      <div style={{margin: "auto"}}>
        {data &&
        <ResponsiveContainer width="100%" height={400} >
          <LineChart data={data} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
            <Line scale="time" isAnimationActive={false} type="monotone" dataKey="value" stroke="#8884d8" dot={showDots} connectNulls={false}/>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="timestamp" tickFormatter={val => new Date(val * 1000).toLocaleTimeString()} scale="time" domain={['dataMin', 'dataMax']}/>
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
        }
      </div>
    </div>
  );
}

export default App;
