export class Node {
    value: string;

    constructor(value: string) {
        this.value = value;
    }
}

export class Edge {
    left: Node;
    value: string;
    right: Node;

    constructor(left: Node, value: string, right: Node) {
        this.left = left;
        this.value = value;
        this.right = right;
    }
}

export class Graph {
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
