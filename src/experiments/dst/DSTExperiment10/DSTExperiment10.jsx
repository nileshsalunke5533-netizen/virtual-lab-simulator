import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment10.css";

/* =========================================================
   QUESTIONS
   ========================================================= */

const QUESTIONS = [
  {
    q: "Which traversal follows Left, Root, Right?",
    options: ["Preorder", "Postorder", "Inorder", "Level Order"],
    answer: 2
  },
  {
    q: "Which traversal follows Root, Left, Right?",
    options: ["Inorder", "Preorder", "Postorder", "Level Order"],
    answer: 1
  },
  {
    q: "Which traversal follows Left, Right, Root?",
    options: ["Preorder", "Inorder", "Postorder", "Level Order"],
    answer: 2
  },
  {
    q: "Inorder traversal of a BST produces:",
    options: [
      "Random order",
      "Sorted order",
      "Reverse insertion order",
      "Level order"
    ],
    answer: 1
  },
  {
    q: "The first node visited in preorder traversal is:",
    options: ["Root", "Left child", "Right child", "Leaf"],
    answer: 0
  },
  {
    q: "The last node visited in postorder traversal is:",
    options: ["Left child", "Right child", "Root", "Leaf"],
    answer: 2
  },
  {
    q: "Which traversal is useful for obtaining sorted BST values?",
    options: ["Preorder", "Postorder", "Inorder", "Level Order"],
    answer: 2
  },
  {
    q: "A BST stores smaller values on the:",
    options: ["Right", "Left", "Root", "Both sides"],
    answer: 1
  },
  {
    q: "Which data structure is represented by nodes having left and right links?",
    options: ["Stack", "Queue", "Binary Tree", "Array"],
    answer: 2
  },
  {
    q: "Which traversal visits the root after both subtrees?",
    options: ["Inorder", "Preorder", "Postorder", "Level Order"],
    answer: 2
  },
  {
    q: "For a BST with root 8, left child 3, and right child 10, what is the Inorder result?",
    options: ["8, 3, 10", "3, 8, 10", "10, 8, 3", "3, 10, 8"],
    answer: 1
  },
  {
    q: "For the same tree, what is the Preorder result?",
    options: ["3, 8, 10", "3, 10, 8", "8, 3, 10", "10, 8, 3"],
    answer: 2
  },
  {
    q: "For the tree rooted at 8 with children 3 and 10, what is the Postorder result?",
    options: ["8, 3, 10", "3, 10, 8", "3, 8, 10", "10, 8, 3"],
    answer: 1
  },
  {
    q: "Which traversal visits the left subtree before the right subtree and the root last?",
    options: ["Preorder", "Inorder", "Postorder", "Level order"],
    answer: 2
  },
  {
    q: "How many times is each node visited during a complete traversal of a tree with n nodes?",
    options: ["Once", "Twice", "n times per node", "Only the root is visited"],
    answer: 0
  },
  {
    q: "What is the time complexity of visiting every node in a binary tree traversal?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 2
  },
  {
    q: "In a recursive traversal, what should happen when the current node is NULL?",
    options: ["Stop that recursive branch", "Restart from the root", "Create a new node", "Visit the parent twice"],
    answer: 0
  },
  {
    q: "Which sequence describes Preorder traversal?",
    options: ["Left, Root, Right", "Root, Left, Right", "Left, Right, Root", "Right, Root, Left"],
    answer: 1
  },
  {
    q: "Which sequence describes Inorder traversal?",
    options: ["Root, Left, Right", "Left, Right, Root", "Left, Root, Right", "Right, Left, Root"],
    answer: 2
  },
  {
    q: "Which sequence describes Postorder traversal?",
    options: ["Root, Left, Right", "Left, Root, Right", "Left, Right, Root", "Root, Right, Left"],
    answer: 2
  }
];

/* =========================================================
   TREE FUNCTIONS
   ========================================================= */

const cloneTree = (node) =>
  node
    ? {
        value: node.value,
        left: cloneTree(node.left),
        right: cloneTree(node.right)
      }
    : null;

const insertNode = (root, value) => {
  if (!root) {
    return {
      value,
      left: null,
      right: null
    };
  }

  if (value < root.value) {
    root.left = insertNode(root.left, value);
  } else if (value > root.value) {
    root.right = insertNode(root.right, value);
  }

  return root;
};

