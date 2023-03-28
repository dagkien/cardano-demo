import { PlutusScript, resolvePlutusScriptAddress } from "@meshsdk/core";

export const script: PlutusScript = {
  code: "5861585f0100003232322225335333573466e1cc01000cc01000848800848800440184c98c8018cd5ce24903505435000062323333573466e1cd55cea800a400046eb4d5d09aab9e500223263200533573892103505431000050031375400293090009",
  version: "V2",
};

export const scriptAddr = resolvePlutusScriptAddress(script, 0);
