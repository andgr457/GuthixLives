import type { WeirdGloopAPIExchangeResponse } from '../interfaces/repositories/WeirdGloopAPI';
import { WeirdGloopAPIRepository } from './WeirdGloopAPIRepository';

export class WeirdGloopAPIExchangeRepository extends WeirdGloopAPIRepository {
  async getExchangeHistoryItemByGame(game: 'osrs' | 'rs', itemName: string): Promise<WeirdGloopAPIExchangeResponse> {
    const response = await fetch(`${this.BASE_API_URL}/exhange/history/${game}/latest?name=${itemName}`)
    return await response.json() as WeirdGloopAPIExchangeResponse
  }
}