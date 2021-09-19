namespace FinalProject
{
  public interface ICaptureDeserialiser<T> where T : ICapture
	{
    T Deserialise(string line);
	}
	public class CommaSeperatedDeserialiser : ICaptureDeserialiser<SensorCapture>
	{
    public CommaSeperatedDeserialiser(){}
    public SensorCapture Deserialise(string line)
    {
      if(line == null) throw new System.ArgumentNullException("line");
      
      double temp;
      double humidity;
      
      try
      {
        var values = line.Split(',');
        if(
          !double.TryParse(values[0], out temp) ||
          !double.TryParse(values[1], out humidity)
        ) return null;
      }
      catch (System.IndexOutOfRangeException) { return null; }
      return new SensorCapture(temp, humidity);
    }
  }
}
