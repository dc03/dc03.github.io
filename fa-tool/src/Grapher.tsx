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
    start: number = 0;
    end: number = 0;

    constructor(edges: Edge[], min: number, max: number) {
        this.edges = edges;
        this.start = min;
        this.end = max;
    }

    connectWith(other: Automata): Automata {
        const connected = new Automata(this.edges.concat(other.edges), this.start, other.end);
        if (this.end != other.start) {
            connected.edges.push(new Edge(new Node(this.end.toString()), epsilon, new Node(other.start.toString())));
        }

        return connected;
    }
}

export class Grapher {
    ast: AST;
    count: number;

    public constructor(ast: AST) {
        this.ast = ast;
        this.count = 1;
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

    private makeEdgeTo(left: string, value: string, right: string): Edge {
        return new Edge(new Node(left), value, new Node(right));
    }

    private epsilonEdgeTo(left: string, right: string): Edge {
        return this.makeEdgeTo(left, epsilon, right);
    }

    private makeBasicAutomata(value: string): Automata {
        let edges: Edge[] = [];
        let min = this.peekCount();
        for (const char of value) {
            edges.push(this.makeEdgeTo(this.nextCountString(), char, this.nextCountString()));
        }
        let max = this.currentCount();
        return new Automata(edges, min, max);
    }

    private makeGroupAutomata(children: AST[]): Automata {
        const min = this.currentCount();

        let child_automatas: Automata[] = [];
        for (const child of children) {
            child_automatas.push(this.makeAutomataFrom(child));
        }

        // const max = this.currentCount();
        let group = new Automata([], min, min);
        for (const child of child_automatas) {
            group = group.connectWith(child);
        }

        return group;
    }

    private makeSelectAutomata(children: AST[]): Automata {
        let edges: Edge[] = [];

        const min = this.currentCount();
        let childValues: string[] = [];
        for (const child of children) {
            const automata = this.makeBasicAutomata(child.value);
            edges.push(...automata.edges);
            if (min != automata.start) {
                edges.push(this.epsilonEdgeTo(min.toString(), automata.start.toString()));
            }
            childValues.push(automata.end.toString());
        }

        const max = this.nextCount();
        for (const val of childValues) {
            if (val != max.toString()) {
                edges.push(this.epsilonEdgeTo(val, max.toString()));
            }
        }

        return new Automata(edges, min, max);
    }

    private makeOrAutomata(children: AST[]): Automata {
        let edges: Edge[] = [];
        const min = this.currentCount();

        let childValues: string[] = [];
        for (const child of children) {
            const automata = this.makeAutomataFrom(child);
            edges.push(...automata.edges);
            if (min != automata.start) {
                edges.push(this.epsilonEdgeTo(min.toString(), automata.start.toString()));
            }
            childValues.push(automata.end.toString());
        }

        const max = this.nextCount();
        for (const val of childValues) {
            if (val != max.toString()) {
                edges.push(this.epsilonEdgeTo(val, max.toString()));
            }
        }

        return new Automata(edges, min, max);
    }

    private makeAutomataFrom(child: AST): Automata {
        if (child.type == NodeType.Basic) {
            return this.makeBasicAutomata(child.value);
        } else if (child.type == NodeType.Group) {
            return this.makeGroupAutomata(child.children);
        } else if (child.type == NodeType.Select) {
            return this.makeSelectAutomata(child.children);
        } else if (child.type == NodeType.Or) {
            return this.makeOrAutomata(child.children);
        }

        throw "cheese";
    }

    public toGraph(): Graph {
        if (this.ast.type != NodeType.Root) {
            throw new GraphError("<root> type not NodeType.Root");
        } else {
            let children: Automata[] = [];
            const min = this.currentCount();

            for (const child of this.ast.children) {
                children.push(this.makeAutomataFrom(child));
            }

            children.sort((a, b) => a.start - b.start);

            const max = this.currentCount();
            let edges: Edge[] = [
                this.epsilonEdgeTo("start", min.toString()),
                this.epsilonEdgeTo(max.toString(), "end"),
            ];

            let root = new Automata(edges, min, min);
            for (const child of children) {
                root = root.connectWith(child);
            }

            return new Graph(root.edges);
        }
    }
}
