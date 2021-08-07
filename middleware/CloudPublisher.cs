using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace FinalProject
{
	public class CloudPublisher<T> : IPublisher<T>
	{
		private static Thread httpThread;
		private const string host = "https://7xkylkhl0h.execute-api.ap-southeast-2.amazonaws.com"; // get from CloudFormation API gateway
		private const string endpoint = "";
		private static AwsApi Api;
		public CloudPublisher()
		{
			Api = new AwsApi(host, endpoint, "application/json");
		}
		
		public bool Publish(DataPacket<T> body)
		{
			bool isSuccess = false;
			
			PrintUtility.PrintStatus("Publish!");
			httpThread = new Thread(async () => 
				isSuccess = await Api.Send(JsonSerializer.Serialize(body)));
			
			httpThread.Start();
			
			httpThread.Join();
			
			return isSuccess;
		}
	}
}
