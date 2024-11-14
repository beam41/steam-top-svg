import core from '@actions/core';
import { readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { draw } from './draw';
import { getStats } from './steam';
import { xmlElement as $ } from './util';

async function main() {
  const apiKey = core.getInput('apiKey', { required: true });
  const steamId = core.getInput('steamId', { required: true });
  const rawBasePath = core.getInput('rawBasePath', { required: true });

  console.time('Get stats');
  const stats = await getStats(apiKey, steamId);
  console.timeEnd('Get stats');

  if (stats.length === 0) {
    console.error('No steam stats, exit');
    return;
  }

  console.time('Draw new img file');
  const { content, fullHeight } = await draw(stats, 105, 32, 225, 8, 4);
  console.timeEnd('Draw new img file');

  console.time('Remove old img file');
  const fileToDel = (await readdir('.')).filter((f) =>
    /^steam-\d+\.svg$/.test(f),
  );
  console.timeEnd('Remove old img file');

  await Promise.all(fileToDel.map(async (f) => await unlink(f)));

  console.time('Write new img file');
  let fileName = `steam-${Date.now()}.svg`;
  await writeFile(fileName, content);
  console.timeEnd('Write new img file');

  console.time('Write readme');
  let readme = (await readFile('README.md')).toString('utf8');
  let imgTag = $(
    'a',
    { href: `http://steamcommunity.com/profiles/${steamId}` },
    $('img', {
      src: `${rawBasePath.replace(/\/$/, '')}/${fileName}`,
      height: fullHeight,
    }),
  );

  readme = readme.replace(
    /<!-- *steam-svg-start *-->[^]*<!-- *steam-svg-end *-->/gi,
    '<!-- steam-svg-start -->\n' +
      `<p align="center">${imgTag}</p>\n` +
      '<!-- steam-svg-end -->',
  );
  await writeFile('README.md', readme);
  console.timeEnd('Write readme');

  console.info('Complete');
}

main().catch((err) => core.setFailed(err.message));
