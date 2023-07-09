export class EdgeNode {
    value: string;

    constructor(value: string) {
        this.value = value;
    }
}

export class Edge {
    left: EdgeNode;
    value: string;
    right: EdgeNode;

    constructor(left: EdgeNode, value: string, right: EdgeNode) {
        this.left = left;
        this.value = value;
        this.right = right;
    }
}

export class EdgeGraph {
    edges: Edge[];

    constructor(edges: Edge[]) {
        this.edges = edges;
    }

    private _toDotImpl(): string {
        let final: string = "end [shape=doublecircle];\n";
        let without_repeats: Map<string, string> = new Map<string, string>();

        for (const edge of this.edges) {
            let edge_values: string = edge.left.value + " -> " + edge.right.value;

            let value = without_repeats.get(edge_values);
            if (value === undefined) {
                without_repeats.set(edge_values, edge.value);
            } else {
                without_repeats.set(edge_values, (value as string) + ", " + edge.value);
            }
        }

        console.log(without_repeats);

        for (const [key, value] of without_repeats) {
            final = final + `${key} [label="${value}"];\n`;
        }
        return final;
    }

    toDot(): string {
        return "digraph {\n" + this._toDotImpl() + "}";
    }
}

type NodeLink = { parent: Node; value: string; child: Node };

export class Node {
    name: string = "";
    children: NodeLink[] = [];

    constructor();
    constructor(name: string);
    constructor(name?: string, children?: NodeLink[]) {
        this.name = name ?? "";
        this.children = children ?? [];
    }

    addChild(value: string, child: Node) {
        this.children.push({ parent: this, value: value, child: child });
    }
}

export class Graph {
    start: Node = new Node();
    counter: number = 0;
    node_map: Map<string, Node> = new Map();
    end: Node = new Node();

    constructor(start: string, end: string) {
        this.start = new Node(start);
        this.node_map.set(start, this.start);
        this.end = new Node(end);
        this.node_map.set(end, this.end);
    }

    public nextCounter() {
        return (++this.counter).toString();
    }

    public addNodeToRoot(edge: string): Node {
        const newNode = new Node(this.nextCounter());
        this.node_map.set(newNode.name, newNode);
        this.start.addChild(edge, newNode);

        return newNode;
    }

    public addNodeToNode(parent: string, edge: string): Node {
        let node = this.node_map.get(parent);
        if (node == undefined) {
            throw "Node does not exist";
        } else {
            const newNode = new Node(this.nextCounter());
            this.node_map.set(newNode.name, newNode);
            node.addChild(edge, newNode);

            return newNode;
        }
    }

    public linkNodetoEnd(node: string): void {
        let node_to_link = this.node_map.get(node);
        if (node_to_link === undefined) {
            throw "Node does not exist";
        } else {
            node_to_link.addChild("", this.end);
        }
    }

    public toEdgeGraph(): EdgeGraph {
        let edgeGraph = new EdgeGraph([]);

        let visited: Map<string, boolean> = new Map();
        for (const [key, _] of this.node_map) {
            visited.set(key, false);
        }

        let queue: Node[] = [this.start];
        while (queue.length > 0) {
            let node = queue.shift();
            if (node === undefined) {
                throw Error("Queue is empty");
            }
            if (visited.get(node.name) === false) {
                visited.set(node.name, true);
                for (const child of node.children) {
                    let edge = new Edge(new EdgeNode(node.name), child.value, new EdgeNode(child.child.name));
                    edgeGraph.edges.push(edge);
                    queue.push(child.child);
                }
            }
        }

        return edgeGraph;
    }
}
