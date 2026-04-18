import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () => {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  return notes.map((note) => ({
    params: { slug: note.id },
    props: { note },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const note = (props as any).note;
  const raw = (note.body ?? '') as string;
  const stripped = raw
    .split('\n')
    .filter((line) => !/^\s*(import|export)\s/.test(line))
    .join('\n')
    .trim();
  const header = [
    `# ${note.data.title}`,
    '',
    `*${new Date(note.data.date).toISOString().slice(0, 10)}* — ${note.data.summary}`,
    '',
    '---',
    '',
  ].join('\n');
  return new Response(header + stripped + '\n', {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
