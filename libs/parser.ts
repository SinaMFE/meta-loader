import * as parser from "html-parse-stringify2";
import * as fs from "fs";
import * as path from "path";
import * as lodash from "lodash";
import { GlobalStorage, GlobalStorageItem } from "../types/decorator";
import { sourceDataType } from "./config";

let uniqueKey = 0;

interface HtmlNode {
  attrs?: HtmlAttrs;
  name: string;
  type: string;
  children?: HtmlNode[];
}

interface HtmlAttrs {
  [key: string]: string;
}

function main() {
  const file = fs
    .readFileSync(path.join(__dirname, "../src/Test.vue"))
    .toString();
  const manifest = {};

  const ast = parser.parse(file);

  const curriedHandleNode = lodash.curry(handleNode)(manifest);

  // traverse to get informations and modified attr's value(inject keys)
  traverseHtmlAst(ast, curriedHandleNode);

  // this ast has been modified
  const result = parser.stringify(ast);
}

export default function parseVueLikeContentAndInject(
  content: string,
  meta: GlobalStorage
): { manifest: any; source: string } {
  const manifest = {};

  const ast = parser.parse(content);

  const curriedHandleNode = lodash.curry(handleNode)(manifest, meta);

  // traverse to get informations and modified attr's value(inject keys)
  traverseHtmlAst(ast, curriedHandleNode);

  // this ast has been modified
  const result = parser.stringify(ast);

  return { manifest, source: result };
}

function traverse(node: HtmlNode, fun: (node: HtmlNode) => void) {
  if (node.children) {
    node.children.forEach(item => {
      fun(item);
      traverse(item, fun);
    });
  }
}

function traverseHtmlAst(ast: HtmlNode[], fun: (node: HtmlNode) => void) {
  ast.forEach(node => {
    traverse(node, fun);
  });
}

function handleNode(manifest: any, meta: GlobalStorage, node: HtmlNode) {
  if (node.attrs && node.attrs.modulename) {
    const attributes = node.attrs;

    const targetModule = lodash.find(meta, { id: node.attrs.modulename });

    if (!targetModule) {
      throw new Error(
        `[template parser] can not find module name ${
          node.attrs.modulename
        } in metadata`
      );
    }

    Object.keys(attributes).map(key => {
      const value = attributes[key];

      const classPropertyItem: any = lodash.find(
        (targetModule as GlobalStorageItem).members,
        { name: key } as any
      );

      // determine attribute is a datasource type
      if (classPropertyItem && classPropertyItem.type === sourceDataType) {

        const injectedKeyObj = getInjectedUniqueKeyObj(key, value);

        const attrValueStr = JSON.stringify(injectedKeyObj);

        saveDataSourceInfo(manifest, key, injectedKeyObj);

        // this will change the original parsed ast object
        attributes[key] = attrValueStr;
      }
    });
  }
}

function saveDataSourceInfo(manifest: any, key: string, value: any): void {
  // save to manifest.json

  if (!("dsConf" in value)) {
    throw new Error(
      `[template parser] ${key} is a dataSource type but content of ${key} doesn't contain property "dsConf"`
    );
  }

  const { url, method, cache, data, timeout } = value.dsConf;

  manifest[value.key] = {
    api: url,
    method,
    cache,
    data,
    timeout
  };
}

function getInjectedUniqueKeyObj(
  key: string,
  value: string
): { [key: string]: any } {
  if (!value) {
    throw new Error(`[template parser] content of attribute ${key} is empty`);
  }

  let attrObj;

  try {
    attrObj = JSON.parse(value);
  } catch (e) {
    throw new Error(
      `[template parser] error during deserialization of ${key}'s value`
    );
  }

  if (typeof attrObj !== "object") {
    throw new Error(`[template parser] parsed ${key}'s value is not an object`);
  }

  // TODO: add self increase unique key to object and convert to json

  addUniqueKeyToObj(attrObj);

  return attrObj;
}

function addUniqueKeyToObj(obj: { [key: string]: any }): void {
  obj.key = `request_${uniqueKey}`;
  uniqueKey++;
}
