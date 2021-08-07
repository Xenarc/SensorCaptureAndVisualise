using System;
using System.Collections.Generic;
using System.IO.Ports;
using System.Threading;
using System.Threading.Tasks;

namespace FinalProject
{
	// https://docs.microsoft.com/en-us/dotnet/api/system.io.ports.serialport?view=dotnet-plat-ext-5.0
	
	public delegate void LineAvailableEventHandler(object sender, LineAvailableEventArgs e);
	public class LineAvailableEventArgs
	{
		public LineAvailableEventArgs(string line) { Line = line; }
		public string Line { get; } // readonly
	}
	
	public class Arduino : ISerialInterface
	{
		
		private static SerialPort _serialPort;
		private static Thread readThread;
		private volatile static bool _continue;
		
		public event LineAvailableEventHandler LineAvailableEvent;

		public Arduino()
		{
			readThread = new Thread(Read);
			CreateSerialPort(out _serialPort);
		}
		
		~Arduino()
		{
			readThread?.Join();
			_serialPort?.Close();
		}
		
		public virtual void Begin()
		{

			_serialPort.Open();
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
					LineAvailableEvent?.Invoke(this, new LineAvailableEventArgs(line));
				}
				catch (TimeoutException) {}
			}
		}

		public void Stop()
		{
			_continue = false;
			
			readThread.Join();
			_serialPort.Close();
		}
	}
}
