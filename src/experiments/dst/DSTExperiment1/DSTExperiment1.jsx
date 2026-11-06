import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment1.css";

/* =========================================================
   PREDEFINED PROGRAMS
   ========================================================= */

const CODE_TEMPLATES = {
  create: `#include <stdio.h>

int main() {
    int arr[10], n, i;

    printf("Enter array size: ");
    scanf("%d", &n);

    for(i = 0; i < n; i++) {
        printf("Enter element: ");
        scanf("%d", &arr[i]);
    }

    printf("Array elements are:\\n");
    for(i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }

    return 0;
}`,

  insert: `#include <stdio.h>

int main() {
    int arr[10], n, i, pos, value;

    printf("Enter array size: ");
    scanf("%d", &n);

    for(i = 0; i < n; i++)
        scanf("%d", &arr[i]);

    printf("Enter position and value: ");
    scanf("%d%d", &pos, &value);

    for(i = n; i > pos; i--)
        arr[i] = arr[i - 1];

    arr[pos] = value;
    n++;

    printf("Array after insertion:\\n");
    for(i = 0; i < n; i++)
        printf("%d ", arr[i]);

    return 0;
}`,

  delete: `#include <stdio.h>

int main() {
    int arr[10], n, i, pos;

    printf("Enter array size: ");
    scanf("%d", &n);

    for(i = 0; i < n; i++)
        scanf("%d", &arr[i]);

    printf("Enter position to delete: ");
    scanf("%d", &pos);

    for(i = pos; i < n - 1; i++)
        arr[i] = arr[i + 1];

    n--;

    printf("Array after deletion:\\n");
    for(i = 0; i < n; i++)
        printf("%d ", arr[i]);

    return 0;
}`,

  display: `#include <stdio.h>

int main() {
    int arr[10], n, i;

    printf("Enter array size: ");
    scanf("%d", &n);

    for(i = 0; i < n; i++)
        scanf("%d", &arr[i]);

    printf("Displaying array:\\n");

    for(i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }

    return 0;
}`
};

/* =========================================================
   STEP BUILDERS WITH ANIMATION SUPPORT
   ========================================================= */

const buildCreateSteps = (elements) => {
  const steps = [
    {
      message: "Array is initialized as empty.",
      array: [],
      current: -1,
      from: -1,
      to: -1,
      animation: "none",
      insertElement: null
    }
  ];

  const arr = [];

  elements.forEach((value, index) => {
    arr.push(value);

    steps.push({
      message: `Store ${value} at index ${index}.`,
      array: [...arr],
      current: index,
      from: -1,
      to: -1,
      animation: "fade-in",
      animateIndex: index,
      insertElement: null
    });
  });

  steps.push({
    message: "All elements have been stored successfully.",
    array: [...arr],
    current: -1,
    from: -1,
    to: -1,
    animation: "none",
    insertElement: null
  });

  return steps;
};

const buildInsertSteps = (elements, value, index) => {
  const arr = [...elements];
  const steps = [
    {
      message: "Original array is loaded into memory.",
      array: [...arr],
      current: -1,
      from: -1,
      to: -1,
      animation: "none",
      insertElement: null
    }
  ];

  steps.push({
    message: `Element ${value} is ready for insertion at index ${index}.`,
    array: [...arr],
    current: -1,
    from: -1,
    to: -1,
    animation: "show-insert-element",
    insertElement: value,
    insertIndex: index
  });

  for (let i = arr.length; i > index; i--) {
    arr[i] = arr[i - 1];

    steps.push({
      message: `Shift element from index ${i - 1} to index ${i}.`,
      array: [...arr],
      current: i,
      from: i - 1,
      to: i,
      animation: "shift-right-for-insert",
      shiftFrom: i - 1,
      shiftTo: i,
      insertElement: value,
      insertIndex: index
    });
  }

  arr[index] = value;

  steps.push({
    message: `Insert ${value} at index ${index}.`,
    array: [...arr],
    current: index,
    from: -1,
    to: -1,
    animation: "drop-insert-element",
    insertElement: null,
    insertIndex: index
  });

  steps.push({
    message: "Insertion completed successfully.",
    array: [...arr],
    current: -1,
    from: -1,
    to: -1,
    animation: "none",
    insertElement: null
  });

  return steps;
};

const buildDeleteSteps = (elements, index) => {
  const arr = [...elements];

  const steps = [
    {
      message: "Original array is loaded into memory.",
      array: [...arr],
      current: -1,
      from: -1,
      to: -1,
      animation: "none",
      insertElement: null
    }
  ];

  steps.push({
    message: `Element at index ${index} will be deleted.`,
    array: [...arr],
    current: index,
    from: -1,
    to: -1,
    animation: "highlight-delete",
    deleteIndex: index,
    insertElement: null
  });

  for (let i = index; i < arr.length - 1; i++) {
    arr[i] = arr[i + 1];

    steps.push({
      message: `Shift element from index ${i + 1} to index ${i}.`,
      array: [...arr],
      current: i,
      from: i + 1,
      to: i,
      animation: "shift-left-for-delete",
      shiftFrom: i + 1,
      shiftTo: i,
      insertElement: null
    });
  }

  arr.pop();

  steps.push({
    message: `Delete element from index ${index}.`,
    array: [...arr],
    current: -1,
    from: -1,
    to: -1,
    animation: "remove-element",
    deleteIndex: index,
    insertElement: null
  });

  steps.push({
    message: "Deletion completed successfully.",
    array: [...arr],
    current: -1,
    from: -1,
    to: -1,
    animation: "none",
    insertElement: null
  });

  return steps;
};

const buildDisplaySteps = (elements) => {
  const steps = [
    {
      message: "Array is loaded into memory.",
      array: [...elements],
      current: -1,
      from: -1,
      to: -1,
      animation: "none",
      insertElement: null
    }
  ];

  elements.forEach((value, index) => {
    steps.push({
      message: `Display element ${value} at index ${index}.`,
      array: [...elements],
      current: index,
      from: -1,
      to: -1,
      animation: "highlight-display",
      animateIndex: index,
      insertElement: null
    });
  });

  steps.push({
    message: "All array elements have been displayed.",
    array: [...elements],
    current: -1,
    from: -1,
    to: -1,
    animation: "none",
    insertElement: null
  });

  return steps;
};

/* =========================================================
   PROGRAM TAB – LINE-BY-LINE DRY RUN
   ========================================================= */

const lineOf = (op, snippet, nth = 0) => {
  const lines = CODE_TEMPLATES[op].split("\n");
  let count = -1;

  for (let k = 0; k < lines.length; k++) {
    if (lines[k].includes(snippet)) {
      count++;
      if (count === nth) return k + 1;
    }
  }

  return 1;
};

const PROGRAM_HEADERS = {
  create: ["Array elements are", "Array elements are:"],
  insert: ["Array after insertion", "Array after insertion:"],
  delete: ["Array after deletion", "Array after deletion:"],
  display: ["Displaying array", "Displaying array:"]
};

const addr = (k) => 1000 + k * 4;
const listArr = (a) => (a.length ? `[${a.join(", ")}]` : "[ ] (empty)");

const loopCheck = (first, init, update, condSym, condVals, ok, exitNote) => ({
  what: first
    ? "The for loop starts. Its initialisation runs once, then the condition is tested before every pass."
    : "One pass is over. The update expression runs and the condition is tested again.",
  working: [
    first ? `Initialise: ${init}` : `Update: ${update}`,
    `Condition: ${condSym}`,
    `Substitute the values: ${condVals}`,
    `The condition evaluates to ${ok ? "TRUE" : "FALSE"}`
  ],
  result: ok
    ? "Condition is TRUE, so the loop body executes."
    : "Condition is FALSE, so control jumps past the loop.",
  why: ok ? undefined : exitNote
});

