export interface A2UIStreamMessage {
  createSurface?: any;
  updateComponents?: any[];
  updateDataModel?: any;
  deleteSurface?: any;
}

export class A2UIStream {
  private eventSource: EventSource | null = null;
  private listeners: ((message: A2UIStreamMessage) => void)[] = [];

  constructor(private url: string) {}

  connect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(this.url);
    
    this.eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as A2UIStreamMessage;
        this.listeners.forEach(listener => listener(message));
      } catch (error) {
        console.error('Error parsing A2UI stream message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('A2UI stream error:', error);
    };

    this.eventSource.onopen = () => {
      console.log('A2UI stream connected');
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  addListener(listener: (message: A2UIStreamMessage) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (message: A2UIStreamMessage) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  sendAction(action: any): void {
    // Send action to backend via POST request
    fetch(`${this.url}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action),
    }).catch(error => {
      console.error('Error sending A2UI action:', error);
    });
  }
}