const buildTree = (values) => {
  let root = null;

  values.forEach((value) => {
    root = insertNode(root, value);
  });

  return root;
};

const inorder = (root) =>
  root
    ? [
        ...inorder(root.left),
        root.value,
        ...inorder(root.right)
      ]
    : [];

const preorder = (root) =>
  root
    ? [
        root.value,
        ...preorder(root.left),
        ...preorder(root.right)
      ]
    : [];

const postorder = (root) =>
  root
    ? [
        ...postorder(root.left),
        ...postorder(root.right),
        root.value
      ]
    : [];

const parseValues = (text) => {
  const parts = text
    .split(/[,\s]+/)
    .filter(Boolean);

  if (!parts.length) return null;

  const values = parts.map(Number);

  if (
    values.some(
      (value) => !Number.isInteger(value)
    )
  ) {
    return null;
  }

  return values;
};

const getTraversal = (root, type) => {
  if (type === "Inorder") return inorder(root);
  if (type === "Preorder") return preorder(root);
  return postorder(root);
};

/* =========================================================
   TRAVERSAL STEPS
   ========================================================= */

const makeTraversalSteps = (
  traversalType,
  input,
  originalTree
) => {
  const values = parseValues(input);

  if (!values) {
    return [
      {
        title: "INVALID INPUT",
        message:
          "Enter integer values separated by commas or spaces.",
        tree: null,
        active: null,
        visited: [],
        output: [],
        type: "error"
      }
    ];
  }

  let tree = buildTree(values);
  const steps = [];

  const visited = [];

  const add = (
    title,
    message,
    active = null,
    type = "normal"
  ) => {
    steps.push({
      title,
      message,
      tree: cloneTree(tree),
      active,
      visited: [...visited],
      output: [...visited],
      type
    });
  };

  add(
    "START",
    `Binary Search Tree created with ${values.length} node(s).`
  );

  const traverse = (node) => {
    if (!node) return;

    if (traversalType === "Preorder") {
      visited.push(node.value);

      add(
        "VISIT ROOT",
        `Visit ${node.value} before traversing its subtrees.`,
        node.value
      );
    }

    traverse(node.left);

    if (traversalType === "Inorder") {
      visited.push(node.value);

      add(
        "VISIT NODE",
        `Left subtree completed. Visit ${node.value}.`,
        node.value
      );
    }

    traverse(node.right);

    if (traversalType === "Postorder") {
      visited.push(node.value);

      add(
        "VISIT NODE",
        `Both subtrees completed. Visit ${node.value}.`,
        node.value
      );
    }
  };

  traverse(tree);

  add(
    "RESULT",
    `${traversalType} traversal completed successfully.`,
    null,
    "success"
  );

  return steps;
};

/* =========================================================
   TREE LAYOUT
   ========================================================= */

const getTreeLayout = (root) => {
  if (!root) {
    return {
      nodes: [],
      edges: [],
      width: 760,
      height: 330
    };
  }

  const nodes = [];
  const edges = [];

  let index = 0;
  let maxDepth = 0;

  const walk = (
    node,
    depth = 0,
    parent = null
  ) => {
    if (!node) return;

    walk(
      node.left,
      depth + 1,
      node
    );

    nodes.push({
      value: node.value,
      depth,
      index: index++,
      parent
    });

    maxDepth = Math.max(
      maxDepth,
      depth
    );

    walk(
      node.right,
      depth + 1,
      node
    );
  };

  walk(root);

  const spacingX =
    nodes.length <= 7 ? 110 : 95;

  const levelGap = 100;

  const positioned = nodes.map(
    (node) => ({
      ...node,
      x:
        70 +
        node.index * spacingX,
      y:
        55 +
        node.depth * levelGap
    })
  );

  positioned.forEach(
    (child) => {
      if (!child.parent) return;

      const parent =
        positioned.find(
          (item) =>
            item.value ===
              child.parent.value &&
            item.depth ===
              child.depth - 1
        );

      if (parent) {
        edges.push({
          x1: parent.x,
          y1: parent.y + 30,
          x2: child.x,
          y2: child.y - 30
        });
      }
    }
  );

  return {
    nodes: positioned,
    edges,
    width: Math.max(
      760,
      nodes.length * spacingX + 100
    ),
    height: Math.max(
      300,
      (maxDepth + 1) *
        levelGap +
        80
    )
  };
};