const C_TOKEN =
  /(#include\s*<[^>]+>|"(?:[^"\\]|\\.)*"|\b(?:int|for|return)\b|\b(?:printf|scanf|main)\b(?=\s*\()|\b\d+\b)/g;

const highlightC = (text) =>
  text.split(C_TOKEN).map((part, k) => {
    if (k % 2 === 0) return part;

    let cls = "tok-num";
    if (part.startsWith("#")) cls = "tok-pre";
    else if (part.startsWith('"')) cls = "tok-str";
    else if (/^(int|for|return)$/.test(part)) cls = "tok-kw";
    else if (/^(printf|scanf|main)$/.test(part)) cls = "tok-fn";

    return (
      <span key={k} className={cls}>
        {part}
      </span>
    );
  });

const scrollActiveInto = (box, selector) => {
  if (!box) return;
  const el = box.querySelector(selector);
  if (!el) return;

  const b = box.getBoundingClientRect();
  const e = el.getBoundingClientRect();

  if (e.top < b.top || e.bottom > b.bottom) {
    box.scrollTop += e.top - b.top - box.clientHeight / 2 + e.height / 2;
  }
};

const buildProgramSteps = (op, elements, value = null, index = -1) => {
  const L = (snippet, nth = 0) => lineOf(op, snippet, nth);
  const N = elements.length;
  const arr = [];
  const steps = [];

  let n = "?";
  let i = "?";
  let pos = "?";
  let val = "?";

  const snapshot = () => {
    const v = { n, i };
    if (op === "insert") {
      v.pos = pos;
      v.value = val;
    }
    if (op === "delete") {
      v.pos = pos;
    }
    return v;
  };

  const push = (line, message, explain, extra = {}) => {
    steps.push({
      message,
      line,
      explain,
      vars: snapshot(),
      array: [...arr],
      current: -1,
      from: -1,
      to: -1,
      animation: "none",
      insertElement: null,
      ...extra
    });
  };

  const names = {
    create: "n, i",
    display: "n, i",
    insert: "n, i, pos, value",
    delete: "n, i, pos"
  }[op];

  push(L("int arr[10]"), "Declare the array and variables", {
    what: "Declares the array and the variables the program will use. Memory is reserved now, but nothing is stored yet.",
    working: [
      `int arr[10] → 10 integers × 4 bytes = 40 bytes of contiguous memory (addresses ${addr(0)} to ${addr(9)})`,
      `int ${names} → one 4-byte integer variable each`
    ],
    result:
      "Every variable holds an unknown (garbage) value, shown as ? in the Variable Watch.",
    why: "C does not initialise local variables, so each one must be assigned a value before it is used."
  });

  n = N;
  push(L('scanf("%d", &n)'), "Read the array size", {
    what: "Prints a prompt and reads the array size typed by the user into the variable n.",
    working: [
      `The user enters ${N} as Array Size in Program Input`,
      "scanf(\"%d\", &n) stores that number at the address of n (&n)"
    ],
    result: `n = ${N}`,
    why: "n is the number of elements currently in use. The array itself has room for 10, but the program only works with the first n."
  });

  if (op === "create") {
    for (let k = 0; k <= N; k++) {
      i = k;
      const ok = k < N;

      push(
        L("for(i = 0", 0),
        ok
          ? `Check loop condition (i = ${k})`
          : "Loop condition fails, so reading ends",
        loopCheck(
          k === 0,
          "i = 0",
          `i++ → i becomes ${k}`,
          "i < n",
          `${k} < ${N}`,
          ok,
          `i has reached n, so all ${N} elements have been read (indexes 0 to ${N - 1}).`
        )
      );

      if (!ok) break;

      arr.push(elements[k]);

      push(
        L("&arr[i]"),
        `Store ${elements[k]} at index ${k}`,
        {
          what: "scanf reads the next value typed by the user and stores it in the array slot arr[i].",
          working: [
            `Current value of i = ${k}`,
            `&arr[i] → &arr[${k}] → memory address ${addr(k)}`,
            `The user enters ${elements[k]} for arr[${k}]`
          ],
          result: `arr[${k}] = ${elements[k]}, so the array is now ${listArr(arr)}`,
          why:
            k === 0
              ? "arr[0] is the first slot; the name arr itself refers to this starting address."
              : `Elements sit one after another in memory, so arr[${k}] is 4 bytes after arr[${k - 1}] (${addr(k)} = ${addr(k - 1)} + 4).`
        },
        { current: k, animation: "fade-in", animateIndex: k }
      );
    }
  } else {
    arr.push(...elements);
    i = N;

    push(L("for(i = 0", 0), "Read the array elements", {
      what: "This loop runs n times. Each pass executes scanf(\"%d\", &arr[i]) and stores one user-entered value in arr[i].",
      working: [
        `Values entered: ${elements
          .map((v, k) => `arr[${k}] = ${v}`)
          .join(", ")}`,
        `The loop stops when i = ${N}, because ${N} < ${N} is FALSE`
      ],
      result: `The array is now ${listArr(arr)} and i = ${N}.`,
      why: "The individual passes of this loop are shown one by one in the Create Array program."
    });
  }

  if (op === "insert") {
    pos = index;
    val = value;
    const toMove = N - index;

    push(
      L("&pos, &value"),
      "Read position and value",
      {
        what: "Reads the position where the new element goes and the value to insert.",
        working: [
          `The user enters position = ${index}`,
          `The user enters value = ${value}`,
          'scanf("%d%d", &pos, &value) stores them in pos and value'
        ],
        result:
          toMove > 0
            ? `pos = ${index}, value = ${value}. ${toMove} element${
                toMove > 1 ? "s" : ""
              } (index ${index} to ${N - 1}) must move one place right to make room.`
            : `pos = ${index}, value = ${value}. Position ${index} is the end of the array, so nothing needs to move.`,
        why: `Valid positions are 0 to n (0 to ${N}); position ${N} means "add at the end".`
      },
      {
        animation: "show-insert-element",
        insertElement: value,
        insertIndex: index
      }
    );

    for (let k = n; ; k--) {
      i = k;
      const ok = k > index;

      const explain = loopCheck(
        k === N,
        `i = n → i = ${N}`,
        `i-- → i becomes ${k}`,
        "i > pos",
        `${k} > ${index}`,
        ok,
        k === N
          ? `pos (${index}) is equal to n, so there is nothing to shift.`
          : `i has reached pos, so every element from index ${index} onward has moved one place right.`
      );
      if (ok && k === N) {
        explain.why =
          "Shifting starts from the LAST element and moves backwards, so no value is overwritten before it has been copied.";
      }

      push(
        L("for(i = n"),
        ok
          ? `Check loop condition (i = ${k})`
          : "Loop condition fails, so shifting ends",
        explain,
        { insertElement: value, insertIndex: index }
      );

      if (!ok) break;

      const old = arr[k];
      arr[k] = arr[k - 1];

      push(
        L("arr[i] = arr[i - 1]"),
        `Shift index ${k - 1} → ${k}`,
        {
          what: "Copies the element on the left (index i-1) into index i, moving it one place to the right.",
          working: [
            `Current value of i = ${k}`,
            `arr[i] = arr[i - 1]`,
            `arr[${k}] = arr[${k} - 1] = arr[${k - 1}]`,
            `arr[${k - 1}] holds ${arr[k - 1]}`,
            `So arr[${k}] = ${arr[k]}`
          ],
          result:
            old === undefined
              ? `arr[${k}] was unused, now it holds ${arr[k]}. Array: ${listArr(arr)}`
              : `arr[${k}] changes from ${old} to ${arr[k]}. Array: ${listArr(arr)}`,
          why:
            k - 1 === index
              ? `Index ${index} now holds a duplicate of ${arr[index]}. It is free to receive the new value.`
              : `Index ${k - 1} still holds ${arr[k - 1]} for now; the next pass will overwrite it.`
        },
        {
          current: k,
          from: k - 1,
          to: k,
          animation: "shift-right-for-insert",
          shiftFrom: k - 1,
          shiftTo: k,
          insertElement: value,
          insertIndex: index
        }
      );
    }

    const oldVal = arr[index];
    arr[index] = value;

    push(
      L("arr[pos] = value"),
      `Insert ${value} at index ${index}`,
      {
        what: "Writes the new value into the gap that the shifting created.",
        working: [
          `pos = ${index}`,
          `value = ${value}`,
          `arr[pos] = value → arr[${index}] = ${value}`
        ],
        result:
          oldVal === undefined
            ? `arr[${index}] was empty, now it holds ${value}. Array: ${listArr(arr)}`
            : `arr[${index}] changes from ${oldVal} to ${value}. Array: ${listArr(arr)}`,
        why: "Every element from pos onward was shifted right first, so no original data is lost."
      },
      { current: index, animation: "drop-insert-element", insertIndex: index }
    );

    const oldN = n;
    n = n + 1;

    push(L("n++;"), "Increase the array size", {
      what: "Updates the count of valid elements, because the array now holds one more item.",
      working: ["n = n + 1", `n = ${oldN} + 1`],
      result: `n = ${n}. The valid elements are arr[0] to arr[${n - 1}].`,
      why: "Insertion may shift up to n elements, so its time complexity is O(n)."
    });
  }

  if (op === "delete") {
    pos = index;

    push(
      L("&pos"),
      "Read position to delete",
      {
        what: "Reads the position (index) of the element that has to be deleted.",
        working: [
          `The user enters position = ${index}`,
          'scanf("%d", &pos) stores it in pos',
          `The element at arr[${index}] is ${arr[index]}`
        ],
        result: `pos = ${index}. The element ${arr[index]} at index ${index} will be removed.`,
        why: `Valid positions are 0 to n - 1 (0 to ${N - 1}).`
      },
      { current: index, animation: "highlight-delete", deleteIndex: index }
    );

    for (let k = index; ; k++) {
      i = k;
      const ok = k < n - 1;

      const explain = loopCheck(
        k === index,
        `i = pos → i = ${index}`,
        `i++ → i becomes ${k}`,
        "i < n - 1",
        `${k} < ${n - 1}`,
        ok,
        k === index
          ? `pos (${index}) is already the last index, so no element needs to move.`
          : "i has reached n - 1, so every element after pos has moved one place left."
      );
      if (ok && k === index) {
        explain.why =
          "Elements to the right of pos move left one by one, starting at pos, so each value is copied before its slot is overwritten.";
      }

      push(
        L("for(i = pos"),
        ok
          ? `Check loop condition (i = ${k})`
          : "Loop condition fails, so shifting ends",
        explain
      );

      if (!ok) break;

      const old = arr[k];
      arr[k] = arr[k + 1];

      push(
        L("arr[i] = arr[i + 1]"),
        `Shift index ${k + 1} → ${k}`,
        {
          what: "Copies the element on the right (index i+1) into index i, closing the gap left by the deleted element.",
          working: [
            `Current value of i = ${k}`,
            `arr[i] = arr[i + 1]`,
            `arr[${k}] = arr[${k} + 1] = arr[${k + 1}]`,
            `arr[${k + 1}] holds ${arr[k + 1]}`,
            `So arr[${k}] = ${arr[k]}`
          ],
          result: `arr[${k}] changes from ${old} to ${arr[k]}. Array: ${listArr(arr)}`,
          why:
            k === n - 2
              ? `The last slot (index ${n - 1}) now holds a duplicate; n-- will exclude it.`
              : `Index ${k + 1} still holds ${arr[k + 1]} for now; the next pass will overwrite it.`
        },
        {
          current: k,
          from: k + 1,
          to: k,
          animation: "shift-left-for-delete",
          shiftFrom: k + 1,
          shiftTo: k
        }
      );
    }

    const oldN = n;
    arr.pop();
    n = n - 1;

    push(
      L("n--;"),
      `Delete element from index ${index}`,
      {
        what: "Reduces the count of valid elements by one. A C array cannot shrink, so \"deleting\" means the last slot is simply no longer counted.",
        working: ["n = n - 1", `n = ${oldN} - 1`],
        result:
          n > 0
            ? `n = ${n}. The valid elements are arr[0] to arr[${n - 1}]: ${listArr(arr)}`
            : "n = 0. The array is now empty.",
        why: "Deletion may shift up to n - 1 elements, so its time complexity is O(n)."
      },
      { animation: "remove-element", deleteIndex: index }
    );
  }

  const [headerSnippet, headerText] = PROGRAM_HEADERS[op];

  push(L(headerSnippet), "Print the heading", {
    what: `Prints the heading "${headerText}" and moves to a new line.`,
    working: [
      `printf("${headerText}\\n")`,
      "\\n is the newline character"
    ],
    result: "The heading is printed. The array elements follow on the next line."
  });

  for (let k = 0; k <= n; k++) {
    i = k;
    const ok = k < n;

    push(
      L("for(i = 0", 1),
      ok
        ? `Check loop condition (i = ${k})`
        : "Loop condition fails, so printing ends",
      loopCheck(
        k === 0,
        "i = 0",
        `i++ → i becomes ${k}`,
        "i < n",
        `${k} < ${n}`,
        ok,
        `i has reached n (${n}), so every element has been printed.`
      )
    );

    if (!ok) break;

    push(
      L('printf("%d ", arr[i])'),
      `Print ${arr[k]}`,
      {
        what: "Prints the element stored at arr[i], followed by a space.",
        working: [
          `Current value of i = ${k}`,
          `arr[i] → arr[${k}]`,
          `arr[${k}] is stored at address ${addr(k)} and holds ${arr[k]}`
        ],
        result: `${arr[k]} is printed.`,
        why:
          k === 0
            ? "An element is reached directly from its index, so each access takes O(1) time."
            : undefined
      },
      { current: k, animation: "highlight-display", animateIndex: k }
    );
  }

  push(L("return 0"), "Program ends", {
    what: "main() returns 0, telling the operating system that the program finished successfully.",
    working: ["return 0"],
    result: `The program ends. Final array: ${listArr(arr)} with n = ${n}.`,
    why:
      op === "insert" || op === "delete"
        ? "Shifting elements makes this operation O(n) in the worst case."
        : "Every element was visited exactly once, so the work grows linearly: O(n)."
  });

  return steps;
};

/* ========================================================= 
   COMPONENT 
   ========================================================= */

const DSTExperiment1 = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("simulation");
  const [showTheory, setShowTheory] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  /* ---------------- SIMULATION ---------------- */

  const [operation, setOperation] = useState("create");
  const [arraySize, setArraySize] = useState(6);
  // raw text shown in the Array Size field while the user is typing
  // (fix #3 — decoupled from the clamped numeric value so
  // backspace/typing/arrow keys all behave naturally)
  const [arraySizeText, setArraySizeText] = useState("6");

  const [elements, setElements] = useState([
    "10",
    "20",
    "30",
    "40",
    "50",
    "60"
  ]);

  const [insertValue, setInsertValue] = useState("");
  const [insertIndex, setInsertIndex] = useState("");
  const [deleteIndex, setDeleteIndex] = useState("");

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [observations, setObservations] = useState([]);

  /* ---------------- PROGRAM ---------------- */

  const [progOperation, setProgOperation] = useState("create");
  const [progArraySize, setProgArraySize] = useState(4);
  // same decoupled raw/clamped pattern as the simulation tab (fix #5)
  const [progArraySizeText, setProgArraySizeText] = useState("4");

  const [progElements, setProgElements] = useState([
    "10",
    "20",
    "30",
    "40"
  ]);

  const [progInsertValue, setProgInsertValue] = useState("");
  const [progInsertIndex, setProgInsertIndex] = useState("");
  const [progDeleteIndex, setProgDeleteIndex] = useState("");

  const [progSteps, setProgSteps] = useState([]);
  const [progCurrentStep, setProgCurrentStep] = useState(-1);
  const [progRunning, setProgRunning] = useState(false);
  const [progError, setProgError] = useState("");
  const [progCompleted, setProgCompleted] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  // refs used to keep the active code line in view
  const codeBoxRef = useRef(null);

  /* ---------------- QUESTIONS ---------------- */

  const questions = [
    {
      q: "Array elements are stored in:",
      options: ["Random memory", "Contiguous memory", "Stack only", "Database"],
      answer: 1
    },
    {
      q: "The first index of an array is:",
      options: ["0", "1", "-1", "10"],
      answer: 0
    },
    {
      q: "Which operation adds an element to an array?",
      options: ["Delete", "Insert", "Display", "Search"],
      answer: 1
    },
    {
      q: "Deletion from an array generally requires:",
      options: [
        "Shifting elements",
        "Creating a database",
        "Sorting only",
        "Compilation"
      ],
      answer: 0
    },
    {
      q: "Accessing an array element by index takes:",
      options: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
      answer: 0
    },
    {
      q: "Which loop is commonly used to traverse an array?",
      options: ["for", "switch", "goto", "class"],
      answer: 0
    },
    {
      q: "An array contains elements of:",
      options: [
        "Different compulsory types",
        "Same data type",
        "Only string type",
        "Only integer type"
      ],
      answer: 1
    },
    {
      q: "Which operation reads every array element?",
      options: ["Display/Traversal", "Delete", "Insert", "Compile"],
      answer: 0
    },
    {
      q: "How many elements can int values[10] store?",
      options: ["9", "10", "11", "Depends on the values"],
      answer: 1
    },
    {
      q: "What is the last valid index in an array containing 8 elements?",
      options: ["8", "7", "1", "0"],
      answer: 1
    },
    {
      q: "Which expression accesses the fourth element of array values in C?",
      options: ["values[4]", "values[3]", "values(4)", "values{3}"],
      answer: 1
    },
    {
      q: "A one-dimensional array element is accessed using how many indexes?",
      options: ["One", "Two", "Three", "None"],
      answer: 0
    },
    {
      q: "What should be checked before inserting into a fixed-size array?",
      options: ["Whether the array has free capacity", "Whether the array is empty only", "Whether the values are strings", "Whether the array is sorted"],
      answer: 0
    },
    {
      q: "When inserting an element at an occupied middle index, which elements may need to move?",
      options: ["Elements after that index shift right", "Elements before that index shift left", "No elements can move", "Every element is deleted"],
      answer: 0
    },
    {
      q: "When deleting an element from the middle of an array, how are later elements commonly handled?",
      options: ["They shift left to fill the gap", "They all shift right", "They are sorted automatically", "They become pointers"],
      answer: 0
    },
    {
      q: "Which loop is a common way to visit array indexes from 0 to n - 1?",
      options: ["for loop", "switch statement", "if statement only", "goto label only"],
      answer: 0
    },
    {
      q: "What can happen when a program accesses an index outside an array's bounds?",
      options: ["Undefined behavior", "The array automatically grows", "The index becomes 0", "The array is sorted"],
      answer: 0
    },
    {
      q: "Which operation is best suited to find a value in an unsorted array?",
      options: ["Linear search", "Binary search without sorting", "Merge", "Push"],
      answer: 0
    },
    {
      q: "In C, the array name commonly refers to what when used in an expression?",
      options: ["The address of its first element", "The number of elements", "The last element's value", "The array's sorted copy"],
      answer: 0
    },
    {
      q: "What does updating values[i] do?",
      options: ["Changes the element stored at index i", "Deletes the entire array", "Changes the array capacity", "Moves the element to index 0"],
      answer: 0
    }
  ];

  const [answers, setAnswers] = useState({});
  const [questionResult, setQuestionResult] = useState(null);
  const [experimentCompleted, setExperimentCompleted] = useState(false);
  // fix #9 — "View Answers" reveal mode, shown after the experiment is submitted
  const [showAnswers, setShowAnswers] = useState(false);

  /* =========================================================
     SIMULATION HELPERS
  ========================================================= */

  // fix #3: commit (clamp + rebuild elements) only happens here —
  // never on every keystroke — so Backspace/typing/arrow keys all work.
  const commitArraySize = (raw) => {
    let size = parseInt(raw, 10);

    if (!Number.isFinite(size) || Number.isNaN(size)) {
      size = 1;
    }

    size = Math.max(1, Math.min(10, size));

    setArraySize(size);
    setArraySizeText(String(size));

    setElements((old) => {
      const next = [...old];

      while (next.length < size) {
        next.push(String((next.length + 1) * 10));
      }

      return next.slice(0, size);
    });

    resetSimulation();
  };

  const handleArraySizeChange = (raw) => {
    // allow empty string / partial numbers while typing (backspace works)
    if (raw === "" || /^\d{1,2}$/.test(raw)) {
      setArraySizeText(raw);
    }
  };

  const handleArraySizeKeyUp = (e) => {
    if (["ArrowUp", "ArrowDown", "Enter"].includes(e.key)) {
      commitArraySize(e.target.value);
    }
  };

  const updateElement = (index, value) => {
    setElements((old) => {
      const next = [...old];
      next[index] = value;
      return next;
    });
  };

  const addObservation = (op, input, result) => {
    setObservations((old) => [
      ...old,
      {
        attempt: old.length + 1,
        operation: op,
        input,
        result
      }
    ]);
  };

  const startSimulation = () => {
    const clean = elements.map((x) => String(x).trim());

    if (clean.some((x) => x === "")) {
      alert("Please enter all array elements.");
      return;
    }

    let generated = [];

    if (operation === "create") {
      generated = buildCreateSteps(clean);
    }

    if (operation === "display") {
      generated = buildDisplaySteps(clean);
    }

    if (operation === "insert") {
      const index = Number(insertIndex);
      const value = String(insertValue).trim();

      if (!value) {
        alert("Please enter insertion value.");
        return;
      }

      if (!Number.isInteger(index) || index < 0 || index > clean.length) {
        alert(`Enter position between 0 and ${clean.length}.`);
        return;
      }

      generated = buildInsertSteps(clean, value, index);
    }

    if (operation === "delete") {
      const index = Number(deleteIndex);

      if (!Number.isInteger(index) || index < 0 || index >= clean.length) {
        alert(`Enter position between 0 and ${clean.length - 1}.`);
        return;
      }

      generated = buildDeleteSteps(clean, index);
    }

    setSteps(generated);
    setCurrentStep(0);
    setSimulationStarted(true);

    const finalArray = generated[generated.length - 1].array;

    addObservation(
      operation.toUpperCase(),
      clean.join(", "),
      finalArray.length ? finalArray.join(", ") : "Empty"
    );
  };

  const resetSimulation = () => {
    setSteps([]);
    setCurrentStep(-1);
    setSimulationStarted(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  /* =========================================================
     PROGRAM INPUT
  ========================================================= */

  const handleProgOperationChange = (value) => {
    setProgOperation(value);
    setProgSteps([]);
    setProgCurrentStep(-1);
    setProgRunning(false);
    setProgCompleted(false);
    setProgError("");
    setAutoPlay(false);
  };

  // fix #5: same decoupled commit pattern as the simulation tab
  const commitProgArraySize = (raw) => {
    let size = parseInt(raw, 10);

    if (!Number.isFinite(size) || Number.isNaN(size)) {
      size = 1;
    }

    size = Math.max(1, Math.min(10, size));

    setProgArraySize(size);
    setProgArraySizeText(String(size));

    setProgElements((old) => {
      const next = [...old];

      while (next.length < size) {
        next.push(String((next.length + 1) * 10));
      }

      return next.slice(0, size);
    });

    resetProgram();
  };

  const handleProgArraySizeChange = (raw) => {
    if (raw === "" || /^\d{1,2}$/.test(raw)) {
      setProgArraySizeText(raw);
    }
  };

  const handleProgArraySizeKeyUp = (e) => {
    if (["ArrowUp", "ArrowDown", "Enter"].includes(e.key)) {
      commitProgArraySize(e.target.value);
    }
  };

  const updateProgElement = (index, value) => {
    setProgElements((old) => {
      const next = [...old];
      next[index] = value;
      return next;
    });
  };

  /* =========================================================
     PROGRAM EXECUTION
  ========================================================= */

  const runProgram = () => {
    setProgError("");

    const clean = progElements.map((x) => String(x).trim());

    if (clean.length !== progArraySize) {
      setProgError("Please enter all required array elements.");
      return;
    }

    if (clean.some((x) => x === "")) {
      setProgError("Please enter all array elements.");
      return;
    }

    let generated = [];

    if (progOperation === "create") {
      generated = buildProgramSteps("create", clean);
    }

    if (progOperation === "display") {
      generated = buildProgramSteps("display", clean);
    }

    if (progOperation === "insert") {
      const value = String(progInsertValue).trim();
      const index = Number(progInsertIndex);

      if (!value) {
        setProgError("Please enter insertion value.");
        return;
      }

      if (!Number.isInteger(index) || index < 0 || index > clean.length) {
        setProgError(`Position must be between 0 and ${clean.length}.`);
        return;
      }

      if (clean.length >= 10) {
        setProgError("Maximum array capacity is 10.");
        return;
      }

      generated = buildProgramSteps("insert", clean, value, index);
    }

    if (progOperation === "delete") {
      const index = Number(progDeleteIndex);

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= clean.length
      ) {
        setProgError(
          `Position must be between 0 and ${clean.length - 1}.`
        );
        return;
      }

      generated = buildProgramSteps("delete", clean, null, index);
    }

    setProgSteps(generated);
    setProgCurrentStep(0);
    setProgRunning(true);
    setProgCompleted(false);
    setAutoPlay(false);
  };

  const progNextStep = () => {
    if (!progSteps.length) return;

    if (progCurrentStep < progSteps.length - 1) {
      const next = progCurrentStep + 1;
      setProgCurrentStep(next);

      if (next === progSteps.length - 1) {
        setProgCompleted(true);
        setAutoPlay(false);
      }
    }
  };

  const progPreviousStep = () => {
    if (progCurrentStep > 0) {
      const prev = progCurrentStep - 1;
      setProgCurrentStep(prev);
      setProgCompleted(false);
    }
  };

  const resetProgram = () => {
    setProgSteps([]);
    setProgCurrentStep(-1);
    setProgRunning(false);
    setProgCompleted(false);
    setProgError("");
    setAutoPlay(false);
  };

  useEffect(() => {
    if (!autoPlay || !progRunning) return;

    if (progCurrentStep >= progSteps.length - 1) {
      setAutoPlay(false);
      setProgCompleted(true);
      return;
    }

    const timer = setTimeout(() => {
      progNextStep();
    }, 900);

    return () => clearTimeout(timer);
  }, [autoPlay, progCurrentStep, progSteps, progRunning]);

  // keep the highlighted code line visible
  useEffect(() => {
    scrollActiveInto(codeBoxRef.current, ".dst1-code-line.active");
  }, [progCurrentStep, progSteps]);

  /* =========================================================
     QUESTIONS
  ========================================================= */

  const selectAnswer = (questionIndex, optionIndex) => {
    if (experimentCompleted) return;

    setAnswers((old) => ({
      ...old,
      [questionIndex]: optionIndex
    }));
  };

  /* =========================================================
     FINAL EXPERIMENT SUBMIT
     (fix #9: quiz is now scored here, from the single bottom button)
  ========================================================= */

  const submitExperiment = () => {
    if (!observations.length) {
      alert("Please perform the simulation first.");
      return;
    }

    if (!progCompleted) {
      alert("Please complete the Program Execution first.");
      return;
    }

    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    let score = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        score++;
      }
    });

    const result = { score, total: questions.length };
    const resultData = buildDstResult({
      experimentNo: 1,
      experimentName:
        "Write a C program to perform various operations on one dimensional array",
      questionList: questions,
      selectedAnswers: answers,
      observations,
    });

    setQuestionResult(result);
    setExperimentCompleted(true);
    setShowAnswers(false);

    localStorage.setItem(
      "DSTExperiment1Result",
      JSON.stringify({
        observations,
        questionResult: result,
        completed: true
      })
    );
    localStorage.setItem("assignmentResult", JSON.stringify(resultData));
    navigate("/result", { state: resultData });
  };

  const handleTryAgain = () => {
    resetSimulation();
    setObservations([]);
    resetProgram();
    setAnswers({});
    setQuestionResult(null);
    setExperimentCompleted(false);
    setShowAnswers(false);
    setActiveTab("simulation");
  };

  const handleViewAnswers = () => {
    setShowAnswers(true);
    setActiveTab("questions");
  };

  const currentProgramStep =
    progCurrentStep >= 0 ? progSteps[progCurrentStep] : null;

  const previousProgramStep =
    progCurrentStep > 0 ? progSteps[progCurrentStep - 1] : null;

  const traceVarKeys = progSteps.length
    ? Object.keys(progSteps[0].vars || {})
    : [];

  const currentCodeLine =
    currentProgramStep
      ? (CODE_TEMPLATES[progOperation].split("\n")[currentProgramStep.line - 1] || "").trim()
      : "";

  const currentSimulationStep =
    currentStep >= 0 ? steps[currentStep] : null;

  /* =========================================================
     ENHANCED MEMORY VISUALIZER WITH ANIMATIONS
  ========================================================= */

  const renderMemoryVisualizer = (
    simArray,
    stepData = {},
    title = "Array Memory"
  ) => {
    if (!simArray || simArray.length === 0) {
      return (
        <div className="dst1-empty-canvas">
          <div className="dst1-array-icon">▦</div>
          <h3>Array Memory</h3>
          <p>Start the execution to visualize array memory.</p>
        </div>
      );
    }

    const animation = stepData.animation || "none";
    const insertElement = stepData.insertElement;

    return (
      <div className="dst1-memory-container">
        <div className="dst1-memory-title">
          <span>{title}</span>
          <small>Integer = 4 bytes</small>
        </div>

        {insertElement && animation === "show-insert-element" && (
          <div className="dst1-insert-element-floating">
            <div className="dst1-floating-box">
              {insertElement}
            </div>
            <div className="dst1-floating-label">
              Value to insert: {insertElement}
            </div>
          </div>
        )}

        <div className="dst1-address-row">
          {simArray.map((_, index) => (
            <div className="dst1-address" key={index}>
              {1000 + index * 4}
            </div>
          ))}
        </div>

        <div className="dst1-index-row">
          {simArray.map((_, index) => (
            <div className="dst1-index-label" key={index}>
              index [{index}]
            </div>
          ))}
        </div>

        <div className="dst1-array">
          {simArray.map((value, index) => {
            let cls = "dst1-array-cell";
            let animationClass = "";

            if (animation === "shift-right-for-insert" && index >= stepData.shiftTo) {
              animationClass = " shift-right";
            }

            if (animation === "shift-left-for-delete" && index >= stepData.shiftTo) {
              animationClass = " shift-left";
            }

            if (animation === "fade-in" && index === stepData.animateIndex) {
              animationClass = " fade-in-element";
            }

            if (animation === "highlight-display" && index === stepData.animateIndex) {
              animationClass = " pulse-display";
            }

            if (animation === "highlight-delete" && index === stepData.deleteIndex) {
              animationClass = " pulse-delete";
            }

            if (stepData.current === index) cls += " current";
            if (stepData.from === index) cls += " from-cell";
            if (stepData.to === index) cls += " to-cell";

            return (
              <div className={cls + animationClass} key={index}>
                <div className="dst1-cell-top">
                  {1000 + index * 4}
                </div>

                <div className="dst1-value">
                  {value}
                </div>

                {stepData.current === index && (
                  <div className="dst1-pointer">▼</div>
                )}
              </div>
            );
          })}
        </div>

        {stepData.from >= 0 && stepData.to >= 0 && (
          <div
            className={
              stepData.to > stepData.from
                ? "dst1-movement right"
                : "dst1-movement left"
            }
          >
            <span>ELEMENT MOVEMENT</span>
            <b>
              [{stepData.from}] → [{stepData.to}]
            </b>
          </div>
        )}
      </div>
    );
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="dst1-root">
      <div className="dst1-container">

        {/* HEADER */}
        <header className="dst1-exp-header">
        <button
        className="dst1-back-btn"
        onClick={() => navigate(-1)}
        >
        ← Back
        </button>

        <h1>Experiment 1 : Perform Array Operations</h1>

        <button
          className="dst1-help-btn"
          onClick={() => setShowHelp(true)}
        >
        ? Help
        </button>
        </header>

        {showHelp && (
          <div
            className="dst1-help-overlay"
            onClick={() => setShowHelp(false)}
          >
            <section
              aria-labelledby="dst1-help-title"
              aria-modal="true"
              className="dst1-help-dialog"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dst1-help-dialog-header">
                <h2 id="dst1-help-title">Experiment Help</h2>
                <button
                  aria-label="Close help"
                  className="dst1-help-close"
                  onClick={() => setShowHelp(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <ul>
                <li>Use Simulation to create, insert, delete, or display array elements.</li>
                <li>Use Program to follow the predefined C operation step by step.</li>
                <li>Answer all 20 questions, then select Submit Experiment to view your score.</li>
              </ul>
              <button
                className="dst1-help-done"
                onClick={() => setShowHelp(false)}
                type="button"
              >
                Got it
              </button>
            </section>
          </div>
        )}

        {/* AIM */}
        <div className="dst1-card dst1-aim-card">
          <div className="dst1-card-title">Aim</div>
          <p>
            To perform basic array operations such as creation,
            insertion, deletion and display using a C program.
          </p>
        </div>

        {/* THEORY */}
        <div className="dst1-card dst1-collapse-card">
          <button
            className="dst1-collapse-header"
            onClick={() => setShowTheory(!showTheory)}
          >
            <span>Theory</span>
            <span>{showTheory ? "▲" : "▼"}</span>
          </button>

          {showTheory && (
            <div className="dst1-collapse-content">
              <p>
                An array is a collection of elements of the same
                data type stored in contiguous memory locations.
              </p>

              <p>
                Common array operations include creating an array,
                inserting an element, deleting an element and
                traversing or displaying its elements.
              </p>

              <div className="dst1-complexity-box">
                <span>
                  <b>Access:</b> O(1)
                </span>
                <span>
                  <b>Search:</b> O(n)
                </span>
                <span>
                  <b>Insertion:</b> O(n)
                </span>
                <span>
                  <b>Deletion:</b> O(n)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* PROCEDURE */}
        <div className="dst1-card dst1-collapse-card">
          <button
            className="dst1-collapse-header"
            onClick={() => setShowProcedure(!showProcedure)}
          >
            <span>Procedure</span>
            <span>{showProcedure ? "▲" : "▼"}</span>
          </button>

          {showProcedure && (
            <div className="dst1-collapse-content">
              <ol>
                <li>Select the required array operation.</li>
                <li>Enter the array size and elements.</li>
                <li>For insertion or deletion, enter the required position.</li>
                <li>Start the simulation and observe each step.</li>
                <li>In Program tab, select the operation and execute the predefined program.</li>
                <li>Observe the dry run and final output.</li>
                <li>Answer all questions and click Submit Experiment.</li>
              </ol>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="dst1-tabs">
          <button
            className={`dst1-tab ${
              activeTab === "simulation" ? "active" : ""
            }`}
            onClick={() => setActiveTab("simulation")}
          >
            Simulation
          </button>

          <button
            className={`dst1-tab ${
              activeTab === "program" ? "active" : ""
            }`}
            onClick={() => setActiveTab("program")}
          >
            Program
          </button>

          <button
            className={`dst1-tab ${
              activeTab === "questions" ? "active" : ""
            }`}
            onClick={() => setActiveTab("questions")}
          >
            Questions
          </button>
        </div>

        {/* =====================================================
            SIMULATION TAB
        ===================================================== */}

        {activeTab === "simulation" && (
          <>
            <div className="dst1-sim-row">

              {/* INPUT */}
              <div className="dst1-card dst1-input-panel">
                <div className="dst1-panel-heading">
                  Input Panel
                </div>

                <div className="dst1-operation-label">
                  Select Operation
                </div>

                <div className="dst1-operation-cards">
                  {[
                    ["create", "Create", "Create array"],
                    ["insert", "Insert", "Add element"],
                    ["delete", "Delete", "Remove element"],
                    ["display", "Display", "Traverse array"]
                  ].map(([key, title, desc]) => (
                    <button
                      key={key}
                      className={`dst1-op-card ${
                        operation === key ? "active" : ""
                      }`}
                      onClick={() => {
                        setOperation(key);
                        resetSimulation();
                      }}
                    >
                      <span>
                        {key === "create"
                          ? "＋"
                          : key === "insert"
                          ? "↳"
                          : key === "delete"
                          ? "−"
                          : "☷"}
                      </span>
                      <b>{title}</b>
                      <small>{desc}</small>
                    </button>
                  ))}
                </div>

                <label>Array Size</label>

                <input
                  type="number"
                  min="1"
                  max="10"
                  value={arraySizeText}
                  onChange={(e) => handleArraySizeChange(e.target.value)}
                  onBlur={(e) => commitArraySize(e.target.value)}
                  onKeyUp={handleArraySizeKeyUp}
                />

                <label>Array Elements</label>

                <div className="dst1-input-grid">
                  {elements.map((value, index) => (
                    <div
                      className="dst1-small-input"
                      key={index}
                    >
                      <span>[{index}]</span>

                      <input
                        value={value}
                        onChange={(e) =>
                          updateElement(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>

                {operation === "insert" && (
                  <div className="dst1-special-input">
                    <label>Insert Value</label>
                    <input
                      value={insertValue}
                      onChange={(e) =>
                        setInsertValue(e.target.value)
                      }
                      placeholder="Example: 25"
                    />

                    <label>Insert Position</label>
                    <input
                      type="number"
                      min="0"
                      max={arraySize}
                      value={insertIndex}
                      onChange={(e) =>
                        setInsertIndex(e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                )}

                {operation === "delete" && (
                  <div className="dst1-special-input">
                    <label>Delete Position</label>
                    <input
                      type="number"
                      min="0"
                      max={arraySize - 1}
                      value={deleteIndex}
                      onChange={(e) =>
                        setDeleteIndex(e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                )}

                <div className="dst1-button-stack">
                  <button
                    className="dst1-primary-btn"
                    onClick={startSimulation}
                  >
                    ▶ Start Simulation
                  </button>

                  <button
                    className="dst1-reset-btn"
                    onClick={resetSimulation}
                  >
                    ↻ Reset
                  </button>
                </div>
              </div>

              {/* CANVAS */}
              <div className="dst1-card dst1-canvas-panel">
                <div className="dst1-canvas-header">
                  <div>
                    <div className="dst1-panel-heading">
                      Array Memory Visualizer
                    </div>
                    <div className="dst1-canvas-subtitle">
                      Step-by-step memory operation
                    </div>
                  </div>

                  <div className="dst1-step-badge">
                    {simulationStarted
                      ? `STEP ${currentStep + 1}/${steps.length}`
                      : "READY"}
                  </div>
                </div>

                <div className="dst1-live-strip">
                  <div>
                    <span>Operation</span>
                    <b>{operation.toUpperCase()}</b>
                  </div>

                  <div>
                    <span>Array Size</span>
                    <b>{arraySize}</b>
                  </div>

                  <div>
                    <span>Status</span>
                    <b className={simulationStarted ? "running" : "ready"}>
                      {simulationStarted ? "RUNNING" : "READY"}
                    </b>
                  </div>
                </div>

                <div className="dst1-array-stage">
                  {currentSimulationStep
                    ? renderMemoryVisualizer(
                        currentSimulationStep.array,
                        currentSimulationStep
                      )
                    : renderMemoryVisualizer([])}
                </div>

                {currentSimulationStep && (
                  <>
                    <div className="dst1-step-message">
                      <div className="dst1-step-icon">i</div>
                      <div>
                        <span>Current Step</span>
                        <p>{currentSimulationStep.message}</p>
                      </div>
                    </div>

                    <div className="dst1-navigation">
                      <button
                        className="dst1-nav-btn"
                        disabled={currentStep <= 0}
                        onClick={previousStep}
                      >
                        ← Previous
                      </button>

                      <button
                        className="dst1-nav-btn"
                        disabled={
                          currentStep >= steps.length - 1
                        }
                        onClick={nextStep}
                      >
                        Next →
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* ANALYSIS */}
              <div className="dst1-card dst1-analysis-panel">
                <div className="dst1-panel-heading">
                  Live Analysis
                </div>

                <div className="dst1-analysis-status">
                  <div className="dst1-analysis-dot" />
                  <div>
                    <span>Execution Status</span>
                    <b>
                      {simulationStarted
                        ? currentStep === steps.length - 1
                          ? "Completed"
                          : "Running"
                        : "Ready"}
                    </b>
                  </div>
                </div>

                <div className="dst1-analysis-item">
                  <span>Operation</span>
                  <b>{operation}</b>
                </div>

                <div className="dst1-analysis-item">
                  <span>Elements</span>
                  <b>{arraySize}</b>
                </div>

                <div className="dst1-analysis-item">
                  <span>Current Step</span>
                  <b>
                    {simulationStarted
                      ? `${currentStep + 1}/${steps.length}`
                      : "-"}
                  </b>
                </div>

                <div className="dst1-analysis-item">
                  <span>Complexity</span>
                  <b className="dst1-complexity">
                    {operation === "create"
                      ? "O(n)"
                      : operation === "display"
                      ? "O(n)"
                      : "O(n)"}
                  </b>
                </div>

                <div className="dst1-analysis-box">
                  <span>Observation</span>
                  <p>
                    {currentSimulationStep
                      ? currentSimulationStep.message
                      : "Start the simulation to view live analysis."}
                  </p>
                </div>
              </div>
            </div>

            {/* OBSERVATION */}
            <div className="dst1-card dst1-table-section">
              <div className="dst1-section-heading">
                Observation
              </div>

              {!observations.length ? (
                <div className="dst1-no-observation">
                  No observation recorded yet.
                </div>
              ) : (
                <div className="dst1-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Attempt</th>
                        <th>Operation</th>
                        <th>Input</th>
                        <th>Final Array</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {observations.map((item) => (
                        <tr key={item.attempt}>
                          <td>{item.attempt}</td>
                          <td>{item.operation}</td>
                          <td>{item.input}</td>
                          <td>{item.result}</td>
                          <td>
                            <span className="dst1-success-badge">
                              Successful
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* =====================================================
            PROGRAM TAB
        ===================================================== */}

        {activeTab === "program" && (
          <div className="dst1-program-area">

            {/* PROGRAM OPERATION */}
            <div className="dst1-card dst1-program-dropdown-row">
              <label>Select Program Operation</label>

              <select
                className="dst1-program-dropdown"
                value={progOperation}
                onChange={(e) =>
                  handleProgOperationChange(e.target.value)
                }
              >
                <option value="create">
                  Create Array
                </option>
                <option value="insert">
                  Insert Element
                </option>
                <option value="delete">
                  Delete Element
                </option>
                <option value="display">
                  Display Array
                </option>
              </select>

              <span className="dst1-predefined-badge">
                PREDEFINED PROGRAM
              </span>
            </div>

            <div className="dst1-program-grid">

              {/* LEFT */}
              <div className="dst1-program-left">

                {/* CODE */}
                <div className="dst1-card dst1-code-card">
                  <div className="dst1-section-heading">
                    C Program
                  </div>

                  <div className="dst1-code-header">
                    <span>
                      array_{progOperation}.c
                    </span>
                    <span>READ ONLY</span>
                  </div>

                  <div className="dst1-code dst1-code-lines" ref={codeBoxRef}>
                    {CODE_TEMPLATES[progOperation]
                      .split("\n")
                      .map((text, idx) => (
                        <div
                          key={idx}
                          className={`dst1-code-line ${
                            currentProgramStep &&
                            currentProgramStep.line === idx + 1
                              ? "active"
                              : ""
                          }`}
                        >
                          <span className="dst1-code-ln">{idx + 1}</span>
                          <code>{text ? highlightC(text) : " "}</code>
                        </div>
                      ))}
                  </div>
                </div>

                {/* VARIABLE WATCH */}
                {currentProgramStep && (
                  <div className="dst1-card dst1-watch-card">
                    <div className="dst1-watch-head">
                      <div className="dst1-section-heading">
                        Variable Watch
                      </div>
                      <span>
                        Line {currentProgramStep.line}
                      </span>
                    </div>

                    <table className="dst1-var-table">
                      <thead>
                        <tr>
                          <th>Variable</th>
                          <th>Previous</th>
                          <th>Current</th>
                        </tr>
                      </thead>
                      <tbody>
                        {traceVarKeys.map((key) => {
                          const cur = currentProgramStep.vars[key];
                          const prev = previousProgramStep
                            ? previousProgramStep.vars[key]
                            : "—";
                          const changed = previousProgramStep && prev !== cur;

                          return (
                            <tr key={key} className={changed ? "changed" : ""}>
                              <td>{key}</td>
                              <td>{String(prev)}</td>
                              <td>{String(cur)}</td>
                            </tr>
                          );
                        })}

                        <tr
                          className={
                            previousProgramStep &&
                            previousProgramStep.array.join(",") !==
                              currentProgramStep.array.join(",")
                              ? "changed"
                              : ""
                          }
                        >
                          <td>arr[]</td>
                          <td>
                            {previousProgramStep
                              ? previousProgramStep.array.length
                                ? previousProgramStep.array.join(", ")
                                : "empty"
                              : "—"}
                          </td>
                          <td>
                            {currentProgramStep.array.length
                              ? currentProgramStep.array.join(", ")
                              : "empty"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* INPUT */}
                <div className="dst1-card dst1-program-input">
                  <div className="dst1-section-heading">
                    Program Input
                  </div>

                  {progRunning ? (
                    <div className="dst1-input-summary">
                      <div>
                        <span>Array Size</span>
                        <b>{progArraySize}</b>
                      </div>
                      <div>
                        <span>Elements</span>
                        <b>{progElements.join(", ")}</b>
                      </div>
                      {progOperation === "insert" && (
                        <div>
                          <span>Insert</span>
                          <b>
                            value {progInsertValue} at position{" "}
                            {progInsertIndex}
                          </b>
                        </div>
                      )}
                      {progOperation === "delete" && (
                        <div>
                          <span>Delete</span>
                          <b>position {progDeleteIndex}</b>
                        </div>
                      )}
                      <div className="dst1-program-buttons">
                        <button
                          className="dst1-reset-btn"
                          onClick={resetProgram}
                        >
                          ↻ Reset &amp; Edit Input
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>

                  <label>Array Size</label>

                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={progArraySizeText}
                    onChange={(e) =>
                      handleProgArraySizeChange(e.target.value)
                    }
                    onBlur={(e) => commitProgArraySize(e.target.value)}
                    onKeyUp={handleProgArraySizeKeyUp}
                  />

                  <label>
                    Array Elements ({progArraySize})
                  </label>

                  <div className="dst1-program-elements">
                    {progElements.map((value, index) => (
                      <div
                        className="dst1-program-element"
                        key={index}
                      >
                        <span>arr[{index}]</span>

                        <input
                          value={value}
                          onChange={(e) =>
                            updateProgElement(
                              index,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>

                  {progOperation === "insert" && (
                    <>
                      <label>Insert Value</label>

                      <input
                        value={progInsertValue}
                        onChange={(e) =>
                          setProgInsertValue(e.target.value)
                        }
                        placeholder="Enter value"
                      />

                      <label>Insert Position</label>

                      <input
                        type="number"
                        min="0"
                        max={progArraySize}
                        value={progInsertIndex}
                        onChange={(e) =>
                          setProgInsertIndex(e.target.value)
                        }
                        placeholder="Enter position"
                      />
                    </>
                  )}

                  {progOperation === "delete" && (
                    <>
                      <label>Delete Position</label>

                      <input
                        type="number"
                        min="0"
                        max={progArraySize - 1}
                        value={progDeleteIndex}
                        onChange={(e) =>
                          setProgDeleteIndex(e.target.value)
                        }
                        placeholder="Enter position"
                      />
                    </>
                  )}

                  {progError && (
                    <div className="dst1-error">
                      {progError}
                    </div>
                  )}

                  <div className="dst1-program-buttons">
                    <button
                      className="dst1-primary-btn"
                      onClick={runProgram}
                    >
                      ▶ Run Program
                    </button>

                    <button
                      className="dst1-reset-btn"
                      onClick={resetProgram}
                    >
                      ↻ Reset
                    </button>
                  </div>
                    </>
                  )}
                </div>
              </div>

              {/* RIGHT - EXECUTION */}
              <div className="dst1-card dst1-execution-card">

                <div className="dst1-canvas-header">
                  <div>
                    <div className="dst1-panel-heading">
                      Program Execution
                    </div>
                    <div className="dst1-canvas-subtitle">
                      Execute the predefined C program step-by-step
                    </div>
                  </div>

                  <div className="dst1-step-badge">
                    {progRunning
                      ? `STEP ${progCurrentStep + 1}/${progSteps.length}`
                      : "READY"}
                  </div>
                </div>

                <div className="dst1-live-strip">
                  <div>
                    <span>Operation</span>
                    <b>{progOperation.toUpperCase()}</b>
                  </div>

                  <div>
                    <span>Input Size</span>
                    <b>{progArraySize}</b>
                  </div>

                  <div>
                    <span>Status</span>
                    <b className={progRunning ? "running" : "ready"}>
                      {progCompleted
                        ? "COMPLETED"
                        : progRunning
                        ? "RUNNING"
                        : "READY"}
                    </b>
                  </div>
                </div>

                <div className="dst1-array-stage dst1-program-stage">
                  {currentProgramStep
                    ? renderMemoryVisualizer(
                        currentProgramStep.array,
                        currentProgramStep,
                        "Program Memory"
                      )
                    : renderMemoryVisualizer(
                        [],
                        {},
                        "Program Memory"
                      )}
                </div>

                {currentProgramStep && (
                  <>
                    <div className="dst1-dryrun">
                      <div className="dst1-dryrun-head">
                        <div className="dst1-step-icon">
                          {progCurrentStep + 1}
                        </div>

                        <div>
                          <span>
                            Dry Run · Line {currentProgramStep.line}
                          </span>
                          <p>{currentProgramStep.message}</p>
                        </div>
                      </div>

                      <div className="dst1-dryrun-code">
                        <span>{currentProgramStep.line}</span>
                        <code>{highlightC(currentCodeLine)}</code>
                      </div>

                      {currentProgramStep.explain && (
                        <div className="dst1-dryrun-body">
                          <div className="dst1-dryrun-block">
                            <span className="dst1-dryrun-label">
                              What this line does
                            </span>
                            <p>{currentProgramStep.explain.what}</p>
                          </div>

                          {currentProgramStep.explain.working &&
                            currentProgramStep.explain.working.length > 0 && (
                              <div className="dst1-dryrun-block">
                                <span className="dst1-dryrun-label">
                                  Working (with current values)
                                </span>
                                <ol className="dst1-dryrun-list">
                                  {currentProgramStep.explain.working.map(
                                    (text, k) => (
                                      <li key={k}>{text}</li>
                                    )
                                  )}
                                </ol>
                              </div>
                            )}

                          <div className="dst1-dryrun-block result">
                            <span className="dst1-dryrun-label">Result</span>
                            <p>{currentProgramStep.explain.result}</p>
                          </div>

                          {currentProgramStep.explain.why && (
                            <div className="dst1-dryrun-block why">
                              <span className="dst1-dryrun-label">
                                Why?
                              </span>
                              <p>{currentProgramStep.explain.why}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="dst1-before-after">
                      <div>
                        <span>PREVIOUS STATE</span>
                        <b>
                          {progCurrentStep > 0
                            ? progSteps[
                                progCurrentStep - 1
                              ].array.join(", ")
                            : "Initial"}
                        </b>
                      </div>

                      <div className="dst1-ba-arrow">
                        →
                      </div>

                      <div>
                        <span>CURRENT STATE</span>
                        <b>
                          {currentProgramStep.array.length
                            ? currentProgramStep.array.join(", ")
                            : "Empty"}
                        </b>
                      </div>
                    </div>

                    <div className="dst1-navigation">
                      <button
                        className="dst1-nav-btn"
                        disabled={progCurrentStep <= 0}
                        onClick={progPreviousStep}
                      >
                        ← Previous
                      </button>

                      <button
                        className="dst1-nav-btn"
                        disabled={progCompleted}
                        onClick={() =>
                          setAutoPlay((v) => !v)
                        }
                      >
                        {autoPlay
                          ? "⏸ Pause"
                          : "▶ Auto Play"}
                      </button>

                      <button
                        className="dst1-nav-btn"
                        disabled={progCompleted}
                        onClick={progNextStep}
                      >
                        Next →
                      </button>
                    </div>
                  </>
                )}

                {!progRunning && (
                  <div className="dst1-program-empty">
                    <div>▶</div>
                    <h3>Execution Ready</h3>
                    <p>
                      Enter the required inputs and click
                      Run Program.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* FINAL OUTPUT */}
            {progCompleted && currentProgramStep && (
              <div className="dst1-card dst1-output-card">
                <div className="dst1-section-heading">
                  Program Output
                </div>

                <pre className="dst1-output">
{`Operation : ${progOperation.toUpperCase()}
Input Array : ${progElements.join(" ")}

Output Array : ${
  currentProgramStep.array.length
    ? currentProgramStep.array.join(" ")
    : "Empty"
}

Execution Status : SUCCESS
All program steps completed.`}
                </pre>

                <div className="dst1-output-actions">
                  <button
                    className="dst1-new-btn"
                    onClick={resetProgram}
                  >
                    New Execution
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            QUESTIONS
        ===================================================== */}

        {activeTab === "questions" && (
          <div className="dst1-card dst1-questions-section">
            <div className="dst1-section-heading">
              Questions
            </div>

            <p className="dst1-question-note">
              {showAnswers
                ? "Review your answers below, then use the buttons in the results panel."
                : "Select one correct answer for each question, then click Submit Experiment at the bottom of the page."}
            </p>

            <div className="dst1-question-list">
              {questions.map((question, qIndex) => (
                <div
                  className="dst1-question-card"
                  key={qIndex}
                >
                  <div className="dst1-question-title">
                    {qIndex + 1}. {question.q}
                  </div>

                  <div className="dst1-options">
                    {question.options.map(
                      (option, optionIndex) => {
                        let extraCls = "";

                        if (showAnswers) {
                          if (optionIndex === question.answer) {
                            extraCls = " correct-answer";
                          } else if (answers[qIndex] === optionIndex) {
                            extraCls = " wrong-answer";
                          }
                        }

                        return (
                          <label
                            key={optionIndex}
                            className={`dst1-option ${
                              answers[qIndex] === optionIndex
                                ? "selected"
                                : ""
                            }${extraCls}`}
                          >
                            <input
                              type="radio"
                              name={`q-${qIndex}`}
                              checked={
                                answers[qIndex] === optionIndex
                              }
                              disabled={experimentCompleted}
                              onChange={() =>
                                selectAnswer(
                                  qIndex,
                                  optionIndex
                                )
                              }
                            />

                            <span className="dst1-option-letter">
                              {String.fromCharCode(
                                65 + optionIndex
                              )}
                            </span>

                            <span>{option}</span>
                          </label>
                        );
                      }
                    )}
                  </div>

                  {showAnswers && (
                    <div
                      className={`dst1-question-verdict ${
                        answers[qIndex] === question.answer
                          ? "correct"
                          : "wrong"
                      }`}
                    >
                      {answers[qIndex] === question.answer
                        ? "✓ Correct"
                        : `✕ Incorrect — correct answer is "${question.options[question.answer]}"`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================
            SUBMIT
        ===================================================== */}

        <div className="dst1-submit-section">
          <button
            className="dst1-submit-btn"
            onClick={submitExperiment}
            disabled={experimentCompleted}
          >
            {experimentCompleted
              ? "✓ Submitted"
              : "Submit Experiment"}
          </button>
        </div>

        {/* RESULT (fix #9: score + Try Again / Back to Dashboard / View Answers) */}
        {experimentCompleted && questionResult && (
          <div className="dst1-result-card">
            <div className="dst1-result-top">
              <div className="dst1-result-icon">
                ✓
              </div>

              <div>
                <h3>Experiment Completed Successfully</h3>
                <p>
                  Array simulation, predefined program execution
                  and questions have been completed.
                </p>
              </div>

              <div className="dst1-result-score">
                <b>{questionResult.score}/{questionResult.total}</b>
                <span>Quiz Score</span>
              </div>
            </div>

            <div className="dst1-result-actions">
              <button
                className="dst1-reset-btn"
                onClick={handleTryAgain}
              >
                ↻ Try Again
              </button>

              <button
                className="dst1-back-btn"
                onClick={() => navigate(-1)}
              >
                ← Back to Dashboard
              </button>

              <button
                className="dst1-primary-btn"
                onClick={handleViewAnswers}
              >
                👁 View Answers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DSTExperiment1;