import { loader, Stats } from "webpack";
import parse from "./parser";
import * as fs from "fs";
import * as path from "path";
import { GlobalStorage, GlobalStorageItem } from "../types/decorator";
import getMetaFromFtp from "./download";

const getMetaPms = getMeta();

async function getMeta() {
  await getMetaFromFtp();

  const metaJSON = fs
    .readFileSync(path.posix.join(__dirname, "../meta/output.json"))
    .toString();

  const meta: GlobalStorage = JSON.parse(metaJSON);
  return Promise.resolve(meta);
}

export default function loader(
  this: loader.LoaderContext,
  source: string
): void {
  const callback = this.async();

  getMetaPms.then(meta => {
    const result = parse(source, meta);

    if (
      (this._compiler as any).maraContext &&
      typeof (this._compiler as any).maraContext === "object"
    ) {
    } else {
      (this._compiler as any).maraContext = {};
    }

    const maraContext = (this._compiler as any).maraContext;

    if (!("dataSource" in maraContext)) {
      maraContext.dataSource = {};
    }

    const dataSource = maraContext.dataSource;

    if (!(Object.keys(result.manifest).length === 0)) {
      Object.assign(dataSource, result.manifest);
    }

    callback && callback(null, result.source);
  });
}
