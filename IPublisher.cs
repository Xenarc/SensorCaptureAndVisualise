using System.Threading.Tasks;

namespace FinalProject
{
	public interface IPublisher<T>
	{
		bool Publish(DataPacket<T> body);
	}
}
