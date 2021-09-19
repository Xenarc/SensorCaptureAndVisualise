using System;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace FinalProject
{
	public class CloudPublisher<T> : IPublisher<T> where T : ICapture
	{
		private static Thread httpThread;
		private static AwsApi Api;
    public CloudPublisher(string host) => Api = new AwsApi(host, "", "application/json");
    
    public bool Publish(DataPacket<T> body)
		{
			PrintUtility.PrintStatus("Publish!", Program.PACKET_SIZE);
			
			Task<bool> httpSend = Api.Send(JsonSerializer.Serialize(body));
			
			bool isSuccess = false;
			try
			{
				httpSend.ContinueWith(t => isSuccess = t.Result).Wait();
			}
			catch (System.AggregateException)
			{
				Console.WriteLine("HTTP Request Failed!");
				isSuccess = false;
			}
			
			return isSuccess;
		}
	}
	public interface IPublisher<T>
	{
		bool Publish(DataPacket<T> body);
	}
}
