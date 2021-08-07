using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace FinalProject
{
	static class PrintUtility
	{
		public static void PrintStatus(string status, int position=Program.PACKET_SIZE+4)
		{
			(int left, int top) = Console.GetCursorPosition();
			Console.SetCursorPosition(position, top);
			Console.Write(status);
			Console.SetCursorPosition(left, top);
		}
	}
	class Program
	{
		public const int PACKET_SIZE = 2;
		static DataPacket<double> dataPacket = new DataPacket<double>(PACKET_SIZE);
		static IPublisher<double> publisher = new CloudPublisher<double>();
		static ISerialInterface arduino = new Arduino();
		static void Main(string[] args)
		{
			arduino.LineAvailableEvent += LineAvailable;
			dataPacket.PacketReadyEvent += PacketReady;
			Begin();
			
			Console.WriteLine("Press Esc to stop.");
			Console.TreatControlCAsInput = true;
			
			ConsoleKeyInfo key;
			
			while(true)
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
		}
		static void Begin() => arduino.Begin();
		
		static void LineAvailable(object sender, LineAvailableEventArgs e)
		{
			double entry;
			
			if(double.TryParse(e.Line, out entry))
			{
				dataPacket.Add(entry);
				Console.Write(".");
			}
			else
				Console.Write("#");
		}
		
		static void PacketReady(DataPacket<double> packet, DataPacketReadyEventArgs eventArgs)
		{
			System.Console.WriteLine();
			publisher.Publish(packet);
			eventArgs.Success = true;
		}
	}
}
