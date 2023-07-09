import { AST, NodeType } from "./RegexAST";
import { EdgeNode, Edge, EdgeGraph, Graph } from "./Graph";

export class GraphError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

const epsilon = "∊";

class Automata {
    mainGraph: Graph;
    public myGraph: Graph;

    constructor(mainGraph: Graph, start: string, end: string) {
        this.mainGraph = mainGraph;
        this.myGraph = new Graph(start, end);
    }

    public connectWith(other: Graph): Graph {

    }
}

export class Grapher {
    // ast: AST;
    // count: number;

    // public constructor(ast: AST) {
    //     this.ast = ast;
    //     this.count = 1;
    // }

    // private nextCount(): number {
    //     return ++this.count;
    // }

    // private nextCountString(): string {
    //     return (++this.count).toString();
    // }

    // private currentCount(): number {
    //     return this.count;
    // }

    // private currentCountString(): string {
    //     return this.count.toString();
    // }

    // private peekCount(): number {
    //     return this.count + 1;
    // }

    // private peekCountString(): string {
    //     return (this.count + 1).toString();
    // }

    // private makeEdgeTo(left: string, value: string, right: string): Edge {
    //     return new Edge(new EdgeNode(left), value, new EdgeNode(right));
    // }

    // private epsilonEdgeTo(left: string, right: string): Edge {
    //     return this.makeEdgeTo(left, epsilon, right);
    // }

    // private makeBasicAutomata(value: string): Automata {
    //     let edges: Edge[] = [];
    //     let min = this.peekCount();
    //     for (const char of value) {
    //         edges.push(this.makeEdgeTo(this.nextCountString(), char, this.nextCountString()));
    //     }
    //     let max = this.currentCount();
    //     return new Automata(edges, min, max);
    // }

    // private makeGroupAutomata(children: AST[]): Automata {
    //     const min = this.currentCount();

    //     let child_automatas: Automata[] = [];
    //     for (const child of children) {
    //         child_automatas.push(this.makeAutomataFrom(child));
    //     }

    //     // const max = this.currentCount();
    //     let group = new Automata([], min, min);
    //     for (const child of child_automatas) {
    //         group = group.connectWith(child);
    //     }

    //     return group;
    // }

    // private makeSelectAutomata(children: AST[]): Automata {
    //     let edges: Edge[] = [];

    //     const min = this.currentCount();
    //     let childValues: string[] = [];
    //     for (const child of children) {
    //         const automata = this.makeBasicAutomata(child.value);
    //         edges.push(...automata.edges);
    //         if (min != automata.start) {
    //             edges.push(this.epsilonEdgeTo(min.toString(), automata.start.toString()));
    //         }
    //         childValues.push(automata.end.toString());
    //     }

    //     const max = this.nextCount();
    //     for (const val of childValues) {
    //         if (val != max.toString()) {
    //             edges.push(this.epsilonEdgeTo(val, max.toString()));
    //         }
    //     }

    //     return new Automata(edges, min, max);
    // }

    // private makeOrAutomata(children: AST[]): Automata {
    //     let edges: Edge[] = [];
    //     const min = this.currentCount();

    //     let childValues: string[] = [];
    //     for (const child of children) {
    //         const automata = this.makeAutomataFrom(child);
    //         edges.push(...automata.edges);
    //         if (min != automata.start) {
    //             edges.push(this.epsilonEdgeTo(min.toString(), automata.start.toString()));
    //         }
    //         childValues.push(automata.end.toString());
    //     }

    //     const max = this.nextCount();
    //     for (const val of childValues) {
    //         if (val != max.toString()) {
    //             edges.push(this.epsilonEdgeTo(val, max.toString()));
    //         }
    //     }

    //     return new Automata(edges, min, max);
    // }

    // private makeAutomataFrom(child: AST): Automata {
    //     if (child.type == NodeType.Basic) {
    //         return this.makeBasicAutomata(child.value);
    //     } else if (child.type == NodeType.Group) {
    //         return this.makeGroupAutomata(child.children);
    //     } else if (child.type == NodeType.Select) {
    //         return this.makeSelectAutomata(child.children);
    //     } else if (child.type == NodeType.Or) {
    //         return this.makeOrAutomata(child.children);
    //     }

    //     throw "cheese";
    // }

    // public toGraph(): EdgeGraph {
    //     if (this.ast.type != NodeType.Root) {
    //         throw new GraphError("<root> type not NodeType.Root");
    //     } else {
    //         let children: Automata[] = [];
    //         const min = this.currentCount();

    //         for (const child of this.ast.children) {
    //             children.push(this.makeAutomataFrom(child));
    //         }

    //         children.sort((a, b) => a.start - b.start);

    //         const max = this.currentCount();
    //         let edges: Edge[] = [
    //             this.epsilonEdgeTo("start", min.toString()),
    //             this.epsilonEdgeTo(max.toString(), "end"),
    //         ];

    //         let root = new Automata(edges, min, min);
    //         for (const child of children) {
    //             root = root.connectWith(child);
    //         }

    //         return new EdgeGraph(root.edges);
    //     }
    // }

    ast: AST;
    graph: Graph;

    constructor(ast_: AST) {
        this.ast = ast_;
        this.graph = new Graph("start", "end");
    }

    public toGraph(): EdgeGraph {
        if (this.ast.type != NodeType.Root) {
            throw new GraphError("<root> type not NodeType.Root");
        } else {
        }

        return this.graph.toEdgeGraph();
    }
}
