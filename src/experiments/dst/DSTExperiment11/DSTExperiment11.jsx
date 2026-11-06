import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment11.css";

const DEFAULT_VERTICES = ["A", "B", "C", "D"];

const DEFAULT_EDGES = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["C", "D"]
];

const createGraph = (
  vertices = DEFAULT_VERTICES,
  edges = DEFAULT_EDGES
) => {
  const graph = {};

  vertices.forEach((vertex) => {
    graph[vertex] = [];
  });

  edges.forEach(([from, to]) => {
    if (graph[from] && graph[to]) {
      if (!graph[from].includes(to)) {
        graph[from].push(to);
      }

      if (!graph[to].includes(from)) {
        graph[to].push(from);
      }
    }
  });

  return graph;
};

const getEdges = (graph) => {
  const edges = [];
  const seen = new Set();

  Object.keys(graph).forEach((from) => {
    graph[from].forEach((to) => {
      const key = [from, to].sort().join("-");

      if (!seen.has(key)) {
        seen.add(key);
        edges.push([from, to]);
      }
    });
  });

  return edges;
};

/* =========================================================
   BFS
   ========================================================= */

const buildBFSSteps = (graph, start) => {
  if (!graph[start]) {
    return [
      {
        type: "error",
        message: `Starting vertex ${start} does not exist.`,
        current: null,
        visited: [],
        queue: [],
        traversal: []
      }
    ];
  }

  const visited = new Set();
  const queue = [start];
  const traversal = [];
  const steps = [];

  visited.add(start);

  steps.push({
    type: "start",
    message: `BFS starts from vertex ${start}.`,
    current: start,
    visited: [...visited],
    queue: [...queue],
    traversal: [...traversal]
  });

  while (queue.length) {
    const current = queue.shift();

    traversal.push(current);

    steps.push({
      type: "visit",
      message: `Visit vertex ${current} and inspect its adjacent vertices.`,
      current,
      visited: [...visited],
      queue: [...queue],
      traversal: [...traversal]
    });

    graph[current].forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);

        steps.push({
          type: "enqueue",
          message: `Vertex ${neighbor} is unvisited, so it is marked and added to the queue.`,
          current: neighbor,
          visited: [...visited],
          queue: [...queue],
          traversal: [...traversal]
        });
      }
    });
  }

  steps.push({
    type: "success",
    message: `BFS completed. Traversal: ${traversal.join(" → ")}`,
    current: null,
    visited: [...visited],
    queue: [],
    traversal: [...traversal]
  });

  return steps;
};

/* =========================================================
   DFS
   ========================================================= */

const buildDFSSteps = (graph, start) => {
  if (!graph[start]) {
    return [
      {
        type: "error",
        message: `Starting vertex ${start} does not exist.`,
        current: null,
        visited: [],
        traversal: []
      }
    ];
  }

  const visited = new Set();
  const traversal = [];
  const steps = [];

  const dfs = (vertex) => {
    visited.add(vertex);
    traversal.push(vertex);

    steps.push({
      type: "visit",
      message: `Visit vertex ${vertex} and mark it as visited.`,
      current: vertex,
      visited: [...visited],
      traversal: [...traversal]
    });

    for (const neighbor of graph[vertex]) {
      if (!visited.has(neighbor)) {
        steps.push({
          type: "explore",
          message: `Explore edge ${vertex} → ${neighbor}.`,
          current: neighbor,
          visited: [...visited],
          traversal: [...traversal]
        });

        dfs(neighbor);
      }
    }
  };

  dfs(start);

  steps.push({
    type: "success",
    message: `DFS completed. Traversal: ${traversal.join(" → ")}`,
    current: null,
    visited: [...visited],
    traversal: [...traversal]
  });

  return steps;
};

/* =========================================================
   NODE POSITIONS
   ========================================================= */

const NODE_POSITIONS = {
  A: { x: 50, y: 25 },
  B: { x: 25, y: 50 },
  C: { x: 75, y: 50 },
  D: { x: 50, y: 75 },
  E: { x: 18, y: 78 },
  F: { x: 82, y: 78 },
  G: { x: 50, y: 50 },
  H: { x: 50, y: 90 },
  I: { x: 12, y: 50 },
  J: { x: 88, y: 50 }
};

const getNodePosition = (vertex, index, total) => {
  if (NODE_POSITIONS[vertex]) {
    return NODE_POSITIONS[vertex];
  }

  const angle =
    (index / Math.max(total, 1)) * Math.PI * 2 -
    Math.PI / 2;

  return {
    x: 50 + Math.cos(angle) * 35,
    y: 50 + Math.sin(angle) * 35
  };
};

/* =========================================================
   COMPONENT
   ========================================================= */

