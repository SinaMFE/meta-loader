import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const ftpPath = "http://wap_front.dev.sina.cn/huguang/metaData.json";

export default async function getMetaFromFtp() {
  const res = await axios({ url: ftpPath });

  const dirname = path.posix.join(__dirname, "../meta");
  const resultPath = path.posix.join(dirname, "./output.json");

  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }

  fs.readFileSync(resultPath, JSON.stringify(res.data));
  // res.data.pipe(fs.createWriteStream(resultPath));
}

getMetaFromFtp();
