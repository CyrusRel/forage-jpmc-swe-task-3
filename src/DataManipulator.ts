import { ServerRespond } from './DataStreamer';
// Script purpose process raw data from the server before the Graph component renders it


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
  private static calculateAveragePrice(data: ServerRespond): number {
    return (data.top_ask.price + data.top_bid.price) / 2;
  }

  //Calculates the lower and higher bounds using historical data
  static calculateBounds(historicalData: ServerRespond[]): { upper: number, lower: number} {
    if (historicalData.length < 2) {
      return { upper: 1.05, lower: 0.95 };
    }   

   const startPrice = DataManipulator.calculateAveragePrice(historicalData[0]);
   const endPrice = DataManipulator.calculateAveragePrice(historicalData[historicalData.length - 1]);
   const ratio = startPrice / endPrice;

   const upperBound = ratio * 1.05;
   const lowerBound = ratio * 0.95;
   return { upper: upperBound, lower: lowerBound};
  }

// Generates a Row object from server response and calculated bounds
  static generateRow(serverRespond: ServerRespond[], bounds: { upper: number, lower: number }): Row {
    const priceABC = DataManipulator.calculateAveragePrice(serverRespond[0]);
    const priceDEF = DataManipulator.calculateAveragePrice(serverRespond[1]);
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
