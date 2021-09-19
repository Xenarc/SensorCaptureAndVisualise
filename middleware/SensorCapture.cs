using System.Text.Json.Serialization;

namespace FinalProject
{
  public class SensorCapture : ICapture
  {
    [JsonInclude]
    public double Temperature;
    [JsonInclude]
    public double Humidity;

    public SensorCapture(double temperature, double humidity)
    {
      Temperature = temperature;
      Humidity = humidity;
    }
    public override string ToString() => $"T:{Temperature:0.##} H:{Humidity:0.##}";
  }
  
  public interface ICapture {}
}
