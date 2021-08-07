using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;

namespace FinalProject
{
	public class DataPacketReadyEventArgs
	{
		
		private bool success;
		public bool Success
		{
				get => success;
				set {
					success = value;
					
					if(value == true)
						SuccessEvent?.Invoke();
					else
						FailureEvent?.Invoke();
				}
		}
		
		
		
		// Success
		public delegate void SuccessEventHandler();
		public event SuccessEventHandler SuccessEvent;
		
		// Failure
		public delegate void FailureEventHandler();
		public event FailureEventHandler FailureEvent;
	}
	
	public class DataPacket<T> : SortedList<DateTime, T>
	{
		public delegate void DataPacketReadyEventHandler(DataPacket<T> packet, DataPacketReadyEventArgs e);
		public event DataPacketReadyEventHandler PacketReadyEvent;
		public Queue<KeyValuePair<DateTime, T>> backlog { get; private set; }
		
    [JsonIgnore]
		public int BacklogCount { get => backlog.Count; }
    [JsonIgnore]
		public int TotalCount { get => Count + BacklogCount; }
		
		public DataPacket(int capacity) : base(capacity)
		{
			Capacity = capacity;
			backlog = new Queue<KeyValuePair<DateTime, T>>();
		}
		
		private void FinalisePacket()
		{
			Clear();
			ReleaseBacklog();
		}
		private void ReleaseBacklog()
		{
			KeyValuePair<DateTime, T> backloggedItem;
			while(base.Count < Capacity && backlog.Count > 0) // while packet is not full
			{
				backloggedItem = backlog.Dequeue();
				Add(backloggedItem.Key, backloggedItem.Value);
			}
		}
		
		// Every time we add an element, we check the capactity. If it's full, we
		// notify the subscriber; they then they call args.sucess(), which then
		// releases the backlog
		public new void Add(DateTime timestamp, T value)
		{
			if(base.Count >= Capacity) // Packet is full
			{
				backlog.Enqueue(new KeyValuePair<DateTime, T>(timestamp, value));
				
				var eventArgs = new DataPacketReadyEventArgs();
				eventArgs.SuccessEvent += FinalisePacket; // If the packet was consumed, we release the backlog
				PacketReadyEvent?.Invoke(this, eventArgs);
			}
			else // Packet is not full
			{
				base.Add(timestamp, value);
			}
		}
		
		public void Add(T value) => Add(DateTime.UtcNow, value);

		public override bool Equals(object obj)
		{
			return base.Equals(obj);
		}

		public override int GetHashCode()
		{
			return base.GetHashCode();
		}

		public void PrintStatus()
		{
			(int left, int top) = Console.GetCursorPosition();
			Console.SetCursorPosition(Capacity + 4, Console.CursorTop);
			Console.Write("[");
			for (var i = 0; i < Count; i++)
				Console.Write("X");
			for (var i = 0; i < Capacity-Count; i++)
				Console.Write(" ");
			Console.Write("] ");
			
			for (var i = 0; i < BacklogCount; i++)
				Console.Write("O");
			
			Console.SetCursorPosition(left, top);
		}
	}
}
