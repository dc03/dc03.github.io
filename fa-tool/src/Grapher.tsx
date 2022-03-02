import { AST, NodeType } from "./RegexAST";
import { Node, Edge, Graph } from "./Graph";

export class GraphError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

const epsilon = "∊";

class Automata {
    edges: Edge[] = [];
}

export class Grapher {
    ast: AST;
    count: number;

    public constructor(ast: AST) {
        this.ast = ast;
        this.count = 0;
    }

    private nextCount(): number {
        return ++this.count;
    }

    private nextCountString(): string {
        return (++this.count).toString();
    }

    private currentCount(): number {
        return this.count;
    }

    private currentCountString(): string {
        return this.count.toString();
    }

    private peekCount(): number {
        return this.count + 1;
    }

    private peekCountString(): string {
        return (this.count + 1).toString();
    }

    private makeBasicAutomata(value: string, count: number): Edge[] {
        return [new Edge(new Node(count.toString()), value, new Node((count + 1).toString()))];
    }

    private makeGroupAutomata(children: AST[]): Edge[] {
        let edges: Edge[] = [];
        return edges;
    }

    private makeSelectAutomata(children: AST[]): Edge[] {
        let edges: Edge[] = [];

        let base = this.nextCount();
        let childValues: string[] = [];
        for (const child of children) {
            edges.concat(this.makeBasicAutomata(child.value, this.count));
        }

        return edges;
    }

    private makeEdgesFrom(child: AST): Edge[] {
        if (child.type == NodeType.Basic) {
            return this.makeBasicAutomata(child.value, this.nextCount());
        } else if (child.type == NodeType.Group) {
            return this.makeGroupAutomata(child.children);
        } else if (child.type == NodeType.Select) {
            return this.makeSelectAutomata(child.children);
        }

        throw "";
    }

    public toGraph(): Graph {
        if (this.ast.type != NodeType.Root) {
            throw new GraphError("<root> type not NodeType.Root");
        } else {
            let edges: Edge[] = [new Edge(new Node("start"), epsilon, new Node(this.peekCountString()))];
            for (const child of this.ast.children) {
                edges = edges.concat(this.makeEdgesFrom(child));
            }
            edges.push(new Edge(new Node(this.peekCountString()), epsilon, new Node("end")));

            return new Graph(edges);
        }
    }
}
