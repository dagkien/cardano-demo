import axios, {AxiosRequestConfig} from 'axios'
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

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
  const baseUrl = process.env.NEXT_PUBLIC_BLOCKFROST_URL || ''
  const action = `addresses/${address}/utxos`
  const config = { headers: {'project_id': process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY}} as AxiosRequestConfig
  console.log(config)
  const instance = axios.create(config)
  const result: { data: IUtxoApi[] } = await instance.get(`${baseUrl}${action}`, config)
  return result.data
}
