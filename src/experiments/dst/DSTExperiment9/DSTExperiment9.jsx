import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment9.css";

/* =========================================================
   QUESTIONS
   ========================================================= */

const QUESTIONS = [
  {
    q: "A binary tree node can have maximum how many children?",
    options: ["1", "2", "3", "4"],
    answer: 1
  },
  {
    q: "The topmost node of a tree is called:",
    options: ["Leaf", "Root", "Child", "Sibling"],
    answer: 1
  },
  {
    q: "A node with no children is called:",
    options: ["Root", "Parent", "Leaf", "Sibling"],
    answer: 2
  },
  {
    q: "In a Binary Search Tree, smaller values are placed on:",
    options: ["Right", "Left", "Root only", "Any position"],
    answer: 1
  },
  {
    q: "A binary tree node normally contains:",
    options: [
      "Only data",
      "Data and two child pointers",
      "Only pointers",
      "Only address"
    ],
    answer: 1
  },
  {
    q: "Which case occurs when a deleted node has two children?",
    options: [
      "Direct removal",
      "Use inorder successor",
      "Ignore deletion",
      "Delete root"
    ],
    answer: 1
  },
  {
    q: "Which traversal is Left, Root, Right?",
    options: [
      "Preorder",
      "Postorder",
      "Inorder",
      "Level order"
    ],
    answer: 2
  },
  {
    q: "Inorder traversal of a BST gives:",
    options: [
      "Sorted order",
      "Random order",
      "Insertion order",
      "Reverse order"
    ],
    answer: 0
  },
  {
    q: "A node with exactly one child has:",
    options: [
      "No child",
      "One child",
      "Two children",
      "Three children"
    ],
    answer: 1
  },
  {
    q: "Which function allocates memory for a node in C?",
    options: [
      "printf()",
      "scanf()",
      "malloc()",
      "strlen()"
    ],
    answer: 2
  },
  {
    q: "In a binary search tree, values smaller than a node are placed in which subtree?",
    options: ["Left subtree", "Right subtree", "Parent only", "Either subtree"],
    answer: 0
  },
  {
    q: "In a binary search tree, values greater than a node are placed in which subtree?",
    options: ["Left subtree", "Right subtree", "Root only", "Nowhere"],
    answer: 1
  },
  {
    q: "How is a leaf node with no children removed from a binary tree?",
    options: ["Remove it and clear its parent's link", "Replace it with two nodes", "Move it to the root", "Sort the tree first"],
    answer: 0
  },
  {
    q: "When deleting a node with one child, what should its parent link to?",
    options: ["The deleted node's child", "A new root every time", "A null pointer in all cases", "The deleted node's sibling"],
    answer: 0
  },
  {
    q: "What must be updated when the root node is deleted?",
    options: ["The root pointer", "The array length", "The traversal order only", "The compiler settings"],
    answer: 0
  },
  {
    q: "What does the height of a tree describe?",
    options: ["The longest path from the root to a leaf", "The number of values in the root", "The number of pointer types", "The width of each node"],
    answer: 0
  },
  {
    q: "Which traversal visits the root before its left and right subtrees?",
    options: ["Preorder", "Inorder", "Postorder", "Reverse level order"],
    answer: 0
  },
  {
    q: "Which traversal visits the root after its left and right subtrees?",
    options: ["Preorder", "Inorder", "Postorder", "Level order"],
    answer: 2
  },
  {
    q: "What value commonly represents an empty child link in a C tree node?",
    options: ["NULL", "-1 always", "EOF", "0.5"],
    answer: 0
  },
  {
    q: "When inserting a value into a binary search tree, how is its next position selected?",
    options: ["Compare it with nodes and follow left or right links", "Choose a random pointer", "Always place it as the root", "Append it to an array"],
    answer: 0
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

const findMin = (root) => {
  let current = root;

  while (current?.left) {
    current = current.left;
  }

  return current;
};

const deleteNode = (root, value) => {
  if (!root) return null;

  if (value < root.value) {
    root.left = deleteNode(root.left, value);
  } else if (value > root.value) {
    root.right = deleteNode(root.right, value);
  } else {
    if (!root.left) return root.right;

    if (!root.right) return root.left;

    const successor = findMin(root.right);

    root.value = successor.value;

    root.right = deleteNode(
      root.right,
      successor.value
    );
  }

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

/* =========================================================
   SIMULATION STEP BUILDER
   ========================================================= */

const makeSteps = (
  operation,
  input,
  originalTree
) => {
  const steps = [];
  let tree = cloneTree(originalTree);

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
      type
    });
  };

  /* ================= CREATE TREE ================= */

  if (operation === "Create Tree") {
    const values = parseValues(input);

    if (!values) {
      return [
        {
          title: "INVALID INPUT",
          message:
            "Enter integer values separated by commas or spaces.",
          tree: null,
          active: null,
          type: "error"
        }
      ];
    }

    tree = null;

    add(
      "START",
      "Tree is empty. Nodes will be inserted one by one."
    );

    values.forEach((value) => {
      if (!tree) {
        tree = {
          value,
          left: null,
          right: null
        };

        add(
          "CREATE ROOT",
          `${value} becomes the root node.`,
          value
        );

        return;
      }

      let current = tree;

      add(
        "COMPARE",
        `Start from root ${current.value}.`,
        current.value
      );

      while (true) {
        if (value === current.value) {
          add(
            "DUPLICATE",
            `Node ${value} already exists.`,
            value,
            "error"
          );
          break;
        }

        if (value < current.value) {
          add(
            "MOVE LEFT",
            `${value} < ${current.value}. Move to left subtree.`,
            current.value
          );

          if (!current.left) {
            current.left = {
              value,
              left: null,
              right: null
            };

            add(
              "INSERT",
              `${value} inserted as left child of ${current.value}.`,
              value
            );

            break;
          }

          current = current.left;
        } else {
          add(
            "MOVE RIGHT",
            `${value} > ${current.value}. Move to right subtree.`,
            current.value
          );

          if (!current.right) {
            current.right = {
              value,
              left: null,
              right: null
            };

            add(
              "INSERT",
              `${value} inserted as right child of ${current.value}.`,
              value
            );

            break;
          }

          current = current.right;
        }
      }
    });

    add(
      "RESULT",
      `Tree created successfully with ${inorder(tree).length} node(s).`,
      null,
      "success"
    );

    return steps;
  }

  /* ================= INSERT NODE ================= */

  if (operation === "Insert Node") {
    const value = Number(input);

    if (!Number.isInteger(value)) {
      return [
        {
          title: "INVALID INPUT",
          message: "Enter one valid integer value.",
          tree,
          active: null,
          type: "error"
        }
      ];
    }

    if (!tree) {
      tree = {
        value,
        left: null,
        right: null
      };

      add(
        "CREATE ROOT",
        `${value} becomes the root node.`,
        value
      );
    } else {
      let current = tree;

      add(
        "START",
        `Start searching from root ${current.value}.`,
        current.value
      );

      while (true) {
        if (value === current.value) {
          add(
            "DUPLICATE",
            `Node ${value} already exists.`,
            value,
            "error"
          );

          return steps;
        }

        if (value < current.value) {
          add(
            "MOVE LEFT",
            `${value} < ${current.value}. Move left.`,
            current.value
          );

          if (!current.left) {
            current.left = {
              value,
              left: null,
              right: null
            };

            add(
              "INSERT",
              `${value} inserted as left child of ${current.value}.`,
              value
            );

            break;
          }

          current = current.left;
        } else {
          add(
            "MOVE RIGHT",
            `${value} > ${current.value}. Move right.`,
            current.value
          );

          if (!current.right) {
            current.right = {
              value,
              left: null,
              right: null
            };

            add(
              "INSERT",
              `${value} inserted as right child of ${current.value}.`,
              value
            );

            break;
          }

          current = current.right;
        }
      }
    }

    add(
      "RESULT",
      `Node ${value} created successfully.`,
      value,
      "success"
    );

    return steps;
  }

  /* ================= DELETE NODE ================= */

  if (operation === "Delete Node") {
    const value = Number(input);

    if (!Number.isInteger(value)) {
      return [
        {
          title: "INVALID INPUT",
          message: "Enter one valid integer value.",
          tree,
          active: null,
          type: "error"
        }
      ];
    }

    if (!tree) {
      return [
        {
          title: "EMPTY TREE",
          message:
            "Tree is empty. No node can be deleted.",
          tree: null,
          active: null,
          type: "error"
        }
      ];
    }

    let current = tree;

    add(
      "START DELETE",
      `Search for node ${value}.`,
      current.value
    );

    while (
      current &&
      current.value !== value
    ) {
      if (value < current.value) {
        add(
          "MOVE LEFT",
          `${value} < ${current.value}. Move left.`,
          current.value
        );

        current = current.left;
      } else {
        add(
          "MOVE RIGHT",
          `${value} > ${current.value}. Move right.`,
          current.value
        );

        current = current.right;
      }
    }

    if (!current) {
      add(
        "NOT FOUND",
        `Node ${value} does not exist in the tree.`,
        null,
        "error"
      );

      return steps;
    }

    add(
      "NODE FOUND",
      `Node ${value} found. Checking its children.`,
      value
    );

    if (
      !current.left &&
      !current.right
    ) {
      add(
        "CASE 1",
        "Leaf node: remove it directly.",
        value
      );
    } else if (
      !current.left ||
      !current.right
    ) {
      add(
        "CASE 2",
        "Node has one child. Its child replaces it.",
        value
      );
    } else {
      const successor =
        findMin(current.right);

      add(
        "CASE 3",
        `Node has two children. Inorder successor is ${successor.value}.`,
        successor.value
      );
    }

    tree = deleteNode(
      tree,
      value
    );

    add(
      "RESULT",
      `Node ${value} deleted successfully.`,
      null,
      "success"
    );

    return steps;
  }

  /* ================= DISPLAY ================= */

  if (operation === "Display Tree") {
    if (!tree) {
      add(
        "EMPTY",
        "Tree is empty.",
        null,
        "error"
      );
    } else {
      add(
        "DISPLAY",
        "Current tree is displayed successfully.",
        null,
        "success"
      );
    }

    return steps;
  }

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
  active
}) => {
  const layout = useMemo(
    () => getTreeLayout(tree),
    [tree]
  );

  if (!tree) {
    return (
      <div className="dst9-empty-tree">
        <div className="dst9-empty-circle">
          TREE
        </div>

        <b>Binary Tree Empty</b>

        <span>
          Enter values and start
          the simulation.
        </span>
      </div>
    );
  }

  return (
    <div className="dst9-tree-scroll">
      <svg
        className="dst9-tree-svg"
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
      >
        {layout.edges.map(
          (edge, index) => (
            <line
              key={index}
              className="dst9-tree-edge"
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
            />
          )
        )}

        {layout.nodes.map(
          (node, index) => (
            <g
              key={`${node.value}-${index}`}
              className={
                active === node.value
                  ? "dst9-svg-node active"
                  : "dst9-svg-node"
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
                className="dst9-node-label"
              >
                NODE
              </text>

              <text
                x={node.x}
                y={node.y + 15}
                className="dst9-node-value"
              >
                {node.value}
              </text>
            </g>
          )
        )}
      </svg>
    </div>
  );
};

/* =========================================================
   COMPONENT
   ========================================================= */

const DSTExperiment9 = () => {
  const navigate = useNavigate();

  /* TABS */

  const [activeTab, setActiveTab] =
    useState("simulation");
  const [showHelp, setShowHelp] = useState(false);

  /* COLLAPSIBLE */

  const [showTheory, setShowTheory] =
    useState(false);

  const [showProcedure, setShowProcedure] =
    useState(false);

  /* =========================================================
     SIMULATION STATE
     ========================================================= */

  const [operation, setOperation] =
    useState("Create Tree");

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

  const [programOperation, setProgramOperation] =
    useState("Create Tree");

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

  const startSimulation = () => {
    if (!inputValue.trim()) {
      alert(
        operation === "Create Tree"
          ? "Enter values like 50, 30, 70, 20, 40."
          : "Enter a node value."
      );

      return;
    }

    const generated =
      makeSteps(
        operation,
        inputValue,
        tree
      );

    setSteps(generated);
    setCurrentStep(0);
  };

  const resetSimulation = () => {
    setSteps([]);
    setCurrentStep(-1);
  };

  const nextSimulation = () => {
    if (!steps.length) return;

    setCurrentStep((previous) => {
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
              operation,
              input:
                inputValue,
              tree: inorder(
                step.tree
              ).join(" → "),
              status:
                "Successful"
            }
          ]
        );
      }

      return next;
    });
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
        programOperation ===
          "Create Tree"
          ? "Enter values like 50, 30, 70, 20, 40."
          : "Enter a node value."
      );

      return;
    }

    const generated =
      makeSteps(
        programOperation,
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
          programSteps.length -
            1
        ) {
          return previous;
        }

        const next =
          previous + 1;

        const step =
          programSteps[next];

        if (
          next ===
          programSteps.length -
            1
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

    setAnswers(
      (old) => ({
        ...old,
        [questionIndex]:
          optionIndex
      })
    );
  };

  const submitQuestions = () => {
    if (
      Object.keys(answers)
        .length !==
      QUESTIONS.length
    ) {
      alert(
        "Please answer all questions."
      );

      return;
    }

    const score =
      QUESTIONS.reduce(
        (
          total,
          question,
          index
        ) =>
          total +
          (answers[index] ===
          question.answer
            ? 1
            : 0),
        0
      );

    setQuestionResult({
      score,
      total:
        QUESTIONS.length
    });
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
        "Please submit Questions first."
      );

      return;
    }

    const result = buildDstResult({
      experimentNo: 9,
      experimentName:
        "Binary Tree: Creating and Deleting a Node",
      questionList: QUESTIONS,
      selectedAnswers: answers,
      observations,
      questionResult,
    });

    setExperimentCompleted(true);

    localStorage.setItem(
      "DSTExperiment9Result",
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
    struct Node *newNode =
        (struct Node*)malloc(sizeof(struct Node));

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
            insert(root->left, value);

    else if (value > root->data)
        root->right =
            insert(root->right, value);

    return root;
}

