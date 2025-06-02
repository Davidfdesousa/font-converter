import * as fs from 'fs';
import * as path from 'path';

// 1) Importa Font do fonteditor-core
import { Font } from 'fonteditor-core';

// 2) Importa o compressor do wawoff2
import wawoff2 from 'wawoff2';

/**
 * Converte um arquivo .woff para .woff2 em dois passos:
 *   1. De WOFF → TTF (usando fonteditor-core)
 *   2. De TTF → WOFF2 (usando wawoff2)
 */
async function convertWoffToWoff2(inputPath: string, outputPath: string) {
  // Passo 1: lê o .woff como Buffer
  const woffBuffer = fs.readFileSync(inputPath);

  // Cria objeto Font a partir do buffer WOFF
  const font = Font.create(woffBuffer, {
    type: 'woff',
    hinting: true,
    kerning: true
  });

  // Escreve um ArrayBuffer contendo o TTF (toBuffer: true)
  //   → font.write({ type: 'ttf', toBuffer: true }) retorna ArrayBuffer
  const ttfArrBuf = (font as any).write({
    type: 'ttf',
    toBuffer: true
  });

  // Converte o ArrayBuffer do TTF em Uint8Array (ou Buffer)
  const ttfUint8 = new Uint8Array(ttfArrBuf as ArrayBuffer);

  // Passo 2: converte esse TTF para WOFF2
  //   → wawoff2.compress recebe Uint8Array ou Buffer e retorna Promise<Uint8Array>
  const woff2Uint8 = await wawoff2.compress(ttfUint8);

  // Converte o Uint8Array do WOFF2 em Buffer do Node
  const woff2Buffer = Buffer.from(woff2Uint8);

  // Grava o .woff2 no disco
  fs.writeFileSync(outputPath, woff2Buffer);

  console.log(`Arquivo convertido:
  Input:  ${inputPath}
  Output: ${outputPath}`);
}

// Execução via linha de comando:
// npm run convert -- <caminho/para/input.woff> <caminho/para/output.woff2>
(async () => {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Uso: node dist-node/converter.js <input.woff> <output.woff2>');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const outputPath = path.resolve(args[1]);

  try {
    await convertWoffToWoff2(inputPath, outputPath);
  } catch (err) {
    console.error('Erro na conversão:', err);
    process.exit(1);
  }
})();
