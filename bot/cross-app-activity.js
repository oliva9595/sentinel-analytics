const { execFile } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const TRUST_LAYER_PID = '0x52f786c921a4176297ec33ce30e1e62b436e5b32fa9d04a5a5f82ad221a4242a';
const TRUST_LAYER_IDL = 'D:\\vara2\\agent_args\\agent_trust_layer.idl';
const TRUST_LAYER_OWNER = '0xa223c6a7e56cd7cfc6d62ea60d3d17dfee700e62658018ddcadc7ebd5976b62d';
const ZENITH_OPERATOR = '0xde61698e954f124dd89ad6732fa68f922e5efc892086a5ebdcc3621b18eb2556';
const WALLET_DIR = 'C:\\Users\\XuanCanh\\.vara-wallet';

const CONFIG = {
  account: 'sentinel-analytics-wallet',
  stateFile: path.join(__dirname, '.cross-app-activity-state.json'),
  argsFile: path.join(__dirname, '.cross-app-create-escrow.json'),
  role: 'sentinel-analytics',
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

async function callTrustLayer(args) {
  await fs.writeFile(CONFIG.argsFile, JSON.stringify(args, null, 2));

  const commandArgs = [
    '--network', 'mainnet',
    '--account', CONFIG.account,
    'call', TRUST_LAYER_PID,
    'AgentTrustLayer/CreateEscrow',
    '--args-file', CONFIG.argsFile,
    '--value', process.env.CROSS_APP_ESCROW_VALUE || '0.05',
    '--idl', TRUST_LAYER_IDL,
    '--gas-limit', '5000000000',
  ];

  const { stdout, stderr } = await execFileAsync('cmd.exe', ['/c', 'vara-wallet.cmd', ...commandArgs], {
    env: { ...process.env, VARA_WALLET_DIR: WALLET_DIR },
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });

  if (stderr) {
    console.error(stderr.trim());
  }
  return stdout.trim();
}

async function runCrossAppActivity() {
  if (process.env.ENABLE_CROSS_APP_ACTIVITY === '0') {
    return;
  }

  const state = await readState();
  const current = Date.now();
  const intervalMs = Number(process.env.CROSS_APP_INTERVAL_MS || 6 * 60 * 60 * 1000);

  if (state.lastCrossAppAt && current - state.lastCrossAppAt < intervalMs) {
    return;
  }

  const sequence = Number(state.sequence || 0) + 1;
  const deadlineBlock = Number(process.env.CROSS_APP_DEADLINE_BLOCK || 33450000);
  const termsHash = `mainnet:${CONFIG.role}:trust-layer-v2:risk-review-escrow:${sequence}:${current}`;
  const args = [
    TRUST_LAYER_OWNER,
    ZENITH_OPERATOR,
    termsHash,
    deadlineBlock,
  ];

  const result = await callTrustLayer(args);
  state.sequence = sequence;
  state.lastCrossAppAt = current;
  state.lastCrossAppResult = result;
  await writeState(state);
  console.log('Sentinel cross-app TrustLayer escrow created:', result);
}

module.exports = { runCrossAppActivity };
