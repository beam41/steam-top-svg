const core = require("@actions/core");
const { readFile, writeFile, readdir, unlink } = require("fs").promises;
const { draw } = require("./draw");
const { getStats } = require("./steam");

async function main() {
  const apiKey = core.getInput("apiKey", { required: true });
  const steamId = core.getInput("steamId", { required: true });
  const rawBasePath = core.getInput("rawBasePath", { required: true });


  const { content, fullHeight } = await draw(await getStats(apiKey, steamId));

  console.log("Remove old img file");
  const fileToDel = (await readdir(".")).filter((f) =>
    /^steam-\d+\.svg$/.test(f)
  );

  for await (const f of fileToDel) {
    unlink(f);
  }

  console.log("Write new img file");
  let fileName = `steam-${Date.now()}.svg`;
  await writeFile(fileName, content);

  console.log("Write readme");
  let readme = (await readFile("README.md")).toString("utf8");
  let imgTag = `<a href="http://steamcommunity.com/profiles/${steamId}">
  <img src="${rawBasePath.replace(
    /\/$/,
    ""
  )}/${fileName}" height="${fullHeight}"/></a>`;

  readme = readme.replace(
    /<!-- *steam-svg-start *-->[^]*<!-- *steam-svg-end *-->/gi,
    "<!-- steam-svg-start -->\n" +
      `<p align="center">${imgTag}</p>\n` +
      "<!-- steam-svg-end -->"
  );
  await writeFile("README.md", readme);
  console.log("Complete");
}

main().catch((err) => core.setFailed(err.message));
