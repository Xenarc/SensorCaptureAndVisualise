using System;
using System.Collections.Generic;
using System.IO.Ports;
using System.Threading;
using System.Threading.Tasks;

namespace FinalProject
{
  public interface ISerialInterface<T> where T : ICapture
	{
		event CaptureAvailableEventHandler<T> CaptureAvailableEvent;
		void Begin();
		void Stop();
	}
  public delegate void CaptureAvailableEventHandler<T>(object sender, DataAvailableEventArgs<T> e);
  public class DataAvailableEventArgs<T>
  {
    public DataAvailableEventArgs(T data, string line) { Data = data; Line = line; }
    public readonly T Data;
    public readonly string Line;
  }
  
  public class Arduino<T> : ISerialInterface<T>, IDisposable where T : ICapture
  {
    private static SerialPort _serialPort;
    private static Thread readThread;
    private volatile static bool _continue;
    public event CaptureAvailableEventHandler<T> CaptureAvailableEvent;
    private readonly ICaptureDeserialiser<T> deserialiser;
    
    public Arduino(ICaptureDeserialiser<T> deserialiser)
    {
      if(deserialiser == null) throw new ArgumentNullException("deserialiser");
      this.deserialiser = deserialiser;
      CreateSerialPort(out _serialPort);
      readThread = new Thread(Read);
    }
    
    ~Arduino() => Dispose();

    public void Begin()
    {
      try
      {
        _serialPort.Open();
      }
      catch (System.IO.FileNotFoundException)
      {
        Console.WriteLine("Arduino Not Connected!");
        return;
      }
      
      _continue = true;
      readThread.Start();
    }

    private static void CreateSerialPort(out SerialPort serialPort)
    {
      serialPort = new SerialPort();
      // Allow the user to set the appropriate properties.
      serialPort.PortName = "COM5";
      serialPort.BaudRate = 9600;
      serialPort.Parity = Parity.Even;
      serialPort.DataBits = 7;
      serialPort.StopBits = StopBits.One;
      serialPort.WriteTimeout = 128; // max line length of ~128 chars
    }
    private void Read()
    {
      System.Console.WriteLine($"Reading Serial Port ({_serialPort.PortName})... ");
      _serialPort.DiscardInBuffer(); // clear serial backlog
      string line;
      while (_continue)
      {
        line = "";
        try
        {
          line = _serialPort.ReadLine();
        }
        catch (TimeoutException) { }
        CaptureAvailableEvent?.Invoke(this, new DataAvailableEventArgs<T>(deserialiser.Deserialise(line), line));
      }
    }
    
    public void Stop()
    {
      _continue = false;
      Dispose();
    }

    public void Dispose()
    {
      if(readThread?.IsAlive ?? false)
        readThread?.Join();
      
      if(_serialPort?.IsOpen ?? false)
        _serialPort?.Close();
    }
  }
}
