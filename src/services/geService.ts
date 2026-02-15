export interface GEItemData {
  name: string;
  price?: number
  timestamp?: string;
}

interface GEItemsMap {
  [itemName: string]: GEItemData;
}

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