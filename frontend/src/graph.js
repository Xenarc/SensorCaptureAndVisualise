import {Tooltip, YAxis, XAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, Label} from 'recharts'

const Graph = ({data, dot, datakey,stroke, fill, showSeconds, xlabel, ylabel}) => {
  return (
    <>
    {data &&
      <>
      <ResponsiveContainer width="97.5%" height={400} >
        {/* <LineChart data={data} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
          <Line scale="time" isAnimationActive={false} type="monotone" dataKey={datakey} stroke="#8884d8" dot={dot} connectNulls={false}/>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="timestamp" tickFormatter={val => new Date(val * 1000).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit',hour12: true})} scale="time" domain={['dataMin', 'dataMax']}/>
          <YAxis dataKey={datakey} />
          <Tooltip />
        </LineChart> */}
        <AreaChart data={data} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
          <Area scale="time" isAnimationActive={false} type="monotone" dataKey={datakey} stroke={stroke} fill={fill} dot={dot} connectNulls={false} />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="timestamp" tickFormatter={val => new Date(val * 1000).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', second: (showSeconds ? '2-digit' : undefined ), hour12: true})} scale="time" domain={['dataMin', 'dataMax']}/>
          <YAxis dataKey={datakey}>
          <Label
            value={ylabel}
            position="insideLeft"
            angle={-90}
            style={{ textAnchor: 'middle' }}
          />
          </YAxis>
          <Tooltip />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{textAlign: 'center'}}>{xlabel}</div>
      </>
    }
  </>);
}

export default Graph;
