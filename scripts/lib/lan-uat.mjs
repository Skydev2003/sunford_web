import { isIP } from "node:net";

export function isPrivateIPv4(address) {
  if (isIP(address) !== 4) return false;
  const [first, second] = address.split(".").map(Number);
  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

export function lanUatAddresses(interfaces) {
  return [
    ...new Set(
      Object.values(interfaces)
        .flat()
        .filter(
          (entry) =>
            entry &&
            !entry.internal &&
            (entry.family === "IPv4" || entry.family === 4) &&
            isPrivateIPv4(entry.address),
        )
        .map((entry) => entry.address),
    ),
  ].sort();
}

export function nipHost(address) {
  if (!isPrivateIPv4(address)) throw new Error("LAN UAT requires a private IPv4 address.");
  return `uat.${address}.nip.io`;
}

export function uatPort(value = "3100") {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error("UAT_PORT must be between 1024 and 65535.");
  return port;
}
