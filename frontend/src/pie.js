import {Cell, Pie, PieChart, ResponsiveContainer} from 'recharts'

const PieGraph = ({value, datakey, fill, max, size}) => {
  const data = [{name: datakey, value: value},{name: "nul", value: max-value}];
  const COLORS = [fill, '#D0D0D0'];
  return (
    <ResponsiveContainer height={size} width={(size+10)*2}>
      <PieChart>
        <Pie
          data={data}
          cx={size}
          cy={size}
          startAngle={180}
          endAngle={0}
          innerRadius={size*0.8}
          outerRadius={size}
          dataKey='value'
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
          <h2>Humidity: {value}</h2>
      </PieChart>
    </ResponsiveContainer>
    );
}

export default PieGraph;
