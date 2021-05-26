import axios from "axios";
import fs from "fs";

(async () => {
  if (process.argv.length < 3) {
    console.error("参数错误，请输入api module名字");
    return;
  }
  const module = process.argv[2];
  const { data } = await axios.get(
    `https://gdc-de.glodon.com/${module}/v2/api-docs`,
  );

  for (let path in data.paths) {
    if (path.startsWith("/actuator")) {
      delete data.paths[path];
    }
  }

  fs.writeFileSync(
    `./.scripts/swagger_${module}.json`,
    JSON.stringify(data, null, 2),
  );
})();
