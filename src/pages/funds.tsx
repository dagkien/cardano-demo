import {
    KoiosProvider,
    Quantity,
    resolveDataHash,
    Transaction,
    Unit
} from "@meshsdk/core";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { keepRelevant } from '@meshsdk/core';
import { Data } from "@meshsdk/core/dist/common/types/Data";
import { script } from "@/config/contract";


const TADA_LOVELACE = 1000000
const SC_ADDRESS = 'addr_test1wq955cvne75hz2cal0q3wfmlqe5jv3w0vs7kaxkc0twef0gmhhqwg'


const Home: NextPage = () => {
    const { connected, wallet } = useWallet();
    const [lockedTADA, setLockedTADA] = useState<string>('');
    const [unlockTx, setUnlockTx] = useState<string>('');
    const [address, setAddress] = useState("");
    const [listTx, setListTx] = useState<Array<Object>>();
    const [secretUnlock, setSecretUnlock] = useState<number>(0);
    const [secretLock, setSecretLock] = useState<number>(0);
    const [slotNumber, setSlotNumber] = useState<number | String>('');

    async function lockToken() {
        if (!address || !lockedTADA) {
            alert("Please enter amount to lock TADA ...");
            return;
        }
        if (+lockedTADA < 1) {
            alert("Lock TADA must be greater than or equal 1 TADA");
            return;
        }
        const utxos = await wallet.getUtxos();
        const costLovelace = `${+lockedTADA * TADA_LOVELACE}`
        const assetMap = new Map<Unit, Quantity>()
        assetMap.set(
            'lovelace',
            costLovelace
        );
        const selectedUtxos = keepRelevant(assetMap, utxos)
        const tx = new Transaction({ initiator: wallet })
        tx.setChangeAddress(address)
        tx.setTxInputs(selectedUtxos)
        tx.sendLovelace({
            address: SC_ADDRESS,
            datum: {
                value: resolveDataHash(secretLock)
            },
            script: script
        }, costLovelace)
        const unsignedTx = await tx.build();
        // const unsignedTx ="84a3008182582087d104fe2964f84184037b09947d3c5358a88ac4ccef9b4c9753c0a6e6f3a8a0000182a300581d700b4a6193cfa9712b1dfbc117277f06692645cf643d6e9ad87add94bd011a0016e3600282005820748f2aaa7f4f9915c4f0489b3e8813f8de03239c067357eb3b7ce56033191d6ba2005839008caa580675ca4a9f45e36d3ae22ba2c110a8fd06dd61085e9e67e83e9457983da9c748d62ec255ba44f7d27df3134c9b4963a02106403ac4011b0000000253f26e1b021a00029285a0f5f6"
        const signedTx = await wallet.signTx(unsignedTx);
        const txHash = await wallet.submitTx(signedTx);
        if (txHash) {
            setLockedTADA('')
            console.log(`TADA locked successfully!\nTX# ${txHash}`)
            alert(`TADA locked successfully!\n#${txHash}`)
        }
    }

    async function unlockToken() {

        const koios = new KoiosProvider('preprod');

        const utxos = await koios.fetchAddressUTxOs(SC_ADDRESS)
        const selectedUtxos = utxos.find(u => {
            return u.input?.txHash === unlockTx
        })
        console.log('selectedUtxos', selectedUtxos)
        if (!selectedUtxos) {
            alert("No matched transactions in smart contract !")
            return
        }
        const redeem: Data = {
            alternative: 0,
            fields: ['int', secretUnlock],
        };
        const redeemer = {
            data: redeem,
        };
        const tx = new Transaction({ initiator: wallet })
            .redeemValue({
                value: selectedUtxos,
                script,
                datum: redeem,
                redeemer: redeemer
            })
            .setChangeAddress(address)
            .setRequiredSigners([address]);
        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx, true);
        const txHash = await wallet.submitTx(signedTx);
        console.log(txHash)
        if (txHash) {
            setLockedTADA('')
            console.log(`TADA unlocked successfully!\nTX# ${txHash}`)
            alert(`TADA unlocked successfully!\n#${txHash}`)
        }
    }

    const handleLockChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLockedTADA(e.target.value)
    };

    const handleUnlockChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUnlockTx(e.target.value)
    };

    const handleOnChangeSecret = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSecretLock(Number(e.target.value))
        const slotNumber = Math.floor(new Date().getTime() / 1000) - 1679739174 + 24055973
        const result = Number(slotNumber) + Number(e.target.value)
        setSlotNumber(result)
    }

    useEffect(() => {
        const getAddress = async () => {
            if (!connected) return
            const addressWallet = await wallet?.getChangeAddress() as string;
            setAddress(addressWallet);
        }

        const getListTransaction = async () => {
            const koios = new KoiosProvider('preprod');
            const scUtxos = await koios.fetchAddressUTxOs(SC_ADDRESS)
            setListTx(scUtxos)
        }

        getAddress()
        getListTransaction()
    }, [connected])

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
                }}>

                    {connected && (
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid white', padding: '10px' }}>STT</th>
                                    <th style={{ border: '1px solid white', padding: '10px' }}>Tx</th>
                                    <th style={{ border: '1px solid white', padding: '10px' }}>Amount</th>
                                    <th style={{ border: '1px solid white', padding: '10px' }}>DataHash</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listTx?.map((item: any, index) => (
                                    <tr key={index} >
                                        <th style={{ border: '1px solid white', padding: '10px' }}>{index}</th>
                                        <td style={{ border: '1px solid white', padding: '10px' }}>{item?.input?.txHash}</td>
                                        <td style={{ border: '1px solid white', padding: '10px' }}>{item?.output?.amount[0]?.quantity + '-' + item?.output?.amount[0]?.unit}</td>
                                        <td style={{ border: '1px solid white', padding: '10px' }}>{item?.output?.dataHash}</td>
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
                                            placeholder="TX"
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
                                            placeholder="secret"
                                            onChange={handleOnChangeSecret}
                                            style={{
                                                padding: "10px",
                                                borderRadius: "10px",
                                                width: "260px",
                                            }}
                                        />
                                    </div>
                                    Slot Number: {slotNumber}
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
