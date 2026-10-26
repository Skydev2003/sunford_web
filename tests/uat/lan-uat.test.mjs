import { test } from "node:test";
import assert from "node:assert/strict";
import { isPrivateIPv4, lanUatAddresses, nipHost, uatPort } from "../../scripts/lib/lan-uat.mjs";

test("LAN discovery excludes public, loopback, link-local and IPv6 addresses", () => {
  const entry = (address, internal = false, family = "IPv4") => ({ address, internal, family });
  const interfaces = {
    en0: [
      entry("192.168.0.24"),
      entry("169.254.1.1"),
      entry("8.8.8.8"),
      entry("::1", false, "IPv6"),
    ],
    lo0: [entry("127.0.0.1", true)],
    vpn: [entry("10.0.0.2"), entry("192.168.0.24")],
  };
  assert.deepEqual(lanUatAddresses(interfaces), ["10.0.0.2", "192.168.0.24"]);
  assert.deepEqual(lanUatAddresses({}), []);
  assert.equal(isPrivateIPv4("172.16.0.1"), true);
  assert.equal(isPrivateIPv4("172.31.255.254"), true);
  assert.equal(isPrivateIPv4("172.32.0.1"), false);
});
test("nip.io origins are exact private-IP hostnames, never wildcard origins", () => {
  assert.equal(nipHost("192.168.0.24"), "uat.192.168.0.24.nip.io");
  assert.throws(() => nipHost("64.176.22.9"));
  assert.throws(() => nipHost("*.nip.io"));
});
test("UAT ports cannot introduce command arguments or privileged bindings", () => {
  assert.equal(uatPort(), 3100);
  assert.equal(uatPort("3200"), 3200);
  for (const invalid of ["3100 --hostname attacker", "80", "0", "65536", "not-a-port"])
    assert.throws(() => uatPort(invalid));
});
