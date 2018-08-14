export type GlobalStorage = GlobalStorageItem[];

interface GlobalStorageItem {
  className: string;
  decorators: DecoratorDescriptor[];
  members: any[];
}

interface DecoratorDescriptor {
  name: string;
  content: DecoratorDescriptorContent[];
}

type DecoratorDescriptorContent =
  | DecoratorDescriptorLiteralContent
  | DecoratorDescriptorEnumContent
  | DecoratorDescriptorChainContent
  | DecoratorDescriptorObjectContent
  | DecoratorDescriptorNullContent
  | DecoratorDescriptorErrorContent
  | DecoratorDescriptorIdentifierContent;

type DecoratorDescriptorLiteralContent = {
  type: "literal";
  value: string;
};

type DecoratorDescriptorIdentifierContent = {
  type: "identifier";
  value: string;
}

type DecoratorDescriptorEnumContent = {
  type: "property";
  value: number | string;
};

type DecoratorDescriptorObjectContent = {
  type: "object";
  value: any;
}

type DecoratorDescriptorChainContent = {
  type: "array";
  value: string[];
};

type DecoratorDescriptorNullContent = {
  type: "null";
}

type DecoratorDescriptorErrorContent = {
  type: "error";
  value: string;
}
