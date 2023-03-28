import axios from 'axios'
const BASE_URL = 'http://139.180.131.75:5101/'

export interface ILockTokenPayload {
  address: string
  txin: string
  amount: string
  numDatum: number | string
}

export interface IUnlockTokenPayload {
  address: string
  txin: string
  collateral: string
  numRedeem: number | string
}
export interface IUtxoApi {
  address: string
  amount: { unit: string, quantity: number }[]
  block: string
  data_hash: string
  inline_datum: string | null
  output_index : number
  reference_script_hash: string | null
  tx_hash: string
  tx_index: number
}
export const lockTokenApi = async (payload: ILockTokenPayload) => {
  const action = `transactions/lock`;
  const result = await axios.post(`${BASE_URL}${action}`, payload)
  return result.data
}
export const unlockTokenApi = async (payload: IUnlockTokenPayload) => {
  const action = `transactions/unlock`;
  const result = await axios.post(`${BASE_URL}${action}`, payload)
  return result.data
}

export const getUtxosApi = async (address: string) => {
  const baseUrl = 'https://cardano-preprod.blockfrost.io/api/v0/'
  const action = `addresses/${address}/utxos`
  const instance = axios.create<Record<string, any>>({headers: {'project_id': 'preprodMq1wcBAUmEWGsJQPQbarPAEd6TJqRHj0'}})
  const result: { data: IUtxoApi[] } = await instance.get(`${baseUrl}${action}`)
  return result.data
}
