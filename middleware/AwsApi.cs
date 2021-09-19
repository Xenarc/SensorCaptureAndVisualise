using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace FinalProject
{
	public class AwsApi
	{
		static HttpClient client = new HttpClient();
		public string endpoint { get; private set; }
		
		public async Task<bool> Send(string message)
		{
			PrintUtility.PrintStatus("Sending Packet", Program.PACKET_SIZE);
			using (HttpResponseMessage response =
				await client.PostAsync(endpoint, new StringContent(message)))
			{
				PrintUtility.PrintStatus(await response.Content.ReadAsStringAsync(), Program.PACKET_SIZE);
				return response.IsSuccessStatusCode;
			}
		}
		
		public AwsApi(string url, string endpoint, string mediaType)
		{
			this.endpoint = endpoint;
			client.BaseAddress = new Uri(url);
			client.DefaultRequestHeaders.Accept.Clear();
			client.DefaultRequestHeaders.Accept.Add(
					new MediaTypeWithQualityHeaderValue(mediaType));
		}
	}
}
