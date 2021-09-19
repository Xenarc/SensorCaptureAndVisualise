using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace FinalProject
{
	static class PrintUtility
	{
		public static void PrintStatus(string status, int position)
		{
			(int left, int top) = Console.GetCursorPosition();
			Console.SetCursorPosition(position + 2, top);
			Console.Write(status);
			Console.SetCursorPosition(left, top);
		}
	}
	class Program
	{
		public static int PACKET_SIZE;
		static DataPacket<SensorCapture> dataPacket;
		static IPublisher<SensorCapture> publisher;
		static ISerialInterface<SensorCapture> arduino;
		static void Main(string[] args)
		{
			string input;
			do {
				Console.WriteLine("Enter the Packet Size: ");
				input = Console.ReadLine();
			}while (!int.TryParse(input, out PACKET_SIZE));
			
			
			arduino = new Arduino<SensorCapture>(new CommaSeperatedDeserialiser());
			dataPacket = new DataPacket<SensorCapture>(PACKET_SIZE);
			
			publisher = new CloudPublisher<SensorCapture>("https://ifj8924a08.execute-api.ap-southeast-2.amazonaws.com");
			
			arduino.CaptureAvailableEvent += CaptureAvailable;
			dataPacket.PacketReadyEvent += PacketReady;
			
			arduino.Begin();
			
			Console.WriteLine("Press Esc to stop.");
			Console.TreatControlCAsInput = true;
			
			ConsoleKeyInfo key = new ConsoleKeyInfo();
			
			while(key.Key != ConsoleKey.Escape)
			{
				key = Console.ReadKey(true);
				
				// If CTRL+C
				if((
					(key.Modifiers & ConsoleModifiers.Control) != 0) &&
					key.Key == ConsoleKey.C
				) break;
				
				// If Escape
				if(key.Key == ConsoleKey.Escape) break;
			}
			
			arduino.Stop();
			Console.TreatControlCAsInput= false;
		}
		static void CaptureAvailable(object sender, DataAvailableEventArgs<SensorCapture> e)
		{
			if(e.Data != null)
			{
				// PrintUtility.PrintStatus(e.Data.ToString() + new string(' ', 50), PACKET_SIZE + 24);
				Console.Write(".");
				dataPacket.Add(e.Data);
			}
			else
			{
				// PrintUtility.PrintStatus(e.Line + new string(' ', 50), PACKET_SIZE + 24);
				Console.Write("#");
			}
		}
		
		static void PacketReady(DataPacket<SensorCapture> packet, DataPacketReadyEventArgs eventArgs)
		{
			System.Console.WriteLine();
			eventArgs.Success = publisher.Publish(packet);
		}
	}
}
