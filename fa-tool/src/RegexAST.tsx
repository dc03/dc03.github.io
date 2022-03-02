export enum NodeType {
    Basic,
    Group,
    None,
    Or,
    Question,
    RepeatMaybe,
    Repeat,
    Root,
    Select,
}

export class AST {
    value: string = "";
    type: NodeType = NodeType.None;
    children: AST[] = [];

    constructor(value: string, type: NodeType, children: AST[]) {
        this.value = value;
        this.type = type;
        this.children = children;
    }

    setValue(v: string): void {
        this.value = v;
    }

    addChild(c: AST): void {
        this.children.push(c);
    }
}