/* =========================================================
   TREE VISUALIZER
   ========================================================= */

const TreeVisualizer = ({
  tree,
  active,
  visited
}) => {
  const layout = useMemo(
    () => getTreeLayout(tree),
    [tree]
  );

  if (!tree) {
    return (
      <div className="dst10-empty-tree">
        <div className="dst10-empty-circle">
          BST
        </div>

        <b>Binary Search Tree Empty</b>

        <span>
          Enter values and start the simulation.
        </span>
      </div>
    );
  }

  return (
    <div className="dst10-tree-scroll">
      <svg
        className="dst10-tree-svg"
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
      >
        {layout.edges.map(
          (edge, index) => (
            <line
              key={index}
              className="dst10-tree-edge"
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
            />
          )
        )}

        {layout.nodes.map(
          (node, index) => {
            const isActive =
              active === node.value;

            const isVisited =
              visited.includes(
                node.value
              );

            return (
              <g
                key={`${node.value}-${index}`}
                className={
                  isActive
                    ? "dst10-svg-node active"
                    : isVisited
                    ? "dst10-svg-node visited"
                    : "dst10-svg-node"
                }
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="30"
                />

                <text
                  x={node.x}
                  y={node.y - 6}
                  className="dst10-node-label"
                >
                  NODE
                </text>

                <text
                  x={node.x}
                  y={node.y + 15}
                  className="dst10-node-value"
                >
                  {node.value}
                </text>
              </g>
            );
          }
        )}
      </svg>
    </div>
  );
};

/* =========================================================
   COMPONENT
   ========================================================= */

