import { ServerRespond } from './DataStreamer';

//Process raw data from the server before the Graph component renders it

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}

export class DataManipulator {

  static calculateBounds(historicalData: ServerRespond[]): {upper: number, lower: number} {
    let totalRatio = 0;
    let count = 0;

    historicalData.forEach(data => {
      const priceABC = (data.top_ask.price + data.top_bid.price) / 2;
      const priceDEF = (data.top_ask.price + data.top_ask.price) / 2;
      const ratio = priceABC / priceDEF;
      totalRatio += ratio;
      count++;
    });
    const averageRatio = totalRatio / count;
    const upperBound = averageRatio * 1.05;
    const lowerBound = averageRatio * 0.95;

    return { upper: upperBound, lower: lowerBound};
  }

  static generateRow(serverRespond: ServerRespond[], bounds: { upper: number, lower: number }): Row {
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) /2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) /2;
    const ratio = priceABC / priceDEF;
  

    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ? serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: bounds.upper,
      lower_bound: bounds.lower,
      trigger_alert: (ratio > bounds.upper || ratio < bounds.lower) ? ratio : undefined,
    };
  }
}
