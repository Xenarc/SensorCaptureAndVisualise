namespace FinalProject
{
	public interface ISerialInterface
	{
		event LineAvailableEventHandler LineAvailableEvent;
		void Begin();
		void Stop();
	}
}

