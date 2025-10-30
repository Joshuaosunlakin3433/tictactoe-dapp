export function abbreviateAddress(address: string) {
  return `${address.substring(0, 5)}...${address.substring(36)}`;
}

export function abbreviateTxnId(txnId: string) {
  return `${txnId.substring(0, 5)}...${txnId.substring(62)}`;
}

export function explorerAddress(address: string) {
  return `https://explorer.hiro.so/address/${address}?chain=testnet`;
}

export async function getStxBalance(address: string) {
  const baseUrl = "https://api.testnet.hiro.so";
  const url = `${baseUrl}/extended/v1/address/${address}/stx`;

  const response = await fetch(url).then((res) => res.json());
  const balance = parseInt(response.balance);
  return balance;
}

//convert a raw STX amount to a human readable format by respecting the 6 decimal places

export function formatStx(amount: number) {
  return parseFloat((amount / 10 ** 6).toFixed(2));
}

//convert a raw STX amount to a human readable format by respecting the 6 decimal places
export function parseStx(amount: number) {
  return amount * 10 ** 6;
}
