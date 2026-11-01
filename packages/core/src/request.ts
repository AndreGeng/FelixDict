import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);

// curl honors HTTPS_PROXY/ALL_PROXY and avoids differences in Node's proxy support.
// Arguments and form bodies are passed separately; query text is never executed.
export async function request(url: string, { body, signal, headers = {} }: { body?: string; signal?: AbortSignal; headers?: Record<string, string> } = {}) {
  const args = ['--disable', '--silent', '--show-error', '--fail', '--compressed',
    '--connect-timeout', '3', '--max-time', '7', '--max-filesize', '3145728',
    '--proto', '=https', '--proto-redir', '=https',
    '--user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36'];
  for (const [name, value] of Object.entries(headers)) args.push('--header', `${name}: ${value}`);
  // Do not forward POST form tokens across redirects.
  if (body) args.push('--header', 'Content-Type: application/x-www-form-urlencoded', '--data', body);
  else args.push('--location', '--max-redirs', '3');
  args.push('--write-out', '\n%{url_effective}', '--url', url);
  const { stdout } = await run('/usr/bin/curl', args, { signal, maxBuffer: 3 * 1024 * 1024, timeout: 8000 });
  const index = stdout.lastIndexOf('\n');
  return { body: stdout.slice(0, index), url: stdout.slice(index + 1) };
}

