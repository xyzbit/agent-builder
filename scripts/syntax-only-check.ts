// @ts-nocheck
import ts from 'typescript';

const configPath = ts.findConfigFile('.', ts.sys.fileExists, 'tsconfig.json');
if (!configPath) throw new Error('No tsconfig.json found');

const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
const { fileNames, options } = ts.parseJsonConfigFileContent(config, ts.sys, '.');

const program = ts.createProgram(fileNames, { ...options, noEmit: true });
const all = ts.getPreEmitDiagnostics(program);

const getMessageText = (diagnostic: ts.Diagnostic) => {
  if (diagnostic.messageText) {
    if (typeof diagnostic.messageText === 'string') {
      return diagnostic.messageText;
    } else {
      return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    }
  }
}

// Only keep diagnostics whose code (as a string) starts with "1"
const syntaxErrors = all.filter(d => d.code.toString().startsWith('1'));
const errors2339_lucide = all.filter(d => d.code === 2339 && getMessageText(d).toLowerCase().includes('lucide'));
const errors2322 = all.filter(d => d.code === 2322 && getMessageText(d).includes('is not assignable to type \'ReactNode\''));

const finalErrors = [...syntaxErrors, ...errors2322];

if (finalErrors.length) {
  const host = {
    getCanonicalFileName: f => f,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  };
  console.error(ts.formatDiagnosticsWithColorAndContext(finalErrors, host));
  process.exit(1);
}

if (errors2339_lucide.length) {
  const host = {
    getCanonicalFileName: f => f,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  };
  console.warn(ts.formatDiagnosticsWithColorAndContext(errors2339_lucide, host, "The icon import from Lucide is not valid, please use the safeLucideIcon function to import icons."));
  process.exit(1);
}
