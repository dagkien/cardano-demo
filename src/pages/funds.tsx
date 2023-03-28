import {
  KoiosProvider, largestFirst, Transaction,
  UTxO
} from "@meshsdk/core";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import {
  getUtxosApi,
  ILockTokenPayload,
  IUnlockTokenPayload, IUtxoApi,
  lockTokenApi,
  unlockTokenApi
} from "@/pages/api/smartcontract";
import {AxiosError} from "axios";

const TADA_LOVELACE = 1000000
const SC_ADDRESS = 'addr_test1wq955cvne75hz2cal0q3wfmlqe5jv3w0vs7kaxkc0twef0gmhhqwg'
const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [lockedTADA, setLockedTADA] = useState<string>('');
  const [unlockTx, setUnlockTx] = useState<string>('');
  const [address, setAddress] = useState("");
  const [listTx, setListTx] = useState<IUtxoApi[]>([]);
  const [secretUnlock, setSecretUnlock] = useState<number | string>('');
  const [secretLock, setSecretLock] = useState<number | string>('');
  const [key, setKey] = useState<number | String>('');

  async function lockToken() {
    if (!key || !lockedTADA) {
      alert("Please enter amount to lock TADA and secret ...");
      return;
    }
    if (+lockedTADA < 1.5) {
      alert("Lock TADA must be greater than or equal 1.5 TADA");
      return;
    }
    const utxos = await wallet.getUtxos();
    const costLovelace = `${+lockedTADA * TADA_LOVELACE}`
    const selectedUTXO = utxos.find(u => {
      return u.output.amount.length === 1 && u.output.amount[0].quantity > +costLovelace
    })
    if (!selectedUTXO) {
      alert('Could not find any matching utxo satisfied transaction!')
      return
    }
    const payload: ILockTokenPayload = {
      address,
      txin: selectedUTXO.input.txHash + '#' + selectedUTXO.input.outputIndex,
      amount: costLovelace + ' lovelace',
      numDatum: secretLock
    }
    try {
      const response = await lockTokenApi(payload)
      const unsignedTx = response?.data?.cborHex
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      if (txHash) {
        setLockedTADA('')
        console.log(`TADA locked successfully!\nTX# ${txHash}`)
        alert(`TADA locked successfully!\n#${txHash}`)
      }
    } catch (error) {
      const message = error instanceof AxiosError ? error?.response?.data?.error : error
      if (!message) return
      alert(`Transaction error: ${message}`)
    }
  }

  async function unlockToken() {

    const collateralUTXOs = await wallet.getCollateral();
    const collateralUTXO = collateralUTXOs.length ? collateralUTXOs[0] : []
    const utxos = await getUtxosApi(SC_ADDRESS)
    const selectedUTXO = utxos.find(u => {
      return u.tx_hash === unlockTx
    })
    if (!selectedUTXO) {
      alert("No matched transactions in smart contract !")
      return
    }
    if (!collateralUTXO) {
      alert("You must enable collateral in your wallet !")
      return
    }
    const payload: IUnlockTokenPayload = {
      address,
      txin: selectedUTXO.tx_hash + '#' + selectedUTXO.tx_index,
      collateral: collateralUTXO.input.txHash + '#' + collateralUTXO.input.outputIndex,
      numRedeem: secretUnlock
    }
    try {
      const response = await unlockTokenApi(payload)
      const unsignedTx = response?.data?.cborHex
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      if (txHash) {
        setSecretUnlock('')
        setUnlockTx('')
        console.log(`TADA unlocked successfully!\nTX# ${txHash}`)
        alert(`TADA unlocked successfully!\n#${txHash}`)
      }
    } catch (err) {
      console.log(err)
      const message = err instanceof AxiosError ? err?.response?.data?.error : err.message
      if (!message) return
      alert(`Transaction error: ${message}`)
    }
  }

  const handleLockChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLockedTADA(e.target.value)
  };

  const handleUnlockChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnlockTx(e.target.value)
  };

  const handleOnChangeSecret = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = Number(e.target.value)
    if (key > TADA_LOVELACE) {
      alert(`Secret key must less than ${TADA_LOVELACE}`)
      return
    }
    setKey(key)
    const slotNumber = Math.floor(new Date().getTime() / 1000) - 1679739174 + 24055973
    const secret = Number(`${slotNumber}${e.target.value}`)
    setSecretLock(secret)
  }

  const generateAssets = (item: IUtxoApi) => {
    let asset = ''
    return item.amount?.reduce((a: string, unitAmount) => {
      a += `${unitAmount.quantity} ${unitAmount.unit}`
      return a
    }, asset)
  }

  useEffect(() => {
    const getAddress = async () => {
      if (!connected) return
      const addressWallet = await wallet?.getChangeAddress() as string;
      setAddress(addressWallet);
    }
    getAddress()
  }, [connected])
  useEffect(() => {
    const getListTransaction = async () => {
      const scUtxos = await getUtxosApi(SC_ADDRESS)
      setListTx(scUtxos)
    }
    getListTransaction()
  }, [])
  return (
    <>
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          alignItems: "center",
          gap: "50px",
          paddingTop: '20px'
        }}
      >
        {connected && address}
        <CardanoWallet label="Connect to wallet" />
        <div style={{
          display: "flex",
          alignItems: "start",
          gap: "50px",
          flexWrap: "wrap",
        }}>

          {connected && (
            <table>
              <thead>
              <tr>
                <th style={{ border: '1px solid white', padding: '10px' }}>STT</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Tx</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Txix</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Amount</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>DataHash</th>
              </tr>
              </thead>
              <tbody>
              {listTx?.map((item: IUtxoApi, index) => (
                <tr key={index} >
                  <th style={{ border: '1px solid white', padding: '10px' }}>{index + 1}</th>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item?.tx_hash}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item?.tx_index}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{generateAssets(item)}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item?.data_hash}</td>
                </tr>
              ))}
              </tbody>
            </table>
          )}
          {connected && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                gap: "30px",
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <h3>Unlock TADA</h3>
                <div
                  style={{
                    border: "1px solid white",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      border: "1px solid white",
                      padding: "20px",
                      display: "flex",
                      gap: "10px",
                      height: "85px",

                    }}
                  >
                    <input
                      name="transaction"
                      placeholder="TX"
                      onChange={handleUnlockChanged}
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        width: "260px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      border: "1px solid white",
                      padding: "20px",
                      display: "flex",
                      gap: "30px",
                      height: "85px",
                    }}
                  >
                    <input
                      name="transaction"
                      onChange={(e) => setSecretUnlock(Number(e.target.value))}
                      placeholder="secret"
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        width: "260px",
                      }}
                    />
                  </div>
                  <button
                    onClick={unlockToken}
                    style={{ padding: "10px", borderRadius: "10px" }}
                  >
                    Unlock
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <h3>Lock TADA</h3>
                <div
                  style={{
                    border: "1px solid white",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      border: "1px solid white",
                      padding: "20px",
                      display: "flex",
                      gap: "10px",
                      height: "85px",

                    }}
                  >
                    <input
                      name="transaction"
                      placeholder="TADA Amount"
                      onChange={handleLockChanged}
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        width: "260px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      border: "1px solid white",
                      padding: "20px",
                      display: "flex",
                      gap: "10px",
                      height: "85px",
                    }}
                  >
                    <input
                      name="transaction"
                      placeholder="key"
                      onChange={handleOnChangeSecret}
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        width: "260px",
                      }}
                    />
                  </div>
                  {key ? `Secret: ${secretLock}` : '' }
                  <button
                    onClick={lockToken}
                    style={{ padding: "10px", borderRadius: "10px" }}
                  >
                    Lock
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </>
  );
};

export default Home;
