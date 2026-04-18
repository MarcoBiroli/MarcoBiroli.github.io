import type { APIRoute } from 'astro';

const allowedAiBots = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'cohere-ai',
  'Diffbot',
  'FacebookBot',
  'Meta-ExternalAgent',
  'Applebot-Extended',
  'DuckAssistBot',
  'YouBot',
  'Amazonbot',
  'Bytespider',
];

export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? '';
  const lines: string[] = [
    'User-agent: *',
    'Allow: /',
    '',
  ];
  for (const bot of allowedAiBots) {
    lines.push(`User-agent: ${bot}`, 'Allow: /', '');
  }
  lines.push(`Sitemap: ${base}/sitemap-index.xml`);
  lines.push(`# Machine-readable summary: ${base}/llms.txt`);
  lines.push(`# Full content dump:       ${base}/llms-full.txt`);
  lines.push('');
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
