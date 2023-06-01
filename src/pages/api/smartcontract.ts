import axios, {AxiosRequestConfig} from 'axios'
import { IImportNFT, IOrderCheckout, IOrderPayload } from '..'
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export interface ILockTokenPayload {
  address: string
  txin: string
  amount: string
  numDatum: number | string
}

export type TUpdateLock = Pick<ILockTokenPayload, 'address' | 'txin'>

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

export interface ILoginPayload {
  email: string
  password: string
}


export const lockTokenApi = async (payload: ILockTokenPayload) => {
  const action = `transactions/lock`;
  const result = await axios.post(`${BASE_URL}${action}`, payload)
  return result.data
}

export const updateLockApi = async (payload: TUpdateLock): Promise<void> => {
  const action = `transactions/update-lock`;
  await axios.post(`${BASE_URL}${action}`, payload)
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
  const instance = axios.create(config)
  let result: { data: IUtxoApi[] } = { data: [] }
  try {
    result = await instance.get(`${baseUrl}${action}`, config)
  } catch (error) {}
  return result.data
}

export const login = async (payload: ILoginPayload) => {
  const action = `auth/login`;
  const result = await axios.post(`${BASE_URL}${action}`, payload)
  return result.data
}

export const getAdminNfts = async (token: string) => {
  const action = 'nft-groups?page=1&perPage=100&orderBy=desc&status=active'
  const result = await axios.get(`${BASE_URL}${action}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return result.data
}

export const getUserInventory = async (token: string) => {
  const action = 'nft-groups/inventory?page=1&perPage=100&orderBy=desc&status=active'
  const result = await axios.get(`${BASE_URL}${action}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return result.data
}

export const createOrder = async (token: string, order: IOrderPayload) => {
  const action = 'orders'
  const result = await axios.post(`${BASE_URL}${action}`, order, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return result.data
}

export const checkoutOrder = async (token: string, payload: IOrderCheckout) => {
  const action = 'orders/checkout'
  const result = await axios.post(`${BASE_URL}${action}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return result.data
}

export const importNFT = async (token: string, payload: IImportNFT) => {
  const action = 'nft-groups/import'
  const result = await axios.patch(`${BASE_URL}${action}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return result.data
}