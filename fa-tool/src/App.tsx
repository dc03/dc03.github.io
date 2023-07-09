// import React, { Component } from "react";
import { Graphviz } from "graphviz-react";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./App.css";
import { EdgeNode, Edge, EdgeGraph } from "./Graph";
import { Grapher } from "./Grapher";
import { ParseError, Parser } from "./Parser";
import { AST, NodeType } from "./RegexAST";

const epsilon = "∊";

function Header() {
    return (
        <div className="header">
            <h1>Finite Automata Tool</h1>
        </div>
    );
}

function Input(props: { setInput: (v: string) => void }) {
    return (
        <input
            className="main-input"
            placeholder="Enter regex..."
            onChange={(event) => props.setInput(event.target.value)}
        />
    );
}

function Spacer(props: { height: string }) {
    return (
        <div className="spacer" style={{ height: props.height }}>
            a
        </div>
    );
}

function GoButton(props: { onClick: () => void }) {
    return (
        <button className="go-button" onClick={props.onClick}>
            Go
        </button>
    );
}

function validateRegex(input: string): boolean {
    return true;
}

function parseRegex(input: string): AST {
    return new Parser(input).parse();
}

function toGraph(ast: AST): EdgeGraph {
    return new Grapher(ast).toGraph();
}

function renderGraph(
    input: string,
    setErrorHidden: (v: boolean) => void,
    setErrorValue: (v: string) => void,
    setGraph: (v: JSX.Element) => void
) {
    setErrorHidden(true);
    if (!validateRegex(input)) {
        setErrorHidden(false);
        setErrorValue("error in regex");
    } else {
        try {
            let automata = toGraph(parseRegex(input));
            console.log(automata);
            let graphviz = <Graphviz dot={automata.toDot()}></Graphviz>;
            setGraph(graphviz);
        } catch (e: any) {
            setErrorHidden(false);
            setErrorValue(e.toString());
        }
    }
}

function App() {
    const [input, setInput] = React.useState("");
    const [errorHidden, setErrorHidden] = React.useState(true);
    const [errorValue, setErrorValue] = React.useState("");
    const [graph, setGraph] = React.useState(<Graphviz dot="digraph{}" />);

    return (
        <div className="container">
            <Header />
            <Spacer height="2rem" />
            <div className="input-container">
                <Input setInput={(x: string) => setInput(x)} />
                <GoButton onClick={() => renderGraph(input, setErrorHidden, setErrorValue, setGraph)} />
            </div>
            <Spacer height="2rem" />
            <div id="errorDiv" className="error-div" hidden={errorHidden}>
                {errorValue}
            </div>
            <div id="graph-container">{graph}</div>
        </div>
    );
}
export default App;
