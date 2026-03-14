import { DateTime } from 'luxon';
import { BaseService } from '../BaseService';
import type { CharacterGEItem } from '../../types/Characters';

export class CharacterItemService extends BaseService {

  constructor(){
    super()
  }

  generateItemId(itemName: string): string {
    const nowMillis = DateTime.utc().toMillis()
    const name = itemName?.trim()?.replace(/ /g, "_")
    return `${name}__${nowMillis}`
  }

  generateNewItem(itemName: string, characterId: string): CharacterGEItem {
    return {
      id: this.generateItemId(itemName.trim()),
      name: itemName.trim(),
      characterId
    }
  }
}