const DSTExperiment11 = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [activeTab, setActiveTab] =
    useState("simulation");

  const [showTheory, setShowTheory] =
    useState(false);

  const [showProcedure, setShowProcedure] =
    useState(false);

  const [showHelp, setShowHelp] =
    useState(false);

  /* =========================================================
     SIMULATION STATE
     ========================================================= */

  const [vertices, setVertices] =
    useState(DEFAULT_VERTICES);

  const [edges, setEdges] =
    useState(DEFAULT_EDGES);

  const [vertexInput, setVertexInput] =
    useState("");

  const [edgeFrom, setEdgeFrom] =
    useState("A");

  const [edgeTo, setEdgeTo] =
    useState("B");

  const [startVertex, setStartVertex] =
    useState("A");

  const [operation, setOperation] =
    useState("add-vertex");

  const [traversalType, setTraversalType] =
    useState("BFS");

  const [graphMode, setGraphMode] =
    useState("undirected");

  const [graph, setGraph] =
    useState(() => createGraph());

  const [activeVertex, setActiveVertex] =
    useState(null);

  const [visitedVertices, setVisitedVertices] =
    useState([]);

  const [traversalResult, setTraversalResult] =
    useState([]);

  const [traversalSteps, setTraversalSteps] =
    useState([]);

  const [currentTraversalStep, setCurrentTraversalStep] =
    useState(-1);

  const [observations, setObservations] =
    useState([]);

  /* =========================================================
     PROGRAM
     ========================================================= */

  const [programRunning, setProgramRunning] =
    useState(false);

  const [programCompleted, setProgramCompleted] =
    useState(false);

  const [programSteps, setProgramSteps] =
    useState([]);

  const [programCurrentStep, setProgramCurrentStep] =
    useState(-1);

  const [programOperation, setProgramOperation] =
    useState("BFS");

  const [programStart, setProgramStart] =
    useState("A");

  const [autoPlay, setAutoPlay] =
    useState(false);

  /* =========================================================
     QUESTIONS
     ========================================================= */

  const questions = [
    {
      q: "Which data structure is commonly used for BFS?",
      options: ["Stack", "Queue", "Tree", "Array"],
      answer: 1
    },
    {
      q: "Which data structure is commonly used for DFS?",
      options: ["Queue", "Stack", "Heap", "Hash"],
      answer: 1
    },
    {
      q: "A graph consists of:",
      options: [
        "Only vertices",
        "Only edges",
        "Vertices and edges",
        "Only arrays"
      ],
      answer: 2
    },
    {
      q: "In an undirected graph, an edge connects:",
      options: [
        "Only one vertex",
        "Two vertices",
        "Three vertices",
        "No vertices"
      ],
      answer: 1
    },
    {
      q: "BFS visits vertices:",
      options: [
        "Level by level",
        "Randomly",
        "Only backwards",
        "Only once without a queue"
      ],
      answer: 0
    },
    {
      q: "DFS stands for:",
      options: [
        "Data File Search",
        "Depth First Search",
        "Direct File System",
        "Data Flow Search"
      ],
      answer: 1
    },
    {
      q: "Which representation uses rows and columns?",
      options: [
        "Adjacency Matrix",
        "Linked List",
        "Stack",
        "Queue"
      ],
      answer: 0
    },
    {
      q: "In an adjacency matrix, matrix[i][j] represents:",
      options: [
        "Vertex name",
        "Connection between vertices",
        "Queue position",
        "Traversal count"
      ],
      answer: 1
    },
    {
      q: "Which operation adds a new vertex?",
      options: [
        "Add Vertex",
        "Pop",
        "Delete Edge",
        "Traverse"
      ],
      answer: 0
    },
    {
      q: "A connected graph has:",
      options: [
        "No edges",
        "A path between every pair of vertices",
        "Only one vertex",
        "Only loops"
      ],
      answer: 1
    },
    {
      q: "Which data structure does BFS use to manage vertices waiting to be visited?",
      options: ["Stack", "Queue", "Heap", "Tree"],
      answer: 1
    },
    {
      q: "Which data structure is commonly used by iterative DFS?",
      options: ["Queue", "Stack", "Adjacency matrix", "Array index"],
      answer: 1
    },
    {
      q: "Why is a visited set or list used during graph traversal?",
      options: ["To avoid processing a vertex repeatedly", "To add more edges", "To sort vertex labels", "To remove the starting vertex"],
      answer: 0
    },
    {
      q: "In an undirected graph, if A is connected to B, which matrix entries represent that edge?",
      options: ["matrix[A][B] only", "matrix[B][A] only", "Both matrix[A][B] and matrix[B][A]", "Neither entry"],
      answer: 2
    },
    {
      q: "What does BFS generally explore before moving to vertices two edges away from the start?",
      options: ["All immediate neighbors of the start", "Only the deepest path", "All disconnected vertices", "Only the last vertex"],
      answer: 0
    },
    {
      q: "In an unweighted graph, BFS can find a path with the fewest:",
      options: ["Vertices in the graph", "Edges from the start to a reachable vertex", "Connected components", "Adjacency matrix rows"],
      answer: 1
    },
    {
      q: "What does DFS do when the current vertex has no unvisited neighbors?",
      options: ["Backtracks to an earlier vertex", "Clears the graph", "Restarts at the same vertex", "Adds a new edge"],
      answer: 0
    },
    {
      q: "What does deleting an edge from an undirected graph do?",
      options: ["Removes the connection between its two vertices", "Deletes every vertex", "Changes all vertex names", "Reverses the traversal"],
      answer: 0
    },
    {
      q: "If a graph has multiple disconnected components, what is needed to visit every vertex?",
      options: ["Start a traversal from each still-unvisited component", "Run BFS only once from any vertex", "Delete all isolated vertices", "Use an empty adjacency matrix"],
      answer: 0
    },
    {
      q: "In an adjacency list, what does the list for a vertex contain?",
      options: ["Its neighboring vertices", "All traversal results", "Only its own name", "The graph's total memory"],
      answer: 0
    }
  ];

  const [answers, setAnswers] =
    useState({});

  const [questionResult, setQuestionResult] =
    useState(null);

  const [experimentCompleted, setExperimentCompleted] =
    useState(false);

  /* =========================================================
     GRAPH OPERATIONS
     ========================================================= */

  const rebuildGraph = (
    nextVertices,
    nextEdges
  ) => {
    setVertices(nextVertices);
    setEdges(nextEdges);

    setGraph(
      createGraph(
        nextVertices,
        nextEdges
      )
    );
  };

  const addObservation = (
    operationName,
    details,
    status
  ) => {
    setObservations((old) => [
      ...old,
      {
        attempt: old.length + 1,
        operation: operationName,
        details,
        status
      }
    ]);
  };

  const addVertex = () => {
    const value =
      vertexInput
        .trim()
        .toUpperCase();

    if (!value) {
      alert("Enter a vertex name.");
      return;
    }

    if (vertices.includes(value)) {
      alert("Vertex already exists.");
      return;
    }

    if (!/^[A-Z]$/.test(value)) {
      alert(
        "Use a single alphabet character A-Z."
      );
      return;
    }

    const nextVertices = [
      ...vertices,
      value
    ];

    rebuildGraph(
      nextVertices,
      edges
    );

    setVertexInput("");
    setActiveVertex(value);

    addObservation(
      "Add Vertex",
      value,
      "Successful"
    );
  };

  const addEdge = () => {
    if (
      !vertices.includes(edgeFrom) ||
      !vertices.includes(edgeTo)
    ) {
      alert("Select valid vertices.");
      return;
    }

    if (edgeFrom === edgeTo) {
      alert(
        "Self-loop is not allowed in this simulation."
      );
      return;
    }

    const exists = edges.some(
      ([a, b]) =>
        (a === edgeFrom && b === edgeTo) ||
        (a === edgeTo && b === edgeFrom)
    );

    if (exists) {
      alert("Edge already exists.");
      return;
    }

    const nextEdges = [
      ...edges,
      [edgeFrom, edgeTo]
    ];

    rebuildGraph(
      vertices,
      nextEdges
    );

    setActiveVertex(edgeTo);

    addObservation(
      "Add Edge",
      `${edgeFrom} — ${edgeTo}`,
      "Successful"
    );
  };

  const deleteEdge = () => {
    const nextEdges = edges.filter(
      ([a, b]) =>
        !(
          (a === edgeFrom && b === edgeTo) ||
          (a === edgeTo && b === edgeFrom)
        )
    );

    if (
      nextEdges.length ===
      edges.length
    ) {
      alert("Edge does not exist.");
      return;
    }

    rebuildGraph(
      vertices,
      nextEdges
    );

    setActiveVertex(null);

    addObservation(
      "Delete Edge",
      `${edgeFrom} — ${edgeTo}`,
      "Successful"
    );
  };

  const deleteVertex = () => {
    const value =
      vertexInput
        .trim()
        .toUpperCase();

    if (!vertices.includes(value)) {
      alert("Vertex does not exist.");
      return;
    }

    const nextVertices =
      vertices.filter(
        (v) => v !== value
      );

    const nextEdges =
      edges.filter(
        ([a, b]) =>
          a !== value &&
          b !== value
      );

    rebuildGraph(
      nextVertices,
      nextEdges
    );

    setVertexInput("");
    setActiveVertex(null);

    addObservation(
      "Delete Vertex",
      value,
      "Successful"
    );
  };

  const resetGraph = () => {
    rebuildGraph(
      [...DEFAULT_VERTICES],
      DEFAULT_EDGES.map((e) => [...e])
    );

    setVertexInput("");
    setActiveVertex(null);
    setVisitedVertices([]);
    setTraversalResult([]);
    setTraversalSteps([]);
    setCurrentTraversalStep(-1);

    addObservation(
      "Reset Graph",
      "Default Graph",
      "Successful"
    );
  };

  /* =========================================================
     TRAVERSAL
     ========================================================= */

  const startTraversal = () => {
    if (!graph[startVertex]) {
      alert(
        "Select a valid starting vertex."
      );
      return;
    }

    const generated =
      traversalType === "BFS"
        ? buildBFSSteps(
            graph,
            startVertex
          )
        : buildDFSSteps(
            graph,
            startVertex
          );

    setTraversalSteps(generated);
    setCurrentTraversalStep(0);

    const first = generated[0];

    setVisitedVertices(
      first?.visited || []
    );

    setTraversalResult(
      first?.traversal || []
    );

    setActiveVertex(
      first?.current || null
    );
  };

  const nextTraversalStep = () => {
    if (
      currentTraversalStep <
      traversalSteps.length - 1
    ) {
      const next =
        currentTraversalStep + 1;

      setCurrentTraversalStep(next);

      const step =
        traversalSteps[next];

      setVisitedVertices(
        step.visited || []
      );

      setTraversalResult(
        step.traversal || []
      );

      setActiveVertex(
        step.current || null
      );

      if (step.type === "success") {
        addObservation(
          traversalType,
          `${startVertex}: ${
            step.traversal.join(" → ")
          }`,
          "Successful"
        );
      }
    }
  };

  const previousTraversalStep = () => {
    if (
      currentTraversalStep > 0
    ) {
      const previous =
        currentTraversalStep - 1;

      setCurrentTraversalStep(
        previous
      );

      const step =
        traversalSteps[previous];

      setVisitedVertices(
        step.visited || []
      );

      setTraversalResult(
        step.traversal || []
      );

      setActiveVertex(
        step.current || null
      );
    }
  };

  const resetTraversal = () => {
    setTraversalSteps([]);
    setCurrentTraversalStep(-1);
    setVisitedVertices([]);
    setTraversalResult([]);
    setActiveVertex(null);
  };

  /* =========================================================
     PROGRAM
     ========================================================= */

  const runProgram = () => {
    const generated =
      programOperation === "BFS"
        ? buildBFSSteps(
            graph,
            programStart
          )
        : buildDFSSteps(
            graph,
            programStart
          );

    setProgramSteps(generated);
    setProgramCurrentStep(0);
    setProgramRunning(true);
    setProgramCompleted(false);
    setAutoPlay(false);
  };

  const programNext = () => {
    if (
      programCurrentStep <
      programSteps.length - 1
    ) {
      const next =
        programCurrentStep + 1;

      setProgramCurrentStep(next);

      if (
        next ===
        programSteps.length - 1
      ) {
        setProgramCompleted(true);
        setAutoPlay(false);
      }
    }
  };

  const programPrevious = () => {
    if (
      programCurrentStep > 0
    ) {
      setProgramCurrentStep(
        (old) => old - 1
      );

      setProgramCompleted(false);
    }
  };

  useEffect(() => {
    if (
      !autoPlay ||
      !programRunning
    ) {
      return;
    }

    if (
      programCurrentStep >=
      programSteps.length - 1
    ) {
      setAutoPlay(false);
      setProgramCompleted(true);
      return;
    }

    const timer =
      setTimeout(
        programNext,
        900
      );

    return () =>
      clearTimeout(timer);
  }, [
    autoPlay,
    programCurrentStep,
    programSteps,
    programRunning
  ]);

  /* =========================================================
     QUESTIONS
     ========================================================= */

  const selectAnswer = (
    questionIndex,
    optionIndex
  ) => {
    if (experimentCompleted) return;

    const nextAnswers = {
      ...answers,
      [questionIndex]: optionIndex,
    };
    setAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length === questions.length) {
      const score = questions.reduce(
        (total, question, index) =>
          total + (nextAnswers[index] === question.answer ? 1 : 0),
        0
      );
      setQuestionResult({ score, total: questions.length });
    }
  };

  /* =========================================================
     FINAL SUBMIT
     ========================================================= */

  const submitExperiment = () => {
    if (!observations.length) {
      alert(
        "Please perform at least one graph operation."
      );
      return;
    }

    if (!programCompleted) {
      alert(
        "Please complete Program Execution first."
      );
      return;
    }

    if (!questionResult) {
      alert(
        "Please answer all questions before submitting the experiment."
      );
      return;
    }

    const resultData = buildDstResult({
      experimentNo: 11,
      experimentName: "Implement Graph Operations",
      questionList: questions,
      selectedAnswers: answers,
      observations,
      graph,
      questionResult,
    });

    setExperimentCompleted(true);

    localStorage.setItem(
      "DSTExperiment11Result",
      JSON.stringify(resultData)
    );

    localStorage.setItem("assignmentResult", JSON.stringify(resultData));
    navigate("/result", { state: resultData });
  };

  /* =========================================================
     ADJACENCY MATRIX
     ========================================================= */

  const renderMatrix = () => {
    return (
      <div className="dst11-matrix-wrap">
        <table className="dst11-matrix">
          <thead>
            <tr>
              <th></th>

              {vertices.map((v) => (
                <th key={v}>
                  {v}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {vertices.map((row) => (
              <tr key={row}>
                <th>{row}</th>

                {vertices.map((col) => (
                  <td
                    key={col}
                    className={
                      graph[row]?.includes(
                        col
                      )
                        ? "connected"
                        : ""
                    }
                  >
                    {graph[row]?.includes(
                      col
                    )
                      ? 1
                      : 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /* =========================================================
     GRAPH CANVAS
     ========================================================= */

  const renderGraphCanvas = (
    currentGraph = graph,
    currentActive = activeVertex,
    currentVisited = visitedVertices
  ) => {
    const currentVertices =
      Object.keys(currentGraph);

    const currentEdges =
      getEdges(currentGraph);

    return (
      <div
        className="dst11-graph-canvas"
        ref={canvasRef}
      >
        <div className="dst11-canvas-label">
          GRAPH VISUALIZER
        </div>

        <svg
          className="dst11-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {currentEdges.map(
            ([a, b], index) => {
              const aIndex =
                currentVertices.indexOf(a);

              const bIndex =
                currentVertices.indexOf(b);

              const p1 =
                getNodePosition(
                  a,
                  aIndex,
                  currentVertices.length
                );

              const p2 =
                getNodePosition(
                  b,
                  bIndex,
                  currentVertices.length
                );

              const isActiveEdge =
                currentActive === a ||
                currentActive === b;

              return (
                <line
                  key={`${a}-${b}-${index}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  className={
                    isActiveEdge
                      ? "dst11-edge active"
                      : "dst11-edge"
                  }
                />
              );
            }
          )}
        </svg>

        <div className="dst11-node-layer">
          {currentVertices.map(
            (vertex, index) => {
              const position =
                getNodePosition(
                  vertex,
                  index,
                  currentVertices.length
                );

              const isVisited =
                currentVisited.includes(
                  vertex
                );

              const isActive =
                currentActive ===
                vertex;

              return (
                <div
                  key={vertex}
                  className={`dst11-node ${
                    isVisited
                      ? "visited"
                      : ""
                  } ${
                    isActive
                      ? "active"
                      : ""
                  }`}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`
                  }}
                >
                  <b>{vertex}</b>

                  {isActive && (
                    <span className="dst11-node-pulse" />
                  )}
                </div>
              );
            }
          )}
        </div>

        <div className="dst11-canvas-legend">
          <span>
            <i className="normal-dot" />
            Vertex
          </span>

          <span>
            <i className="visited-dot" />
            Visited
          </span>

          <span>
            <i className="active-dot" />
            Current
          </span>
        </div>
      </div>
    );
  };

  const currentTraversalStepData =
    currentTraversalStep >= 0
      ? traversalSteps[
          currentTraversalStep
        ]
      : null;

  const currentProgramStep =
    programCurrentStep >= 0
      ? programSteps[
          programCurrentStep
        ]
      : null;

  /* =========================================================
     RETURN
     ========================================================= */

  return (
    <div className="dst11-root">
      <div className="dst11-container">

        {/* HEADER */}

        <header className="dst11-header">

          <button
            className="dst11-back"
            onClick={() =>
              navigate("/dst-experiments")
            }
          >
            ← Back
          </button>

          <div className="dst11-header-title">
            <div className="dst11-exp-no">
              Experiment No. 11
            </div>

            <h1>
              Implement All Operations on Graph
            </h1>
          </div>

          <button
            className="dst11-help"
            onClick={() => setShowHelp(true)}
          >
            ? Help
          </button>

        </header>

        {showHelp && (
          <div className="dst11-help-overlay" onClick={() => setShowHelp(false)}>
            <section
              aria-labelledby="dst11-help-title"
              aria-modal="true"
              className="dst11-help-dialog"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dst11-help-dialog-header">
                <h2 id="dst11-help-title">Experiment Help</h2>
                <button
                  aria-label="Close help"
                  className="dst11-help-close"
                  onClick={() => setShowHelp(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <ul>
                <li>Add vertices and edges to build the graph in the simulation.</li>
                <li>Select a start vertex and step through BFS or DFS.</li>
                <li>Use the Program tab to inspect the graph algorithm execution.</li>
                <li>Answer all 20 questions and submit them before submitting the experiment.</li>
              </ul>
              <button className="dst11-help-done" onClick={() => setShowHelp(false)} type="button">
                Got it
              </button>
            </section>
          </div>
        )}

        {/* AIM */}

        <div className="dst11-card dst11-aim">

          <div className="dst11-title">
            Aim
          </div>

          <p>
            To write a C program to implement
            all the basic operations on a graph
            including insertion, deletion and
            traversal using BFS and DFS.
          </p>

        </div>

        {/* THEORY */}

        <div className="dst11-card dst11-collapse">

          <button
            className="dst11-collapse-header"
            onClick={() =>
              setShowTheory(
                !showTheory
              )
            }
          >
            <span>Theory</span>

            <span>
              {showTheory
                ? "▲"
                : "▼"}
            </span>
          </button>

          {showTheory && (
            <div className="dst11-collapse-content">

              <p>
                A graph is a non-linear data
                structure consisting of vertices
                and edges. Graphs can be represented
                using an adjacency matrix or
                adjacency list.
              </p>

              <p>
                Common graph operations include
                adding and deleting vertices,
                adding and deleting edges, displaying
                the graph and traversing it using
                Breadth First Search (BFS) or
                Depth First Search (DFS).
              </p>

              <div className="dst11-theory-grid">

                <div>
                  <b>Vertex</b>
                  <span>
                    Node of a graph
                  </span>
                </div>

                <div>
                  <b>Edge</b>
                  <span>
                    Connection between vertices
                  </span>
                </div>

                <div>
                  <b>BFS</b>
                  <span>
                    Uses Queue
                  </span>
                </div>

                <div>
                  <b>DFS</b>
                  <span>
                    Uses Stack / Recursion
                  </span>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* PROCEDURE */}

        <div className="dst11-card dst11-collapse">

          <button
            className="dst11-collapse-header"
            onClick={() =>
              setShowProcedure(
                !showProcedure
              )
            }
          >
            <span>
              Procedure
            </span>

            <span>
              {showProcedure
                ? "▲"
                : "▼"}
            </span>
          </button>

          {showProcedure && (
            <div className="dst11-collapse-content">

              <div className="dst11-procedure">

                <ol>
                  <li>
                    Create the graph with
                    required vertices.
                  </li>

                  <li>
                    Add edges between
                    selected vertices.
                  </li>

                  <li>
                    Delete vertices or
                    edges when required.
                  </li>

                  <li>
                    Display the graph
                    representation.
                  </li>
                </ol>

                <ol start="5">
                  <li>
                    Select a starting vertex.
                  </li>

                  <li>
                    Perform BFS or DFS
                    traversal.
                  </li>

                  <li>
                    Observe each traversal
                    step.
                  </li>

                  <li>
                    Verify the final traversal
                    result.
                  </li>
                </ol>

              </div>

            </div>
          )}

        </div>

        {/* TABS */}

        <div className="dst11-tabs">

          <button
            className={
              activeTab ===
              "simulation"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "simulation"
              )
            }
          >
            Simulation
          </button>

          <button
            className={
              activeTab ===
              "program"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "program"
              )
            }
          >
            Program
          </button>

          <button
            className={
              activeTab ===
              "questions"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "questions"
              )
            }
          >
            Questions
          </button>

        </div>

        {/* =================================================
            SIMULATION
            ================================================= */}

        {activeTab === "simulation" && (
          <>

            <div className="dst11-sim-row">

              {/* INPUT */}

              <div className="dst11-card dst11-input">

                <div className="dst11-section">
                  Graph Operations
                </div>

                <label>
                  Operation
                </label>

                <select
                  value={operation}
                  onChange={(e) =>
                    setOperation(
                      e.target.value
                    )
                  }
                >
                  <option value="add-vertex">
                    Add Vertex
                  </option>

                  <option value="delete-vertex">
                    Delete Vertex
                  </option>

                  <option value="add-edge">
                    Add Edge
                  </option>

                  <option value="delete-edge">
                    Delete Edge
                  </option>
                </select>

                {(operation ===
                  "add-vertex" ||
                  operation ===
                    "delete-vertex") && (
                  <>
                    <label>
                      Vertex
                    </label>

                    <input
                      value={
                        vertexInput
                      }
                      onChange={(e) =>
                        setVertexInput(
                          e.target.value
                        )
                      }
                      placeholder="A"
                      maxLength={1}
                    />

                    <button
                      className="dst11-primary"
                      onClick={
                        operation ===
                        "add-vertex"
                          ? addVertex
                          : deleteVertex
                      }
                    >
                      {operation ===
                      "add-vertex"
                        ? "+ Add Vertex"
                        : "− Delete Vertex"}
                    </button>
                  </>
                )}

                {(operation ===
                  "add-edge" ||
                  operation ===
                    "delete-edge") && (
                  <>
                    <label>
                      From
                    </label>

                    <select
                      value={edgeFrom}
                      onChange={(e) =>
                        setEdgeFrom(
                          e.target.value
                        )
                      }
                    >
                      {vertices.map(
                        (v) => (
                          <option
                            key={v}
                            value={v}
                          >
                            {v}
                          </option>
                        )
                      )}
                    </select>

                    <label>
                      To
                    </label>

                    <select
                      value={edgeTo}
                      onChange={(e) =>
                        setEdgeTo(
                          e.target.value
                        )
                      }
                    >
                      {vertices.map(
                        (v) => (
                          <option
                            key={v}
                            value={v}
                          >
                            {v}
                          </option>
                        )
                      )}
                    </select>

                    <button
                      className="dst11-primary"
                      onClick={
                        operation ===
                        "add-edge"
                          ? addEdge
                          : deleteEdge
                      }
                    >
                      {operation ===
                      "add-edge"
                        ? "+ Add Edge"
                        : "− Delete Edge"}
                    </button>
                  </>
                )}

                <div className="dst11-divider" />

                <label>
                  Graph Type
                </label>

                <select
                  value={graphMode}
                  onChange={(e) =>
                    setGraphMode(
                      e.target.value
                    )
                  }
                >
                  <option value="undirected">
                    Undirected
                  </option>

                  <option value="directed">
                    Directed
                  </option>
                </select>

                <label>
                  Traversal
                </label>

                <select
                  value={traversalType}
                  onChange={(e) =>
                    setTraversalType(
                      e.target.value
                    )
                  }
                >
                  <option value="BFS">
                    BFS
                  </option>

                  <option value="DFS">
                    DFS
                  </option>
                </select>

                <label>
                  Start Vertex
                </label>

                <select
                  value={startVertex}
                  onChange={(e) =>
                    setStartVertex(
                      e.target.value
                    )
                  }
                >
                  {vertices.map(
                    (v) => (
                      <option
                        key={v}
                        value={v}
                      >
                        {v}
                      </option>
                    )
                  )}
                </select>

                <button
                  className="dst11-primary"
                  onClick={
                    startTraversal
                  }
                >
                  ▶ Start Traversal
                </button>

                <button
                  className="dst11-secondary"
                  onClick={
                    resetTraversal
                  }
                >
                  Reset Traversal
                </button>

                <button
                  className="dst11-reset"
                  onClick={resetGraph}
                >
                  ↻ Reset Graph
                </button>

                <div className="dst11-info">

                  <b>
                    Vertices
                  </b>

                  <span>
                    {vertices.join(
                      " • "
                    ) || "None"}
                  </span>

                  <b>
                    Edges
                  </b>

                  <span>
                    {edges.length}
                  </span>

                </div>

              </div>

              {/* CANVAS */}

              <div className="dst11-card dst11-canvas-card">

                <div className="dst11-panel-heading">

                  <span>
                    Graph Simulation
                  </span>

                  <small>
                    {currentTraversalStepData
                      ? "TRAVERSING"
                      : "READY"}
                  </small>

                </div>

                {renderGraphCanvas(
                  graph,
                  activeVertex,
                  visitedVertices
                )}

                <div className="dst11-traversal-bar">

                  <div>
                    <span>
                      Traversal
                    </span>

                    <b>
                      {traversalResult.length
                        ? traversalResult.join(
                            " → "
                          )
                        : "—"}
                    </b>
                  </div>

                  <div>
                    <span>
                      Current
                    </span>

                    <b>
                      {activeVertex ||
                        "—"}
                    </b>
                  </div>

                  <div>
                    <span>
                      Visited
                    </span>

                    <b>
                      {
                        visitedVertices.length
                      }
                    </b>
                  </div>

                </div>

                <div
                  className={`dst11-message ${
                    currentTraversalStepData
                      ?.type ===
                    "error"
                      ? "error"
                      : ""
                  } ${
                    currentTraversalStepData
                      ?.type ===
                    "success"
                      ? "success"
                      : ""
                  }`}
                >
                  {currentTraversalStepData
                    ?.message ||
                    "Build the graph and start BFS or DFS to see live traversal."}
                </div>

                <div className="dst11-controls">

                  <button
                    className="dst11-secondary"
                    onClick={
                      previousTraversalStep
                    }
                    disabled={
                      currentTraversalStep <=
                      0
                    }
                  >
                    ← Previous
                  </button>

                  <span>
                    Step{" "}
                    {traversalSteps.length
                      ? currentTraversalStep +
                        1
                      : 0}
                    {" / "}
                    {
                      traversalSteps.length
                    }
                  </span>

                  <button
                    className="dst11-primary"
                    onClick={
                      nextTraversalStep
                    }
                    disabled={
                      !traversalSteps.length ||
                      currentTraversalStep >=
                        traversalSteps.length -
                          1
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

              {/* ANALYSIS */}

              <div className="dst11-card dst11-analysis">

                <div className="dst11-section">
                  Analysis
                </div>

                <div className="dst11-analysis-box">
                  <span>
                    Vertices
                  </span>

                  <b>
                    {vertices.length}
                  </b>
                </div>

                <div className="dst11-analysis-box">
                  <span>
                    Edges
                  </span>

                  <b>
                    {edges.length}
                  </b>
                </div>

                <div className="dst11-analysis-box">
                  <span>
                    Current Vertex
                  </span>

                  <b>
                    {activeVertex ||
                      "—"}
                  </b>
                </div>

                <div className="dst11-analysis-box">
                  <span>
                    Traversal
                  </span>

                  <b>
                    {traversalType}
                  </b>
                </div>

                <div className="dst11-analysis-box">
                  <span>
                    Result
                  </span>

                  <b>
                    {traversalResult.length
                      ? traversalResult.join(
                          " → "
                        )
                      : "—"}
                  </b>
                </div>

                <div className="dst11-mini-heading">
                  Adjacency List
                </div>

                <div className="dst11-adj-list">

                  {vertices.map(
                    (v) => (
                      <div key={v}>

                        <b>
                          {v}
                        </b>

                        <span>
                          {graph[v]?.join(
                            " → "
                          ) ||
                            "—"}
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

            {/* REPRESENTATION */}

            <div className="dst11-representation-grid">

              <div className="dst11-card dst11-representation-card">

                <div className="dst11-section">
                  Adjacency Matrix
                </div>

                {renderMatrix()}

              </div>

              <div className="dst11-card dst11-representation-card">

                <div className="dst11-section">
                  Traversal Result
                </div>

                <div className="dst11-big-result">

                  {traversalResult.length
                    ? traversalResult.map(
                        (v, i) => (
                          <React.Fragment
                            key={`${v}-${i}`}
                          >
                            <span>
                              {v}
                            </span>

                            {i <
                              traversalResult.length -
                                1 && (
                              <b>→</b>
                            )}
                          </React.Fragment>
                        )
                      )
                    : (
                      <em>
                        Start a traversal
                        to display result
                      </em>
                    )}

                </div>

              </div>

            </div>

            {/* OBSERVATIONS */}

            {observations.length >
              0 && (
              <div className="dst11-card dst11-observation-card">

                <div className="dst11-section">
                  Observation Table
                </div>

                <div className="dst11-table-wrapper">

                  <table className="dst11-table">

                    <thead>
                      <tr>
                        <th>
                          Attempt
                        </th>

                        <th>
                          Operation
                        </th>

                        <th>
                          Details
                        </th>

                        <th>
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {observations.map(
                        (item) => (
                          <tr
                            key={
                              item.attempt
                            }
                          >
                            <td>
                              {
                                item.attempt
                              }
                            </td>

                            <td>
                              {
                                item.operation
                              }
                            </td>

                            <td>
                              {
                                item.details
                              }
                            </td>

                            <td>
                              <span className="dst11-status">
                                ✓{" "}
                                {
                                  item.status
                                }
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                </div>

              </div>
            )}

          </>
        )}

        {/* =================================================
            PROGRAM
            ================================================= */}

        {activeTab === "program" && (
          <div className="dst11-program-area">

            <div className="dst11-program-grid">

              {/* CODE */}

              <div className="dst11-program-left">

                <div className="dst11-card dst11-code-card">

                  <div className="dst11-section">
                    C Program
                  </div>

                  <div className="dst11-code-header">
                    <span>
                      graph_operations.c
                    </span>

                    <span>
                      READ ONLY
                    </span>
                  </div>

                  <pre className="dst11-code">
{`#include <stdio.h>

#define MAX 20

int graph[MAX][MAX];
int visited[MAX];
int n;

void addVertex()
{
    n++;
}

void addEdge(int u, int v)
{
    graph[u][v] = 1;
    graph[v][u] = 1;
}

void deleteEdge(int u, int v)
{
    graph[u][v] = 0;
    graph[v][u] = 0;
}

void display()
{
    int i, j;

    for(i = 0; i < n; i++)
    {
        for(j = 0; j < n; j++)
            printf("%d ", graph[i][j]);

        printf("\\n");
    }
}

void BFS(int start)
{
    int queue[MAX];
    int front = 0, rear = 0;
    int i, current;

    for(i = 0; i < n; i++)
        visited[i] = 0;

    queue[rear++] = start;
    visited[start] = 1;

    while(front < rear)
    {
        current = queue[front++];
        printf("%d ", current);

        for(i = 0; i < n; i++)
        {
            if(graph[current][i] &&
               !visited[i])
            {
                visited[i] = 1;
                queue[rear++] = i;
            }
        }
    }
}

void DFS(int vertex)
{
    int i;

    visited[vertex] = 1;
    printf("%d ", vertex);

    for(i = 0; i < n; i++)
    {
        if(graph[vertex][i] &&
           !visited[i])
        {
            DFS(i);
        }
    }
}

int main()
{
    int choice, u, v, start;

    printf("Enter number of vertices: ");
    scanf("%d", &n);

    while(1)
    {
        printf("\\n1. Add Edge");
        printf("\\n2. Delete Edge");
        printf("\\n3. Display Graph");
        printf("\\n4. BFS");
        printf("\\n5. DFS");
        printf("\\n6. Exit");

        printf("\\nEnter choice: ");
        scanf("%d", &choice);

        switch(choice)
        {
            case 1:
                scanf("%d%d", &u, &v);
                addEdge(u, v);
                break;

            case 2:
                scanf("%d%d", &u, &v);
                deleteEdge(u, v);
                break;

            case 3:
                display();
                break;

            case 4:
                scanf("%d", &start);
                BFS(start);
                break;

            case 5:
                scanf("%d", &start);

                for(u = 0; u < n; u++)
                    visited[u] = 0;

                DFS(start);
                break;

            case 6:
                return 0;
        }
    }

    return 0;
}`}
                  </pre>

                </div>

                <div className="dst11-card dst11-program-input">

                  <div className="dst11-section">
                    Program Input
                  </div>

                  <label>
                    Traversal Algorithm
                  </label>

                  <select
                    value={
                      programOperation
                    }
                    onChange={(e) => {
                      setProgramOperation(
                        e.target.value
                      );

                      setProgramCompleted(
                        false
                      );
                    }}
                  >
                    <option value="BFS">
                      BFS
                    </option>

                    <option value="DFS">
                      DFS
                    </option>
                  </select>

                  <label>
                    Starting Vertex
                  </label>

                  <select
                    value={programStart}
                    onChange={(e) => {
                      setProgramStart(
                        e.target.value
                      );

                      setProgramCompleted(
                        false
                      );
                    }}
                  >
                    {vertices.map(
                      (v) => (
                        <option
                          key={v}
                          value={v}
                        >
                          {v}
                        </option>
                      )
                    )}
                  </select>

                  <div className="dst11-program-buttons">

                    <button
                      className="dst11-primary"
                      onClick={
                        runProgram
                      }
                    >
                      ▶ Run Program
                    </button>

                    <button
                      className="dst11-secondary"
                      onClick={() => {
                        setProgramSteps(
                          []
                        );

                        setProgramCurrentStep(
                          -1
                        );

                        setProgramRunning(
                          false
                        );

                        setProgramCompleted(
                          false
                        );

                        setAutoPlay(
                          false
                        );
                      }}
                    >
                      New Execution
                    </button>

                  </div>

                </div>

              </div>

              {/* EXECUTION */}

              <div className="dst11-card dst11-program-sim">

                <div className="dst11-panel-heading">

                  <span>
                    Program Execution
                  </span>

                  <small>
                    {programCompleted
                      ? "COMPLETED"
                      : programRunning
                      ? "RUNNING"
                      : "READY"}
                  </small>

                </div>

                <div className="dst11-live-strip">

                  <div>
                    <span>
                      Algorithm
                    </span>

                    <b>
                      {
                        programOperation
                      }
                    </b>
                  </div>

                  <div>
                    <span>
                      Start Vertex
                    </span>

                    <b>
                      {
                        programStart
                      }
                    </b>
                  </div>

                  <div>
                    <span>
                      Step
                    </span>

                    <b>
                      {
                        programSteps.length
                          ? `${
                              programCurrentStep +
                              1
                            } / ${
                              programSteps.length
                            }`
                          : "0 / 0"
                      }
                    </b>
                  </div>

                </div>

                <div className="dst11-program-graph">

                  {renderGraphCanvas(
                    graph,
                    currentProgramStep?.current ||
                      null,
                    currentProgramStep?.visited ||
                      []
                  )}

                </div>

                <div className="dst11-message">

                  {currentProgramStep
                    ?.message ||
                    "Run the program to begin graph traversal."}

                </div>

                <div className="dst11-program-result">

                  <span>
                    Traversal
                  </span>

                  <b>
                    {currentProgramStep
                      ?.traversal?.join(
                        " → "
                      ) || "—"}
                  </b>

                </div>

                <div className="dst11-controls">

                  <button
                    className="dst11-secondary"
                    onClick={
                      programPrevious
                    }
                    disabled={
                      programCurrentStep <=
                      0
                    }
                  >
                    ← Previous
                  </button>

                  <button
                    className="dst11-secondary"
                    onClick={() =>
                      setAutoPlay(
                        (value) =>
                          !value
                      )
                    }
                    disabled={
                      !programRunning ||
                      programCompleted
                    }
                  >
                    {autoPlay
                      ? "⏸ Pause"
                      : "▶ Auto Play"}
                  </button>

                  <button
                    className="dst11-primary"
                    onClick={
                      programNext
                    }
                    disabled={
                      !programSteps.length ||
                      programCurrentStep >=
                        programSteps.length -
                          1
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

            </div>

            {/* TRACE */}

            {programSteps.length >
              0 && (
              <div className="dst11-card dst11-trace-card">

                <div className="dst11-trace-header">

                  <div>

                    <div className="dst11-section">
                      Execution Trace
                    </div>

                    <p>
                      Step-by-step graph
                      traversal
                    </p>

                  </div>

                  <span>
                    {
                      programSteps.length
                    } Steps
                  </span>

                </div>

                <div className="dst11-trace-list">

                  {programSteps.map(
                    (
                      step,
                      index
                    ) => (
                      <button
                        key={index}
                        className={`dst11-trace-item ${
                          programCurrentStep ===
                          index
                            ? "active"
                            : ""
                        } ${
                          index <=
                          programCurrentStep
                            ? "visited"
                            : ""
                        }`}
                        onClick={() => {
                          if (
                            index <=
                            programCurrentStep
                          ) {
                            setProgramCurrentStep(
                              index
                            );

                            setProgramCompleted(
                              index ===
                                programSteps.length -
                                  1
                            );
                          }
                        }}
                      >

                        <span className="dst11-trace-number">
                          {
                            index +
                            1
                          }
                        </span>

                        <span className="dst11-trace-content">

                          <b>
                            {
                              step.message
                            }
                          </b>

                          <small>
                            Current:{" "}
                            {
                              step.current ||
                              "—"
                            }{" "}
                            • Visited:{" "}
                            {step.visited?.join(
                              " "
                            ) ||
                              "None"}
                          </small>

                        </span>

                        <span className="dst11-trace-status">
                          {index <=
                          programCurrentStep
                            ? "✓"
                            : "○"}
                        </span>

                      </button>
                    )
                  )}

                </div>

              </div>
            )}

            {/* OUTPUT */}

            {programCompleted &&
              currentProgramStep && (
                <div className="dst11-card dst11-output-card">

                  <div className="dst11-section">
                    Program Output
                  </div>

                  <pre className="dst11-output">
{`Graph Vertices : ${vertices.join(", ")}

Graph Edges : ${edges
  .map(
    ([a, b]) =>
      `${a}-${b}`
  )
  .join(", ")}

Algorithm : ${programOperation}

Starting Vertex : ${programStart}

Traversal : ${
  currentProgramStep.traversal?.join(
    " -> "
  ) || "None"
}

Execution Status : ${
  currentProgramStep.type ===
  "success"
    ? "SUCCESS"
    : "ERROR"
}

All program steps completed.`}
                  </pre>

                </div>
              )}

          </div>
        )}

        {/* =================================================
            QUESTIONS
            ================================================= */}

        {activeTab === "questions" && (
          <div className="dst11-card dst11-questions">

            <div className="dst11-section">
              Questions
            </div>

            {questions.map(
              (
                question,
                index
              ) => (
                <div
                  className="dst11-question"
                  key={index}
                >

                  <b>
                    {index + 1}.{" "}
                    {
                      question.q
                    }
                  </b>

                  <div className="dst11-options">

                    {question.options.map(
                      (
                        option,
                        optionIndex
                      ) => (
                        <label
                          key={
                            optionIndex
                          }
                        >

                          <input
                            type="radio"
                            name={`q-${index}`}
                            checked={
                              answers[
                                index
                              ] ===
                              optionIndex
                            }
                            onChange={() =>
                              selectAnswer(
                                index,
                                optionIndex
                              )
                            }
                            disabled={experimentCompleted}
                          />

                          {
                            option
                          }

                        </label>
                      )
                    )}

                  </div>

                </div>
              )
            )}

            {experimentCompleted && questionResult && (
              <div className="dst11-question-result">

                <b>
                  Quiz Completed
                  <br />
                  Score:{" "}
                  {
                    questionResult.score
                  }
                  /
                  {
                    questionResult.total
                  }
                </b>

                <span>
                  Completed
                </span>

              </div>
            )}

          </div>
        )}

        {/* FINAL SUBMIT */}

        <div className="dst11-submit-section">

          <button
            className="dst11-submit"
            onClick={
              submitExperiment
            }
            disabled={
              experimentCompleted
            }
          >
            {experimentCompleted
              ? "✓ Submitted"
              : "Submit Experiment"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default DSTExperiment11;