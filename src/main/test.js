const runScript = require('runscript');
const isWin = process.platform === 'win32';
const REGEX = isWin ? /^(.*)\s+(\d+)\s*$/ : /^\s*(\d+)\s+(.*)/;

const command = isWin
  ? 'wmic Path win32_process Where "Name = \'node.exe\'" Get CommandLine,ProcessId'
  // command, cmd are alias of args, not POSIX standard, so we use args
  : 'ps -eo "pid,args"';

async function test(srcs = []) {
  const stdio = await runScript(command, { stdio: 'pipe' });
  const processList = stdio.stdout.toString().split('\n').reduce((arr, line) => {
    if (!!line && !line.includes('/bin/sh') && line.includes('node')) {
      const m = line.match(REGEX);
      /* istanbul ignore else */
      if (m) {
        const item = isWin ? { pid: m[2], cmd: m[1], path: '' } : { pid: m[1], cmd: m[2], path: '' };
        srcs.forEach(node => {
          if (item.cmd.indexOf(node) > -1) {
            item.path = node;
            arr.push(item);
          }
        });
      }
    }
    return arr;
  }, []);
  return processList;
}

export default test;
