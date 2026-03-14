export interface WeirdGloopAPIExchangeResponse {
  [itemName: string]: {
    id: string
    //iso
    timestamp: string
    price: number
    volume: number
  }
}