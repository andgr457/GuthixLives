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
    console.log('weirdgloop', parsed)
    const rsRes = await fetch(`https://secure.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=${parsed[name].id}`)
    const rsText = await rsRes.text()
    console.log('rs', rsText)
  }catch(error){
    console.error(error)
  }

  return {
    name,
    price: price
  };
}