struct Node* findMin(
    struct Node *root
)
{
    while (root->left != NULL)
        root = root->left;

    return root;
}

struct Node* deleteNode(
    struct Node *root,
    int value
)
{
    struct Node *temp;

    if (root == NULL)
        return NULL;

    if (value < root->data)
        root->left =
            deleteNode(
                root->left,
                value
            );

    else if (value > root->data)
        root->right =
            deleteNode(
                root->right,
                value
            );

    else
    {
        if (root->left == NULL)
        {
            temp = root->right;
            free(root);
            return temp;
        }

        if (root->right == NULL)
        {
            temp = root->left;
            free(root);
            return temp;
        }

        temp =
            findMin(root->right);

        root->data = temp->data;

        root->right =
            deleteNode(
                root->right,
                temp->data
            );
    }

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

int main()
{
    struct Node *root = NULL;
    int choice, value;

    do
    {
        printf("\\n1. Create / Insert Node");
        printf("\\n2. Delete Node");
        printf("\\n3. Display Inorder");
        printf("\\n4. Exit");

        printf("\\nEnter choice: ");
        scanf("%d", &choice);

        switch(choice)
        {
            case 1:
                printf("Enter value: ");
                scanf("%d", &value);

                root =
                    insert(
                        root,
                        value
                    );
                break;

            case 2:
                printf("Enter value: ");
                scanf("%d", &value);

                root =
                    deleteNode(
                        root,
                        value
                    );
                break;

            case 3:
                printf("Inorder: ");
                inorder(root);
                break;
        }

    } while(choice != 4);

    return 0;
}`;

  return (
    <div className="dst9-root">

      <div className="dst9-container">

        {/* =================================================
            HEADER
            ================================================= */}

        <header className="dst9-header">


    <button
            className="dst9-back"
            onClick={() => navigate("/dst-experiments")}
          >
            ← Back
          </button>
          <div className="dst9-header-title">

            <div className="dst9-exp-no">
              Experiment No. 9
            </div>

            <h1>
              Binary Tree - Creating and Deleting a Node
            </h1>

          </div>

          <button
            className="dst9-help"
            onClick={() => setShowHelp(true)}
          >
            ? Help
          </button>

        </header>

        {showHelp && (
          <div
            className="dst9-help-overlay"
            onClick={() => setShowHelp(false)}
          >
            <section
              aria-labelledby="dst9-help-title"
              aria-modal="true"
              className="dst9-help-dialog"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dst9-help-dialog-header">
                <h2 id="dst9-help-title">Experiment Help</h2>
                <button
                  aria-label="Close help"
                  className="dst9-help-close"
                  onClick={() => setShowHelp(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <ul>
                <li>Use Simulation to create, insert, delete, and display binary tree nodes.</li>
                <li>Use Program to follow the corresponding C operations step by step.</li>
                <li>In a binary search tree, smaller values go left and larger values go right.</li>
                <li>Answer all questions, then select Submit Experiment to view your score.</li>
              </ul>
              <button
                className="dst9-help-done"
                onClick={() => setShowHelp(false)}
                type="button"
              >
                Got it
              </button>
            </section>
          </div>
        )}

        {/* =================================================
            AIM
            ================================================= */}

        <div className="dst9-card dst9-aim">

          <div>

            <div className="dst9-title">
              Aim
            </div>

            <p>
              To write a C program to create a
              binary tree and perform insertion,
              deletion and display operations.
            </p>

          </div>

        </div>

        {/* =================================================
            THEORY
            ================================================= */}

        <div className="dst9-card dst9-collapse">

          <button
            className="dst9-collapse-header"
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

            <div className="dst9-collapse-content">

              <p>
                A binary tree is a hierarchical
                data structure in which every node
                can have at most two children:
                a left child and a right child.
              </p>

              <p>
                In a Binary Search Tree (BST),
                values smaller than the root are
                placed in the left subtree and
                values greater than the root are
                placed in the right subtree.
              </p>

              <div className="dst9-theory-grid">

                <div>
                  <b>Root</b>
                  <span>
                    Topmost node of the tree
                  </span>
                </div>

                <div>
                  <b>Left Subtree</b>
                  <span>
                    Contains smaller values
                  </span>
                </div>

                <div>
                  <b>Right Subtree</b>
                  <span>
                    Contains larger values
                  </span>
                </div>

                <div>
                  <b>Leaf</b>
                  <span>
                    Node having no children
                  </span>
                </div>

              </div>

            </div>

          )}

        </div>

        {/* =================================================
            PROCEDURE
            ================================================= */}

        <div className="dst9-card dst9-collapse">

          <button
            className="dst9-collapse-header"
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

            <div className="dst9-collapse-content">

              <div className="dst9-procedure">

                <ol>

                  <li>
                    Enter integer values for
                    creating the binary tree.
                  </li>

                  <li>
                    Insert the first value as
                    the root node.
                  </li>

                  <li>
                    Compare every new value
                    with the current node.
                  </li>

                  <li>
                    Move left for smaller values
                    and right for larger values.
                  </li>

                </ol>

                <ol start="5">

                  <li>
                    Select a node for deletion.
                  </li>

                  <li>
                    For a leaf node, remove it
                    directly.
                  </li>

                  <li>
                    For two children, replace
                    the node using inorder
                    successor.
                  </li>

                  <li>
                    Display the resulting tree
                    and its traversals.
                  </li>

                </ol>

              </div>

            </div>

          )}

        </div>

        {/* =================================================
            TABS
            ================================================= */}

        <div className="dst9-tabs">

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
            SIMULATION TAB
            ================================================= */}

        {activeTab ===
          "simulation" && (

          <>

            <div className="dst9-sim-row">

              {/* INPUT */}

              <div className="dst9-card dst9-input">

                <div className="dst9-section">
                  Input
                </div>

                <label>
                  Operation
                </label>

                <select
                  value={operation}
                  onChange={(e) => {
                    setOperation(
                      e.target.value
                    );
                    resetSimulation();
                  }}
                >
                  <option>
                    Create Tree
                  </option>

                  <option>
                    Insert Node
                  </option>

                  <option>
                    Delete Node
                  </option>

                  <option>
                    Display Tree
                  </option>
                </select>

                <label>
                  {operation ===
                  "Create Tree"
                    ? "Tree Values"
                    : "Node Value"}
                </label>

                <input
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(
                      e.target.value
                    );
                    resetSimulation();
                  }}
                  placeholder={
                    operation ===
                    "Create Tree"
                      ? "50, 30, 70, 20, 40"
                      : "Enter value"
                  }
                />

                <div className="dst9-example">

                  <b>Example</b>

                  <span>
                    {operation ===
                    "Create Tree"
                      ? "50, 30, 70, 20, 40"
                      : operation ===
                        "Insert Node"
                      ? "60"
                      : "30"}
                  </span>

                </div>

                <button
                  className="dst9-primary"
                  onClick={
                    startSimulation
                  }
                >
                  ▶ Start Simulation
                </button>

                <button
                  className="dst9-secondary"
                  onClick={
                    resetSimulation
                  }
                >
                  Reset
                </button>

                <div className="dst9-info">

                  <b>Allowed</b>

                  <span>
                    Integer values separated
                    by commas or spaces.
                  </span>

                </div>

              </div>

              {/* CANVAS */}

              <div className="dst9-card dst9-canvas">

                <div className="dst9-panel-heading">

                  <span>
                    Binary Tree Simulation
                  </span>

                  <small>
                    {currentSimulationStep
                      ? "RUNNING"
                      : "READY"}
                  </small>

                </div>

                <div className="dst9-tree-stage">

                  <TreeVisualizer
                    tree={
                      simulationTree
                    }
                    active={
                      currentSimulationStep
                        ?.active
                    }
                  />

                </div>

                <div
                  className={`dst9-message ${
                    currentSimulationStep
                      ?.type === "error"
                      ? "error"
                      : ""
                  } ${
                    currentSimulationStep
                      ?.type ===
                    "success"
                      ? "success"
                      : ""
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
                      "Start the simulation to see binary tree operations step-by-step."}
                  </span>

                </div>

                <div className="dst9-controls">

                  <button
                    className="dst9-secondary"
                    onClick={
                      previousSimulation
                    }
                    disabled={
                      currentStep <=
                      0
                    }
                  >
                    ← Previous
                  </button>

                  <span>
                    Step{" "}
                    {steps.length
                      ? currentStep +
                        1
                      : 0}
                    {" / "}
                    {steps.length}
                  </span>

                  <button
                    className="dst9-primary"
                    onClick={
                      nextSimulation
                    }
                    disabled={
                      !steps.length ||
                      currentStep >=
                        steps.length -
                          1
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

              {/* ANALYSIS */}

              <div className="dst9-card dst9-analysis">

                <div className="dst9-section">
                  Analysis
                </div>

                <div className="dst9-analysis-box">

                  <span>
                    Total Nodes
                  </span>

                  <b>
                    {simulationTree
                      ? inorder(
                          simulationTree
                        ).length
                      : 0}
                  </b>

                </div>

                <div className="dst9-analysis-box">

                  <span>
                    Root
                  </span>

                  <b>
                    {simulationTree
                      ?.value || "—"}
                  </b>

                </div>

                <div className="dst9-analysis-box">

                  <span>
                    Inorder
                  </span>

                  <b>
                    {simulationTree
                      ? inorder(
                          simulationTree
                        ).join(" ")
                      : "—"}
                  </b>

                </div>

                <div className="dst9-analysis-box">

                  <span>
                    Preorder
                  </span>

                  <b>
                    {simulationTree
                      ? preorder(
                          simulationTree
                        ).join(" ")
                      : "—"}
                  </b>

                </div>

                <div className="dst9-analysis-box">

                  <span>
                    Postorder
                  </span>

                  <b>
                    {simulationTree
                      ? postorder(
                          simulationTree
                        ).join(" ")
                      : "—"}
                  </b>

                </div>

                <div className="dst9-analysis-box">

                  <span>
                    Attempts
                  </span>

                  <b>
                    {observations.length}
                  </b>

                </div>

                <div className="dst9-observations">

                  {observations
                    .slice(-4)
                    .map(
                      (item) => (
                        <div
                          key={
                            item.attempt
                          }
                        >
                          <b>
                            #
                            {
                              item.attempt
                            }{" "}
                            {
                              item.operation
                            }
                          </b>

                          <span>
                            {item.tree}
                          </span>
                        </div>
                      )
                    )}

                </div>

              </div>

            </div>

            {/* OBSERVATION TABLE */}

            {observations.length >
              0 && (

              <div className="dst9-card dst9-observation-table-card">

                <div className="dst9-section">
                  Observation Table
                </div>

                <div className="dst9-observation-table-wrapper">

                  <table className="dst9-observation-table">

                    <thead>
                      <tr>
                        <th>
                          Attempt
                        </th>

                        <th>
                          Operation
                        </th>

                        <th>
                          Input
                        </th>

                        <th>
                          Inorder Tree
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

                            <td className="dst9-value-cell">
                              {
                                item.input
                              }
                            </td>

                            <td className="dst9-value-cell">
                              {
                                item.tree
                              }
                            </td>

                            <td>
                              <span className="dst9-status-success">
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
            PROGRAM TAB
            ================================================= */}

        {activeTab ===
          "program" && (

          <div className="dst9-program-area">

            <div className="dst9-program-grid">

              {/* LEFT SIDE */}

              <div className="dst9-program-left">

                {/* C PROGRAM */}

                <div className="dst9-card dst9-code-card">

                  <div className="dst9-section">
                    C Program
                  </div>

                  <div className="dst9-code-header">

                    <span>
                      binary_tree.c
                    </span>

                    <span>
                      READ ONLY
                    </span>

                  </div>

                  <pre className="dst9-code">
{cProgram}
                  </pre>

                </div>

                {/* PROGRAM INPUT */}

                <div className="dst9-card dst9-program-input">

                  <div className="dst9-section">
                    Program Input
                  </div>

                  <label>
                    Operation
                  </label>

                  <select
                    value={
                      programOperation
                    }
                    onChange={(e) => {
                      setProgramOperation(
                        e.target.value
                      );
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
                    }}
                  >
                    <option>
                      Create Tree
                    </option>

                    <option>
                      Insert Node
                    </option>

                    <option>
                      Delete Node
                    </option>

                    <option>
                      Display Tree
                    </option>
                  </select>

                  <label>
                    {programOperation ===
                    "Create Tree"
                      ? "Tree Values"
                      : "Node Value"}
                  </label>

                  <input
                    value={
                      programValue
                    }
                    onChange={(e) => {
                      setProgramValue(
                        e.target.value
                      );
                      setProgramCompleted(
                        false
                      );
                      setProgramRunning(
                        false
                      );
                    }}
                    placeholder={
                      programOperation ===
                      "Create Tree"
                        ? "50, 30, 70, 20, 40"
                        : "Enter value"
                    }
                  />

                  <div className="dst9-program-buttons">

                    <button
                      className="dst9-primary"
                      onClick={
                        runProgram
                      }
                    >
                      ▶ Run Program
                    </button>

                    <button
                      className="dst9-secondary"
                      onClick={() => {
                        setProgramValue(
                          ""
                        );

                        setProgramSteps(
                          []
                        );

                        setProgramCurrentStep(
                          -1
                        );

                        setProgramTree(
                          null
                        );

                        setProgramRunning(
                          false
                        );

                        setProgramCompleted(
                          false
                        );

                        setProgramAutoPlay(
                          false
                        );
                      }}
                    >
                      New Execution
                    </button>

                  </div>

                </div>

              </div>

              {/* RIGHT SIDE */}

              <div className="dst9-card dst9-program-sim">

                <div className="dst9-panel-heading">

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

                <div className="dst9-live-strip">

                  <div>
                    <span>
                      Operation
                    </span>

                    <b>
                      {
                        programOperation
                      }
                    </b>
                  </div>

                  <div>
                    <span>
                      Current Step
                    </span>

                    <b>
                      {
                        currentProgramStep
                          ?.title ||
                        "—"
                      }
                    </b>
                  </div>

                  <div>
                    <span>
                      Step
                    </span>

                    <b>
                      {programSteps.length
                        ? `${
                            programCurrentStep +
                            1
                          } / ${
                            programSteps.length
                          }`
                        : "0 / 0"}
                    </b>
                  </div>

                </div>

                <div className="dst9-program-tree-stage">

                  <TreeVisualizer
                    tree={
                      programTreeDisplay
                    }
                    active={
                      currentProgramStep
                        ?.active
                    }
                  />

                </div>

                <div
                  className={`dst9-message ${
                    currentProgramStep
                      ?.type === "error"
                      ? "error"
                      : ""
                  } ${
                    currentProgramStep
                      ?.type ===
                    "success"
                      ? "success"
                      : ""
                  }`}
                >

                  <b>
                    {currentProgramStep
                      ?.title ||
                      "PROGRAM READY"}
                  </b>

                  <span>
                    {currentProgramStep
                      ?.message ||
                      "Enter values and click Run Program to begin execution."}
                  </span>

                </div>

                <div className="dst9-controls">

                  <button
                    className="dst9-secondary"
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
                    className="dst9-secondary"
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
                    className="dst9-primary"
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

            {/* EXECUTION TRACE */}

            {programSteps.length >
              0 && (

              <div className="dst9-card dst9-trace-card">

                <div className="dst9-trace-header">

                  <div>

                    <div className="dst9-section">
                      Execution Trace
                    </div>

                    <p>
                      Each step of binary
                      tree program execution.
                    </p>

                  </div>

                  <span>
                    {
                      programSteps.length
                    } Steps
                  </span>

                </div>

                <div className="dst9-trace-list">

                  {programSteps.map(
                    (
                      step,
                      index
                    ) => (

                      <button
                        key={index}
                        className={`dst9-trace-item ${
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

                        <span className="dst9-trace-number">
                          {index + 1}
                        </span>

                        <span className="dst9-trace-content">

                          <b>
                            {step.title}
                          </b>

                          <small>
                            {
                              step.message
                            }
                          </small>

                          <small>
                            Nodes:{" "}
                            {step.tree
                              ? inorder(
                                  step.tree
                                ).join(
                                  " "
                                )
                              : "Empty"}
                          </small>

                        </span>

                        <span className="dst9-trace-status">
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

              <div className="dst9-card dst9-output-card">

                <div className="dst9-section">
                  Program Output
                </div>

                <pre className="dst9-output">
{`Operation : ${programOperation}

Input : ${programValue}

Inorder : ${
  currentProgramStep.tree
    ? inorder(
        currentProgramStep.tree
      ).join(" ")
    : "Empty"
}

Preorder : ${
  currentProgramStep.tree
    ? preorder(
        currentProgramStep.tree
      ).join(" ")
    : "Empty"
}

Postorder : ${
  currentProgramStep.tree
    ? postorder(
        currentProgramStep.tree
      ).join(" ")
    : "Empty"
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
            QUESTIONS TAB
            ================================================= */}

        {activeTab ===
          "questions" && (

          <div className="dst9-card dst9-questions">

            <div className="dst9-section">
              Questions
            </div>

            {QUESTIONS.map(
              (
                question,
                index
              ) => (

                <div
                  className="dst9-question"
                  key={index}
                >

                  <b>
                    {index + 1}.{" "}
                    {question.q}
                  </b>

                  <div className="dst9-options">

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

            <div className="dst9-question-submit">

              <button
                className="dst9-primary"
                onClick={
                  submitQuestions
                }
              >
                Submit Questions
              </button>

            </div>

            {experimentCompleted && questionResult && (

              <div className="dst9-question-result">

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
                  ✓ Completed
                </span>

              </div>

            )}

          </div>

        )}

        {/* =================================================
            FINAL SUBMIT
            ================================================= */}

        <div className="dst9-submit-section">

          <button
            className="dst9-submit"
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

export default DSTExperiment9;