const DSTExperiment10 = () => {
  const navigate = useNavigate();

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

  const [traversalType, setTraversalType] =
    useState("Inorder");

  const [inputValue, setInputValue] =
    useState("");

  const [tree, setTree] =
    useState(null);

  const [steps, setSteps] =
    useState([]);

  const [currentStep, setCurrentStep] =
    useState(-1);

  const [observations, setObservations] =
    useState([]);

  /* =========================================================
     PROGRAM STATE
     ========================================================= */

  const [programTraversal, setProgramTraversal] =
    useState("Inorder");

  const [programValue, setProgramValue] =
    useState("");

  const [programTree, setProgramTree] =
    useState(null);

  const [programSteps, setProgramSteps] =
    useState([]);

  const [programCurrentStep, setProgramCurrentStep] =
    useState(-1);

  const [programRunning, setProgramRunning] =
    useState(false);

  const [programAutoPlay, setProgramAutoPlay] =
    useState(false);

  const [programCompleted, setProgramCompleted] =
    useState(false);

  /* =========================================================
     QUESTIONS
     ========================================================= */

  const [answers, setAnswers] =
    useState({});

  const [questionResult, setQuestionResult] =
    useState(null);

  const [experimentCompleted, setExperimentCompleted] =
    useState(false);

  /* =========================================================
     CURRENT STEPS
     ========================================================= */

  const currentSimulationStep =
    currentStep >= 0
      ? steps[currentStep]
      : null;

  const currentProgramStep =
    programCurrentStep >= 0
      ? programSteps[
          programCurrentStep
        ]
      : null;

  const simulationTree =
    currentSimulationStep?.tree ??
    tree;

  const programTreeDisplay =
    currentProgramStep?.tree ??
    programTree;

  /* =========================================================
     SIMULATION
     ========================================================= */

  const resetSimulation = () => {
    setSteps([]);
    setCurrentStep(-1);
  };

  const startSimulation = () => {
    if (!inputValue.trim()) {
      alert(
        "Enter values like 50, 30, 70, 20, 40."
      );
      return;
    }

    const generated =
      makeTraversalSteps(
        traversalType,
        inputValue,
        tree
      );

    setSteps(generated);
    setCurrentStep(0);
  };

  const nextSimulation = () => {
    if (!steps.length) return;

    setCurrentStep(
      (previous) => {
        if (
          previous >=
          steps.length - 1
        ) {
          return previous;
        }

        const next =
          previous + 1;

        const step =
          steps[next];

        if (
          next ===
            steps.length - 1 &&
          step.type ===
            "success"
        ) {
          setTree(
            cloneTree(
              step.tree
            )
          );

          setObservations(
            (old) => [
              ...old,
              {
                attempt:
                  old.length + 1,
                traversal:
                  traversalType,
                input:
                  inputValue,
                output:
                  step.output.join(
                    " → "
                  ),
                status:
                  "Successful"
              }
            ]
          );
        }

        return next;
      }
    );
  };

  const previousSimulation = () => {
    setCurrentStep(
      (previous) =>
        Math.max(
          0,
          previous - 1
        )
    );
  };

  /* =========================================================
     PROGRAM
     ========================================================= */

  const runProgram = () => {
    if (!programValue.trim()) {
      alert(
        "Enter values like 50, 30, 70, 20, 40."
      );
      return;
    }

    const generated =
      makeTraversalSteps(
        programTraversal,
        programValue,
        programTree
      );

    setProgramSteps(
      generated
    );

    setProgramCurrentStep(
      0
    );

    setProgramRunning(
      true
    );

    setProgramAutoPlay(
      false
    );

    setProgramCompleted(
      false
    );
  };

  const nextProgram = () => {
    if (!programSteps.length)
      return;

    setProgramCurrentStep(
      (previous) => {
        if (
          previous >=
          programSteps.length - 1
        ) {
          return previous;
        }

        const next =
          previous + 1;

        const step =
          programSteps[next];

        if (
          next ===
          programSteps.length - 1
        ) {
          setProgramRunning(
            false
          );

          setProgramAutoPlay(
            false
          );

          if (
            step.type ===
            "success"
          ) {
            setProgramTree(
              cloneTree(
                step.tree
              )
            );

            setProgramCompleted(
              true
            );
          }
        }

        return next;
      }
    );
  };

  const previousProgram = () => {
    setProgramCurrentStep(
      (previous) =>
        Math.max(
          0,
          previous - 1
        )
    );

    setProgramCompleted(
      false
    );
  };

  useEffect(() => {
    if (
      !programAutoPlay ||
      !programRunning
    ) {
      return;
    }

    const timer =
      setTimeout(
        nextProgram,
        900
      );

    return () =>
      clearTimeout(timer);
  }, [
    programAutoPlay,
    programRunning,
    programCurrentStep,
    programSteps
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

    if (Object.keys(nextAnswers).length === QUESTIONS.length) {
      const score = QUESTIONS.reduce(
        (total, question, index) =>
          total + (nextAnswers[index] === question.answer ? 1 : 0),
        0
      );
      setQuestionResult({ score, total: QUESTIONS.length });
    }
  };

  /* =========================================================
     FINAL SUBMIT
     ========================================================= */

  const submitExperiment = () => {
    if (!observations.length) {
      alert(
        "Please complete the Simulation first."
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

    const result = buildDstResult({
      experimentNo: 10,
      experimentName:
        "Binary Search Tree Traversal: Inorder, Preorder and Postorder",
      questionList: QUESTIONS,
      selectedAnswers: answers,
      observations,
      questionResult,
    });

    setExperimentCompleted(
      true
    );

    localStorage.setItem(
      "DSTExperiment10Result",
      JSON.stringify(result)
    );
    localStorage.setItem("assignmentResult", JSON.stringify(result));

    navigate(
      "/result",
      {
        state: result
      }
    );
  };

  /* =========================================================
     C PROGRAM
     ========================================================= */

  const cProgram = `#include <stdio.h>
#include <stdlib.h>

struct Node
{
    int data;
    struct Node *left;
    struct Node *right;
};

struct Node* createNode(int value)
{
    struct Node *newNode;

    newNode =
        (struct Node*)malloc(
            sizeof(struct Node)
        );

    newNode->data = value;
    newNode->left = NULL;
    newNode->right = NULL;

    return newNode;
}

struct Node* insert(
    struct Node *root,
    int value
)
{
    if (root == NULL)
        return createNode(value);

    if (value < root->data)
        root->left =
            insert(
                root->left,
                value
            );

    else if (value > root->data)
        root->right =
            insert(
                root->right,
                value
            );

    return root;
}

void inorder(
    struct Node *root
)
{
    if (root != NULL)
    {
        inorder(root->left);

        printf("%d ", root->data);

        inorder(root->right);
    }
}

void preorder(
    struct Node *root
)
{
    if (root != NULL)
    {
        printf("%d ", root->data);

        preorder(root->left);

        preorder(root->right);
    }
}

void postorder(
    struct Node *root
)
{
    if (root != NULL)
    {
        postorder(root->left);

        postorder(root->right);

        printf("%d ", root->data);
    }
}

int main()
{
    struct Node *root = NULL;
    int n, value, i;

    printf("Enter number of nodes: ");
    scanf("%d", &n);

    printf("Enter node values:\\n");

    for (i = 0; i < n; i++)
    {
        scanf("%d", &value);

        root =
            insert(
                root,
                value
            );
    }

    printf("\\nInorder Traversal: ");
    inorder(root);

    printf("\\nPreorder Traversal: ");
    preorder(root);

    printf("\\nPostorder Traversal: ");
    postorder(root);

    return 0;
}`;

  return (
    <div className="dst10-root">

      <div className="dst10-container">

        {/* HEADER */}

        <header className="dst10-header">

          <button
            className="dst10-back"
            onClick={() => navigate("/dst-experiments")}
          >
            ← Back
          </button>

          <div className="dst10-header-title">

            <div className="dst10-exp-no">
              Experiment No. 10
            </div>

            <h1>
              Binary Search Tree Traversal
              (Inorder, Preorder and Postorder)
            </h1>

          </div>

          <button
            className="dst10-help"
            onClick={() => setShowHelp(true)}
          >
            ? Help
          </button>

        </header>

        {showHelp && (
          <div className="dst10-help-overlay" onClick={() => setShowHelp(false)}>
            <section
              aria-labelledby="dst10-help-title"
              aria-modal="true"
              className="dst10-help-dialog"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dst10-help-dialog-header">
                <h2 id="dst10-help-title">Experiment Help</h2>
                <button
                  aria-label="Close help"
                  className="dst10-help-close"
                  onClick={() => setShowHelp(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <ul>
                <li>Create a BST by entering values, then choose a traversal.</li>
                <li>Step through the simulation to see the order in which nodes are visited.</li>
                <li>Use the Program tab to follow the C traversal code.</li>
                <li>Answer all 20 questions and submit them before submitting the experiment.</li>
              </ul>
              <button className="dst10-help-done" onClick={() => setShowHelp(false)} type="button">
                Got it
              </button>
            </section>
          </div>
        )}

        {/* AIM */}

        <div className="dst10-card dst10-aim">

          <div className="dst10-title">
            Aim
          </div>

          <p>
            To write a C program to traverse a
            Binary Search Tree using Inorder,
            Preorder and Postorder traversal.
          </p>

        </div>

        {/* THEORY */}

        <div className="dst10-card dst10-collapse">

          <button
            className="dst10-collapse-header"
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

            <div className="dst10-collapse-content">

              <p>
                A Binary Search Tree (BST) is a
                binary tree in which values smaller
                than a node are stored in its left
                subtree and values greater than the
                node are stored in its right subtree.
              </p>

              <p>
                Tree traversal is the process of
                visiting every node of a tree exactly
                once. The three important depth-first
                traversal methods are Inorder,
                Preorder and Postorder.
              </p>

              <div className="dst10-theory-grid">

                <div>
                  <b>Inorder</b>
                  <span>
                    Left → Root → Right
                  </span>
                </div>

                <div>
                  <b>Preorder</b>
                  <span>
                    Root → Left → Right
                  </span>
                </div>

                <div>
                  <b>Postorder</b>
                  <span>
                    Left → Right → Root
                  </span>
                </div>

                <div>
                  <b>BST</b>
                  <span>
                    Left values are smaller
                  </span>
                </div>

              </div>

            </div>

          )}

        </div>

        {/* PROCEDURE */}

        <div className="dst10-card dst10-collapse">

          <button
            className="dst10-collapse-header"
            onClick={() =>
              setShowProcedure(
                !showProcedure
              )
            }
          >
            <span>Procedure</span>

            <span>
              {showProcedure
                ? "▲"
                : "▼"}
            </span>
          </button>

          {showProcedure && (

            <div className="dst10-collapse-content">

              <div className="dst10-procedure">

                <ol>

                  <li>
                    Enter integer values for
                    constructing the BST.
                  </li>

                  <li>
                    Insert the first value as
                    the root node.
                  </li>

                  <li>
                    Compare each new value with
                    the current node.
                  </li>

                  <li>
                    Place smaller values on the
                    left and larger values on
                    the right.
                  </li>

                </ol>

                <ol start="5">

                  <li>
                    Select Inorder, Preorder or
                    Postorder traversal.
                  </li>

                  <li>
                    Start traversal from the
                    root node.
                  </li>

                  <li>
                    Visit each node according
                    to the selected traversal.
                  </li>

                  <li>
                    Display the final traversal
                    sequence.
                  </li>

                </ol>

              </div>

            </div>

          )}

        </div>

        {/* TABS */}

        <div className="dst10-tabs">

          <button
            className={
              activeTab === "simulation"
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
              activeTab === "program"
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
              activeTab === "questions"
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

            <div className="dst10-sim-row">

              {/* INPUT */}

              <div className="dst10-card dst10-input">

                <div className="dst10-section">
                  Input
                </div>

                <label>
                  Traversal
                </label>

                <select
                  value={traversalType}
                  onChange={(e) => {
                    setTraversalType(
                      e.target.value
                    );
                    resetSimulation();
                  }}
                >
                  <option>
                    Inorder
                  </option>

                  <option>
                    Preorder
                  </option>

                  <option>
                    Postorder
                  </option>
                </select>

                <label>
                  BST Values
                </label>

                <input
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(
                      e.target.value
                    );
                    resetSimulation();
                  }}
                  placeholder="50, 30, 70, 20, 40"
                />

                <div className="dst10-example">

                  <b>Example</b>

                  <span>
                    50, 30, 70, 20, 40, 60, 80
                  </span>

                </div>

                <div className="dst10-info">

                  <b>
                    Traversal Rule
                  </b>

                  <span>
                    {traversalType ===
                    "Inorder"
                      ? "Left → Root → Right"
                      : traversalType ===
                        "Preorder"
                      ? "Root → Left → Right"
                      : "Left → Right → Root"}
                  </span>

                </div>

                <button
                  className="dst10-primary"
                  onClick={
                    startSimulation
                  }
                >
                  ▶ Start Simulation
                </button>

                <button
                  className="dst10-secondary"
                  onClick={() => {
                    setTree(null);
                    setSteps([]);
                    setCurrentStep(-1);
                    setInputValue("");
                  }}
                >
                  ↻ Reset
                </button>

              </div>

              {/* CANVAS */}

              <div className="dst10-card dst10-canvas">

                <div className="dst10-panel-heading">

                  <span>
                    Binary Search Tree
                  </span>

                  <small>
                    {currentSimulationStep
                      ? currentSimulationStep.title
                      : "READY"}
                  </small>

                </div>

                <div className="dst10-tree-stage">

                  <TreeVisualizer
                    tree={
                      simulationTree
                    }
                    active={
                      currentSimulationStep?.active
                    }
                    visited={
                      currentSimulationStep?.visited ||
                      []
                    }
                  />

                </div>

                <div
                  className={`dst10-message ${
                    currentSimulationStep?.type ||
                    ""
                  }`}
                >

                  <b>
                    {currentSimulationStep
                      ?.title ||
                      "READY"}
                  </b>

                  <span>
                    {currentSimulationStep
                      ?.message ||
                      "Enter BST values and start the traversal simulation."}
                  </span>

                </div>

                <div className="dst10-controls">

                  <button
                    className="dst10-secondary"
                    onClick={
                      previousSimulation
                    }
                    disabled={
                      currentStep <= 0
                    }
                  >
                    ← Previous
                  </button>

                  <span>
                    Step{" "}
                    {currentStep >= 0
                      ? currentStep + 1
                      : 0}
                    {" / "}
                    {steps.length}
                  </span>

                  <button
                    className="dst10-primary"
                    onClick={
                      nextSimulation
                    }
                    disabled={
                      !steps.length ||
                      currentStep >=
                        steps.length - 1
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

              {/* ANALYSIS */}

              <div className="dst10-card dst10-analysis">

                <div className="dst10-section">
                  Analysis
                </div>

                <div className="dst10-analysis-box">

                  <span>
                    Traversal
                  </span>

                  <b>
                    {traversalType}
                  </b>

                </div>

                <div className="dst10-analysis-box">

                  <span>
                    Current Node
                  </span>

                  <b>
                    {currentSimulationStep
                      ?.active ??
                      "—"}
                  </b>

                </div>

                <div className="dst10-analysis-box">

                  <span>
                    Visited
                  </span>

                  <b>
                    {currentSimulationStep
                      ?.output?.join(
                        " → "
                      ) ||
                      "—"}
                  </b>

                </div>

                <div className="dst10-observations">

                  <div>

                    <b>
                      Attempts
                    </b>

                    <span>
                      {observations.length}
                    </span>

                  </div>

                  <div>

                    <b>
                      Status
                    </b>

                    <span>
                      {observations.length
                        ? "Completed"
                        : "Not Started"}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* OBSERVATION TABLE */}

            <div className="dst10-card dst10-observation-table-card">

              <div className="dst10-section">
                Observation
              </div>

              <div className="dst10-observation-table-wrapper">

                <table className="dst10-observation-table">

                  <thead>
                    <tr>
                      <th>Attempt</th>
                      <th>Traversal</th>
                      <th>Input</th>
                      <th>Output</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {observations.length === 0 ? (

                      <tr>
                        <td colSpan="5">
                          No observations yet.
                        </td>
                      </tr>

                    ) : (

                      observations.map(
                        (item, index) => (

                          <tr key={index}>

                            <td>
                              {item.attempt}
                            </td>

                            <td>
                              {item.traversal}
                            </td>

                            <td className="dst10-value-cell">
                              {item.input}
                            </td>

                            <td className="dst10-value-cell">
                              {item.output}
                            </td>

                            <td>
                              <span className="dst10-status-success">
                                ✓ {item.status}
                              </span>
                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </>

        )}

        {/* =================================================
            PROGRAM
            ================================================= */}

        {activeTab === "program" && (

          <div className="dst10-program-area">

            <div className="dst10-program-grid">

              {/* LEFT */}

              <div className="dst10-program-left">

                <div className="dst10-card dst10-program-input">

                  <div className="dst10-section">
                    Program Input
                  </div>

                  <label>
                    Traversal
                  </label>

                  <select
                    value={programTraversal}
                    onChange={(e) =>
                      setProgramTraversal(
                        e.target.value
                      )
                    }
                  >
                    <option>
                      Inorder
                    </option>

                    <option>
                      Preorder
                    </option>

                    <option>
                      Postorder
                    </option>
                  </select>

                  <label>
                    BST Values
                  </label>

                  <input
                    value={programValue}
                    onChange={(e) =>
                      setProgramValue(
                        e.target.value
                      )
                    }
                    placeholder="50, 30, 70, 20, 40"
                  />

                  <div className="dst10-program-buttons">

                    <button
                      className="dst10-primary"
                      onClick={
                        runProgram
                      }
                    >
                      ▶ Run Program
                    </button>

                  </div>

                </div>

                <div className="dst10-card dst10-code-card">

                  <div className="dst10-code-header">

                    <span>
                      C PROGRAM
                    </span>

                    <span>
                      GCC
                    </span>

                  </div>

                  <pre className="dst10-code">
                    {cProgram}
                  </pre>

                </div>

              </div>

              {/* RIGHT */}

              <div className="dst10-card dst10-program-sim">

                <div className="dst10-panel-heading">

                  <span>
                    Program Execution
                  </span>

                  <small>
                    {currentProgramStep
                      ? currentProgramStep.title
                      : "READY"}
                  </small>

                </div>

                <div className="dst10-live-strip">

                  <div>
                    <span>
                      Traversal
                    </span>

                    <b>
                      {programTraversal}
                    </b>
                  </div>

                  <div>
                    <span>
                      Current Node
                    </span>

                    <b>
                      {currentProgramStep
                        ?.active ??
                        "—"}
                    </b>
                  </div>

                  <div>
                    <span>
                      Visited
                    </span>

                    <b>
                      {currentProgramStep
                        ?.output?.join(
                          " "
                        ) ||
                        "—"}
                    </b>
                  </div>

                </div>

                <div className="dst10-program-tree-stage">

                  <TreeVisualizer
                    tree={
                      programTreeDisplay
                    }
                    active={
                      currentProgramStep?.active
                    }
                    visited={
                      currentProgramStep?.visited ||
                      []
                    }
                  />

                </div>

                <div
                  className={`dst10-message ${
                    currentProgramStep?.type ||
                    ""
                  }`}
                >

                  <b>
                    {currentProgramStep
                      ?.title ||
                      "READY"}
                  </b>

                  <span>
                    {currentProgramStep
                      ?.message ||
                      "Run the program to begin execution."}
                  </span>

                </div>

                <div className="dst10-controls">

                  <button
                    className="dst10-secondary"
                    onClick={
                      previousProgram
                    }
                    disabled={
                      programCurrentStep <=
                      0
                    }
                  >
                    ← Previous
                  </button>

                  <button
                    className="dst10-secondary"
                    onClick={() =>
                      setProgramAutoPlay(
                        (value) =>
                          !value
                      )
                    }
                    disabled={
                      !programRunning ||
                      programCompleted
                    }
                  >
                    {programAutoPlay
                      ? "⏸ Pause"
                      : "▶ Auto Play"}
                  </button>

                  <button
                    className="dst10-primary"
                    onClick={
                      nextProgram
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

            {programSteps.length > 0 && (

              <div className="dst10-card dst10-trace-card">

                <div className="dst10-trace-header">

                  <div>

                    <div className="dst10-section">
                      Execution Trace
                    </div>

                    <p>
                      Each step of BST traversal
                      execution.
                    </p>

                  </div>

                  <span>
                    {programSteps.length} Steps
                  </span>

                </div>

                <div className="dst10-trace-list">

                  {programSteps.map(
                    (
                      step,
                      index
                    ) => (

                      <button
                        key={index}
                        className={`dst10-trace-item ${
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
                                  1 &&
                              step.type ===
                                "success"
                            );

                            if (
                              index <
                              programSteps.length -
                                1
                            ) {
                              setProgramRunning(
                                true
                              );
                            }

                          }

                        }}
                      >

                        <span className="dst10-trace-number">
                          {index + 1}
                        </span>

                        <span className="dst10-trace-content">

                          <b>
                            {step.title}
                          </b>

                          <small>
                            {step.message}
                          </small>

                          <small>
                            Traversal:{" "}
                            {step.output?.join(
                              " "
                            ) || "—"}
                          </small>

                        </span>

                        <span className="dst10-trace-status">
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

                <div className="dst10-card dst10-output-card">

                  <div className="dst10-section">
                    Program Output
                  </div>

                  <pre className="dst10-output">
{`Traversal Program : Binary Search Tree

Input : ${programValue}

Inorder :
${
  currentProgramStep.tree
    ? inorder(
        currentProgramStep.tree
      ).join(" ")
    : "Empty"
}

Preorder :
${
  currentProgramStep.tree
    ? preorder(
        currentProgramStep.tree
      ).join(" ")
    : "Empty"
}

Postorder :
${
  currentProgramStep.tree
    ? postorder(
        currentProgramStep.tree
      ).join(" ")
    : "Empty"
}

Selected Traversal : ${programTraversal}

Selected Output :
${
  currentProgramStep.output
    ? currentProgramStep.output.join(
        " "
      )
    : "Empty"
}

Execution Status : SUCCESS`}
                  </pre>

                </div>

              )}

          </div>

        )}

        {/* =================================================
            QUESTIONS
            ================================================= */}

        {activeTab === "questions" && (

          <div className="dst10-card dst10-questions">

            <div className="dst10-section">
              Questions
            </div>

            {QUESTIONS.map(
              (
                question,
                index
              ) => (

                <div
                  className="dst10-question"
                  key={index}
                >

                  <b>
                    {index + 1}.{" "}
                    {question.q}
                  </b>

                  <div className="dst10-options">

                    {question.options.map(
                      (
                        option,
                        optionIndex
                      ) => (

                        <label
                          key={
                            optionIndex
                          }
                          className={
                            answers[index] ===
                            optionIndex
                              ? "selected"
                              : ""
                          }
                        >

                          <input
                            type="radio"
                            name={`q-${index}`}
                            checked={
                              answers[index] ===
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

                          {option}

                        </label>

                      )
                    )}

                  </div>

                </div>

              )
            )}

            {experimentCompleted && questionResult && (

              <div className="dst10-question-result">

                <b>
                  Quiz Completed
                  <br />
                  Score:{" "}
                  {questionResult.score}/
                  {questionResult.total}
                </b>

                <span>
                  ✓ Completed
                </span>

              </div>

            )}

          </div>

        )}

        {/* FINAL SUBMIT */}

        <div className="dst10-submit-section">

          <button
            className="dst10-submit"
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

export default DSTExperiment10;