import type { GEItemData, GEItemsMap } from '../types/Item';

// Fetch GE prices by item ID(s)
export async function fetchGEItem(name: string): Promise<GEItemData> {
  const res = await fetch(`https://api.weirdgloop.org/exchange/history/rs/latest?name=${name}`);
  const body = await res.text()
  let parsed: GEItemsMap
  let price = undefined
  try {
    parsed = JSON.parse(body)
    price = parsed[name].price
  }catch(error){
    console.error(error)
  }

  return {
    name,
    price: price
  };
}