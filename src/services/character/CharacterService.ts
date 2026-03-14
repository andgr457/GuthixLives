import { DateTime } from 'luxon';
import { BaseService } from '../BaseService';
import type { Character } from '../../types/Characters';

export class CharacterService extends BaseService {
  constructor(){
    super()
  }

  generateCharacterId(characterName: string): string {
    const nowMillis = DateTime.utc().toMillis()
    const name = characterName?.trim()?.replace(/ /g, "_")
    return `${name}__${nowMillis}`
  }

  generateNewCharacter(characterName: string): Character {
    return {
      id: this.generateCharacterId(characterName.trim()),
      name: characterName.trim(),
      showItemHistory: false,
      showItems: false,
      showItemHistoryItemId: undefined,
      showItemItemId: undefined
    }
  }
}