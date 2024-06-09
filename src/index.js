const core = require("@actions/core");
const { readFile, writeFile, readdir, unlink } = require("fs").promises;
const { draw } = require("./draw");
const { getStats } = require("./steam");
const { xmlElement: $ } = require("./drawUtil");

async function main() {
  const apiKey = core.getInput("apiKey", { required: true });
  const steamId = core.getInput("steamId", { required: true });
  const rawBasePath = core.getInput("rawBasePath", { required: true });

  const stats = await getStats(apiKey, rawBasePath);

  if (stats.length === 0) {
    console.error("No steam stats, exit");
    return;
  }

  console.log("Draw new img file");
  const { content, fullHeight } = await draw(stats);

  console.log("Write new img file");
  let fileName = `steam-${Date.now()}.svg`;
  await writeFile(fileName, content);

  console.log("Write readme");
  let readme = (await readFile("README.md")).toString("utf8");
  let imgTag = $(
    "a",
    { href: `http://steamcommunity.com/profiles/${steamId}` },
    $("img", {
      src: `${rawBasePath.replace(/\/$/, "")}/${fileName}`,
      height: fullHeight,
    }),
  );

  readme = readme.replace(
    /<!-- *steam-svg-start *-->[^]*<!-- *steam-svg-end *-->/gi,
    "<!-- steam-svg-start -->\n" +
      `<p align="center">${imgTag}</p>\n` +
      "<!-- steam-svg-end -->",
  );
  await writeFile("README.md", readme);

  console.log("Remove old img file");
  const fileToDel = (await readdir(".")).filter((f) =>
    /^steam-\d+\.svg$/.test(f),
  );

  await Promise.all(fileToDel.map(async (f) => await unlink(f)));

  console.log("Complete");
}

main().catch((err) => core.setFailed(err.message));
