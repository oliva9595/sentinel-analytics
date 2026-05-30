const { execFile } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const TRUST_LAYER_PID = '0x52f786c921a4176297ec33ce30e1e62b436e5b32fa9d04a5a5f82ad221a4242a';
const TRUST_MISSIONS_PID = '0xc9f57b8479cefd2acccd0513512e1c7f94bf74ae181836191d491135ab2ddd4e';
const TRUST_MARKETPLACE_PID = '0xc4df108fb3089b03810720cd074beaa23e9352ce7042f47ed13935f6f80e93e6';
const TRUST_LAYER_IDL = 'D:\\vara2\\agent_args\\agent_trust_layer.idl';
const TRUST_MISSIONS_IDL = 'D:\\vara2\\agent_args\\trust_missions.idl';
const TRUST_MARKETPLACE_IDL = 'D:\\vara2\\agent_args\\trust_marketplace.idl';
const TRUST_LAYER_OWNER = '0xa223c6a7e56cd7cfc6d62ea60d3d17dfee700e62658018ddcadc7ebd5976b62d';
const ZENITH_OPERATOR = '0xde61698e954f124dd89ad6732fa68f922e5efc892086a5ebdcc3621b18eb2556';
const WALLET_DIR = 'C:\\Users\\XuanCanh\\.vara-wallet';

const CONFIG = {
  account: 'sentinel-analytics-wallet',
  stateFile: path.join(__dirname, '.cross-app-activity-state.json'),
  argsFile: path.join(__dirname, '.cross-app-call.json'),
  role: 'sentinel-analytics',
  handle: 'sentinel-analytics-app',
  metadataUri: 'https://raw.githubusercontent.com/oliva9595/sentinel-analytics/main/skills.md',
  tags: ['analytics', 'risk', 'economy'],
};

async function readState() {
  try {
    return JSON.parse(await fs.readFile(CONFIG.stateFile, 'utf8'));
  } catch {
    return { sequence: 0 };
  }
}

async function writeState(state) {
  await fs.writeFile(CONFIG.stateFile, JSON.stringify(state, null, 2));
}

async function callProgram({ pid, method, args, idl, value }) {
  await fs.writeFile(CONFIG.argsFile, JSON.stringify(args, null, 2));
  const commandArgs = ['--network', 'mainnet', '--account', CONFIG.account, 'call', pid, method, '--args-file', CONFIG.argsFile, '--idl', idl, '--gas-limit', '5000000000'];
  if (value) commandArgs.push('--value', value);
  const { stdout, stderr } = await execFileAsync('cmd.exe', ['/c', 'vara-wallet.cmd', ...commandArgs], {
    env: { ...process.env, VARA_WALLET_DIR: WALLET_DIR },
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });
  if (stderr) console.error(stderr.trim());
  return stdout.trim();
}

async function ensureMarketplaceProvider(state) {
  if (state.marketplaceRegistered) return;
  const result = await callProgram({
    pid: TRUST_MARKETPLACE_PID,
    method: 'TrustMarketplace/RegisterProvider',
    idl: TRUST_MARKETPLACE_IDL,
    args: [CONFIG.handle, CONFIG.metadataUri, CONFIG.tags, '50000000000', TRUST_LAYER_PID],
  });
  state.marketplaceRegistered = true;
  state.lastMarketplaceRegisterResult = result;
  await writeState(state);
  console.log('Sentinel registered on Trust Marketplace:', result);
}

async function runCrossAppActivity() {
  if (process.env.ENABLE_CROSS_APP_ACTIVITY === '0') return;
  const state = await readState();
  await ensureMarketplaceProvider(state);
  const current = Date.now();
  const intervalMs = Number(process.env.CROSS_APP_INTERVAL_MS || 6 * 60 * 60 * 1000);
  if (state.lastCrossAppAt && current - state.lastCrossAppAt < intervalMs) return;

  const sequence = Number(state.sequence || 0) + 1;
  const deadlineBlock = Number(process.env.CROSS_APP_DEADLINE_BLOCK || 33450000);
  const step = (sequence - 1) % 3;
  let result;
  let kind;

  if (step === 0) {
    kind = 'trust-layer-escrow';
    result = await callProgram({ pid: TRUST_LAYER_PID, method: 'AgentTrustLayer/CreateEscrow', idl: TRUST_LAYER_IDL, value: process.env.CROSS_APP_ESCROW_VALUE || '0.05', args: [TRUST_LAYER_OWNER, ZENITH_OPERATOR, `mainnet:${CONFIG.role}:trust-layer-v2:risk-review-escrow:${sequence}:${current}`, deadlineBlock] });
  } else if (step === 1) {
    kind = 'trust-mission';
    result = await callProgram({ pid: TRUST_MISSIONS_PID, method: 'TrustMissions/CreateMission', idl: TRUST_MISSIONS_IDL, args: [`Sentinel risk review mission ${sequence}`, `trust-suite://sentinel/mission/${sequence}/${current}`, '50000000000', deadlineBlock, CONFIG.tags] });
  } else {
    kind = 'trust-marketplace-hire';
    result = await callProgram({ pid: TRUST_MARKETPLACE_PID, method: 'TrustMarketplace/CreateHireIntent', idl: TRUST_MARKETPLACE_IDL, args: [TRUST_LAYER_OWNER, `trust-suite://sentinel/hire/${sequence}/${current}`, '50000000000', deadlineBlock] });
  }

  state.sequence = sequence;
  state.lastCrossAppAt = current;
  state.lastCrossAppKind = kind;
  state.lastCrossAppResult = result;
  await writeState(state);
  console.log(`Sentinel cross-app ${kind} created:`, result);
}

module.exports = { runCrossAppActivity };
