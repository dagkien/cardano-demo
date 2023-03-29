import { PlutusScript, resolvePlutusScriptAddress } from "@meshsdk/core";

export const script: PlutusScript = {
  code: "5907b35907b0010000323232323233223232323232323232323322323232323222232325335323232333573466e1ccdc3001a4101095ebe66e18009208084af5f01a0193333573466e1cd55cea80224000466442466002006004646464646464646464646464646666ae68cdc39aab9d500c480008cccccccccccc88888888888848cccccccccccc00403403002c02802402001c01801401000c008cd405c060d5d0a80619a80b80c1aba1500b33501701935742a014666aa036eb94068d5d0a804999aa80dbae501a35742a01066a02e0446ae85401cccd5406c08dd69aba150063232323333573466e1cd55cea801240004664424660020060046464646666ae68cdc39aab9d5002480008cc8848cc00400c008cd40b5d69aba15002302e357426ae8940088c98c80cccd5ce01a01981889aab9e5001137540026ae854008c8c8c8cccd5cd19b8735573aa004900011991091980080180119a816bad35742a004605c6ae84d5d1280111931901999ab9c034033031135573ca00226ea8004d5d09aba2500223263202f33573806005e05a26aae7940044dd50009aba1500533501775c6ae854010ccd5406c07c8004d5d0a801999aa80dbae200135742a00460426ae84d5d1280111931901599ab9c02c02b029135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d55cf280089baa00135742a00860226ae84d5d1280211931900e99ab9c01e01d01b30190053018005101a13263201a3357389201035054350001a135573ca00226ea800448c88c008dd6000990009aa80b911999aab9f0012500a233500930043574200460066ae8800805c8c8c8cccd5cd19b8735573aa004900011991091980080180118061aba150023005357426ae8940088c98c805ccd5ce00c00b80a89aab9e5001137540024646464646666ae68cdc39aab9d5004480008cccc888848cccc00401401000c008c8c8c8cccd5cd19b8735573aa0049000119910919800801801180a9aba1500233500f014357426ae8940088c98c8070cd5ce00e80e00d09aab9e5001137540026ae854010ccd54021d728039aba150033232323333573466e1d4005200423212223002004357426aae79400c8cccd5cd19b875002480088c84888c004010dd71aba135573ca00846666ae68cdc3a801a400042444006464c6403c66ae7007c07807006c0684d55cea80089baa00135742a00466a016eb8d5d09aba2500223263201833573803203002c26ae8940044d5d1280089aab9e500113754002266aa002eb9d6889119118011bab00132001355014223233335573e0044a010466a00e66442466002006004600c6aae754008c014d55cf280118021aba200301513574200222440042442446600200800624464646666ae68cdc3a800a40004642446004006600a6ae84d55cf280191999ab9a3370ea0049001109100091931900999ab9c014013011010135573aa00226ea80048c8c8cccd5cd19b875001480188c848888c010014c01cd5d09aab9e500323333573466e1d400920042321222230020053009357426aae7940108cccd5cd19b875003480088c848888c004014c01cd5d09aab9e500523333573466e1d40112000232122223003005375c6ae84d55cf280311931900999ab9c01401301101000f00e135573aa00226ea80048c8c8cccd5cd19b8735573aa004900011991091980080180118029aba15002375a6ae84d5d1280111931900799ab9c01000f00d135573ca00226ea80048c8cccd5cd19b8735573aa002900011bae357426aae7940088c98c8034cd5ce00700680589baa001232323232323333573466e1d4005200c21222222200323333573466e1d4009200a21222222200423333573466e1d400d2008233221222222233001009008375c6ae854014dd69aba135744a00a46666ae68cdc3a8022400c4664424444444660040120106eb8d5d0a8039bae357426ae89401c8cccd5cd19b875005480108cc8848888888cc018024020c030d5d0a8049bae357426ae8940248cccd5cd19b875006480088c848888888c01c020c034d5d09aab9e500b23333573466e1d401d2000232122222223005008300e357426aae7940308c98c8058cd5ce00b80b00a00980900880800780709aab9d5004135573ca00626aae7940084d55cf280089baa0012323232323333573466e1d400520022333222122333001005004003375a6ae854010dd69aba15003375a6ae84d5d1280191999ab9a3370ea0049000119091180100198041aba135573ca00c464c6401e66ae7004003c0340304d55cea80189aba25001135573ca00226ea80048c8c8cccd5cd19b875001480088c8488c00400cdd71aba135573ca00646666ae68cdc3a8012400046424460040066eb8d5d09aab9e500423263200c33573801a01801401226aae7540044dd500089119191999ab9a3370ea00290021091100091999ab9a3370ea00490011190911180180218031aba135573ca00846666ae68cdc3a801a400042444004464c6401a66ae7003803402c0280244d55cea80089baa0012323333573466e1d40052002200523333573466e1d40092000200523263200933573801401200e00c26aae74dd50008910010910009191999ab9a3370e6aae75400520002375a6ae84d55cf280111931900299ab9c006005003137540029309000a490350543100112323001001223300330020020011",
  version: "V2",
};

export const scriptAddr = resolvePlutusScriptAddress(script, 0);
