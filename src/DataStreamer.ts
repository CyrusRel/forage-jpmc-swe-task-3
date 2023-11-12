export interface Order {
  price: number,
  size: number,
}
export interface ServerRespond {
  stock: string,
  top_bid: Order,
  top_ask: Order,
  timestamp: Date,
}

// Handles API requests for real-time and historical data
class DataStreamer {
  static API_URL: string = 'http://localhost:8080/query?id=1';
  static HISTORICAL_DATA_URL: string = 'http://localhost:8080/query?id=1';

  static getData(callback: (data: ServerRespond[]) => void): void {
    const request = new XMLHttpRequest();
    request.open('GET', DataStreamer.API_URL, false);

    request.onload = () => {
      if (request.status === 200) {
        callback(JSON.parse(request.responseText));
      } else {
        alert ('Request failed');
      }
    }

    request.send();
  }

  // Method to fetch historical data from the server
  static getHistoricalData(callback: (data: ServerRespond[]) => void): void {
    const request = new XMLHttpRequest();
    request.open('GET', DataStreamer.HISTORICAL_DATA_URL, true);

    request.onload = () => {
      if (request.status === 200) {
        callback(JSON.parse(request.responseText));
      } else {
        alert('Request for historical data failed');
      }
    };
    request.send();
  }

}

export default DataStreamer;