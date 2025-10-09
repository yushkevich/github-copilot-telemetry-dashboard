import archiver from 'archiver';
import { createReadStream, existsSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const root = path.resolve(process.cwd(), '..');
  const dir = path.join(root, 'telemetry_anonymized');
  const fallback = path.join(root, 'telemetry');
  try {
    const src = existsSync(dir) && (await fs.readdir(dir)).length > 0 ? dir : fallback;
    const files = (await fs.readdir(src)).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      return new Response('No telemetry files to zip', { status: 404 });
    }
    const { Readable } = await import('stream');
    const stream = new Readable({ read() {} });
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('data', (d) => stream.push(d));
    archive.on('end', () => stream.push(null));
    for (const f of files) {
      archive.append(createReadStream(path.join(src, f)), { name: f });
    }
    archive.finalize();

    const webStream = stream as unknown as ReadableStream<Uint8Array>;
    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="telemetry_anonymized.zip"',
      },
    });
  } catch (e) {
    return new Response('Failed to prepare zip: ' + (e as Error).message, { status: 500 });
  }
}
