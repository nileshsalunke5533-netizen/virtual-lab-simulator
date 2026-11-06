import React, { useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment2.css";

/* =========================================================
   CONSTANTS
   ========================================================= */

const TECHNIQUES = [
  { key: "bubble", name: "Bubble Sort", desc: "Swap neighbours" },
  { key: "selection", name: "Selection Sort", desc: "Pick the minimum" },
  { key: "insertion", name: "Insertion Sort", desc: "Insert the key" },
  { key: "merge", name: "Merge Sort", desc: "Divide and merge" },
];

const techniqueName = (key) =>
  (TECHNIQUES.find((t) => t.key === key) || TECHNIQUES[0]).name;

const moveLabel = (key) =>
  key === "insertion"
    ? "Shifts"
    : key === "merge"
    ? "Elements Merged"
    : "Swaps";

const COMPLEXITY = {
  bubble: "Average / Worst: O(n²)",
  selection: "Best / Average / Worst: O(n²)",
  insertion: "Best: O(n) · Average / Worst: O(n²)",
  merge: "Best / Average / Worst: O(n log n)",
};

const STEP_LABEL = {
  start: "Getting Started",
  compare: "Comparing",
  swap: "Swapping",
  shift: "Shifting",
  pick: "Choosing",
  place: "Placed",
  divide: "Dividing",
  merge: "Merging",
  done: "Completed",
};

const SPEEDS = [
  { label: "Slow", value: 2200 },
  { label: "Medium", value: 1500 },
  { label: "Fast", value: 900 },
];

const DEFAULT_VALUES = [64, 34, 25, 12, 22, 11, 90, 5, 45, 18];

/* =========================================================
   C PROGRAMS (read-only) AND VARIABLES SHOWN IN THE WATCH
   ========================================================= */

const CODE = {
  bubble: `#include <stdio.h>

int main() {
    int a[10], n, i, j, temp;

    printf("Enter number of elements: ");
    scanf("%d", &n);

    printf("Enter elements: ");
    for(i = 0; i < n; i++)
        scanf("%d", &a[i]);

    for(i = 0; i < n - 1; i++) {
        for(j = 0; j < n - i - 1; j++) {
            if(a[j] > a[j + 1]) {
                temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }

    printf("Sorted array: ");
    for(i = 0; i < n; i++)
        printf("%d ", a[i]);

    return 0;
}`,

  selection: `#include <stdio.h>

int main() {
    int a[10], n, i, j, min, temp;

    printf("Enter number of elements: ");
    scanf("%d", &n);

    printf("Enter elements: ");
    for(i = 0; i < n; i++)
        scanf("%d", &a[i]);

    for(i = 0; i < n - 1; i++) {
        min = i;

        for(j = i + 1; j < n; j++) {
            if(a[j] < a[min])
                min = j;
        }

        if(min != i) {
            temp = a[i];
            a[i] = a[min];
            a[min] = temp;
        }
    }

    printf("Sorted array: ");
    for(i = 0; i < n; i++)
        printf("%d ", a[i]);

    return 0;
}`,

  insertion: `#include <stdio.h>

int main() {
    int a[10], n, i, j, key;

    printf("Enter number of elements: ");
    scanf("%d", &n);

    printf("Enter elements: ");
    for(i = 0; i < n; i++)
        scanf("%d", &a[i]);

    for(i = 1; i < n; i++) {
        key = a[i];
        j = i - 1;

        while(j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }

        a[j + 1] = key;
    }

    printf("Sorted array: ");
    for(i = 0; i < n; i++)
        printf("%d ", a[i]);

    return 0;
}`,

  merge: `#include <stdio.h>

void merge(int a[], int low, int mid, int high) {
    int i = low, j = mid + 1, k = 0;
    int temp[10];

    while(i <= mid && j <= high) {
        if(a[i] <= a[j])
            temp[k++] = a[i++];
        else
            temp[k++] = a[j++];
    }

    while(i <= mid)
        temp[k++] = a[i++];

    while(j <= high)
        temp[k++] = a[j++];

    for(i = low, k = 0; i <= high; i++, k++)
        a[i] = temp[k];
}

void mergeSort(int a[], int low, int high) {
    int mid;

    if(low < high) {
        mid = (low + high) / 2;

        mergeSort(a, low, mid);
        mergeSort(a, mid + 1, high);

        merge(a, low, mid, high);
    }
}

int main() {
    int a[10], n, i;

    printf("Enter number of elements: ");
    scanf("%d", &n);

    printf("Enter elements: ");
    for(i = 0; i < n; i++)
        scanf("%d", &a[i]);

    mergeSort(a, 0, n - 1);

    printf("Sorted array: ");
    for(i = 0; i < n; i++)
        printf("%d ", a[i]);

    return 0;
}`,
};

const VAR_KEYS = {
  bubble: ["n", "i", "j", "temp"],
  selection: ["n", "i", "j", "min", "temp"],
  insertion: ["n", "i", "j", "key"],
  merge: ["low", "mid", "high", "i", "j", "k"],
};

/* find the 1-based line number of the nth line containing a snippet */
const lineOf = (technique, snippet, nth = 0) => {
  const lines = CODE[technique].split("\n");
  let count = -1;

  for (let k = 0; k < lines.length; k++) {
    if (lines[k].includes(snippet)) {
      count++;
      if (count === nth) return k + 1;
    }
  }

  return 0;
};

const resolveLine = (technique, line) => {
  if (!line) return 0;
  const [snippet, nth] = Array.isArray(line) ? line : [line, 0];
  return lineOf(technique, snippet, nth);
};

/* simple C syntax colouring */
const C_TOKEN =
  /(#include\s*<[^>]+>|"(?:[^"\\]|\\.)*"|\b(?:int|void|for|while|if|else|return)\b|\b(?:printf|scanf|main|merge|mergeSort)\b(?=\s*\()|\b\d+\b)/g;

const highlightC = (text) =>
  text.split(C_TOKEN).map((part, k) => {
    if (k % 2 === 0) return part;

    let cls = "dst2-tok-num";
    if (part.startsWith("#")) cls = "dst2-tok-pre";
    else if (part.startsWith('"')) cls = "dst2-tok-str";
    else if (/^(int|void|for|while|if|else|return)$/.test(part))
      cls = "dst2-tok-kw";
    else if (/^(printf|scanf|main|merge|mergeSort)$/.test(part))
      cls = "dst2-tok-fn";

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

/* =========================================================
   QUIZ
   ========================================================= */

const QUESTIONS = [
  {
    q: "Which sorting technique compares two neighbouring elements and swaps them if they are in the wrong order?",
    options: ["Selection Sort", "Bubble Sort", "Merge Sort", "Insertion Sort"],
    answer: 1,
    explain:
      "Bubble Sort looks at each pair of neighbours. Swapping puts a wrong-order pair in the correct order.",
  },
  {
    q: "Which sorting technique finds the minimum element of the unsorted part in every pass?",
    options: ["Bubble Sort", "Insertion Sort", "Selection Sort", "Merge Sort"],
    answer: 2,
    explain:
      "Selection Sort remembers the index of the smallest value (min) and swaps it into the next position.",
  },
  {
    q: "In Insertion Sort, what is the 'key'?",
    options: [
      "The largest element of the array",
      "The element currently being inserted into the sorted part",
      "The first element of the array",
      "An element that is already sorted",
    ],
    answer: 1,
    explain:
      "The key is picked up from the unsorted part and placed at its correct position in the sorted part.",
  },
  {
    q: "After Pass 1 of Bubble Sort (ascending order), which element is at its final position?",
    options: [
      "The smallest element at index 0",
      "The largest element at the last index",
      "The middle element",
      "No element is final yet",
    ],
    answer: 1,
    explain:
      "In every pass the largest remaining element 'bubbles' to the right end and never moves again.",
  },
  {
    q: "Why does Insertion Sort shift larger elements one position to the right?",
    options: [
      "To delete them from the array",
      "To sort them in descending order",
      "To make an empty position for the key",
      "To find the minimum element",
    ],
    answer: 2,
    explain:
      "Shifting creates an empty position. The key is then dropped into that position.",
  },
  {
    q: "Which technique divides the array into halves and then merges the sorted halves?",
    options: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort"],
    answer: 3,
    explain:
      "Merge Sort uses divide and conquer: split, sort each half, then merge the two sorted halves.",
  },
  {
    q: "Selection Sort is applied to [64, 25, 12]. What is the array after the first pass?",
    options: ["[12, 25, 64]", "[25, 64, 12]", "[64, 12, 25]", "[25, 12, 64]"],
    answer: 0,
    explain:
      "The minimum is 12 (index 2). It is swapped with the first element 64, giving [12, 25, 64].",
  },
  {
    q: "In a C program, which index holds the first element of an array?",
    options: ["1", "0", "-1", "n"],
    answer: 1,
    explain: "C arrays start at index 0, so the first element is a[0].",
  },
  {
    q: "After the first comparison in Bubble Sort on [5, 2, 4], what is the array?",
    options: ["[2, 5, 4]", "[5, 4, 2]", "[4, 2, 5]", "[2, 4, 5]"],
    answer: 0,
    explain: "The first pair, 5 and 2, is out of order, so Bubble Sort swaps them.",
  },
  {
    q: "After one complete Bubble Sort pass in ascending order, which value reaches the end?",
    options: ["The smallest unsorted value", "The largest value", "The first value", "The middle value"],
    answer: 1,
    explain: "Adjacent comparisons move the largest remaining value to the right end during a pass.",
  },
  {
    q: "For an array of 6 elements, how many minimum checks are made during the first Selection Sort pass?",
    options: ["4", "5", "6", "12"],
    answer: 1,
    explain: "The first pass compares the starting value with the other 5 values to find the minimum.",
  },
  {
    q: "In Selection Sort, where is the minimum from the unsorted portion placed?",
    options: ["At the end of the array", "At the next position in the sorted portion", "At a random position", "At index n"],
    answer: 1,
    explain: "Each pass places the minimum at the first index of the unsorted portion.",
  },
  {
    q: "At the start of Insertion Sort, which part is considered sorted?",
    options: ["The entire array", "The first element", "The last element", "No part of the array"],
    answer: 1,
    explain: "A single element is already sorted, so the first element starts the sorted portion.",
  },
  {
    q: "In Insertion Sort, if the key is 4 and the sorted portion is [2, 3, 6], what becomes the sorted portion?",
    options: ["[4, 2, 3, 6]", "[2, 3, 4, 6]", "[2, 4, 6, 3]", "[2, 3, 6, 4]"],
    answer: 1,
    explain: "The larger value 6 shifts right, leaving the correct position for key 4.",
  },
  {
    q: "What is the base case for dividing an array in Merge Sort?",
    options: ["The array has one or zero elements", "The array is in descending order", "The array has ten elements", "The array contains duplicates"],
    answer: 0,
    explain: "A one-element or empty array is already sorted and does not need further division.",
  },
  {
    q: "Merging the sorted lists [1, 4] and [2, 3] produces which list?",
    options: ["[1, 4, 2, 3]", "[2, 1, 3, 4]", "[1, 2, 3, 4]", "[4, 3, 2, 1]"],
    answer: 2,
    explain: "Merge Sort repeatedly takes the smaller front value from the two sorted lists.",
  },
  {
    q: "Which technique uses divide and conquer?",
    options: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort"],
    answer: 3,
    explain: "Merge Sort divides the input into smaller parts, sorts them, and merges the results.",
  },
  {
    q: "What is the worst-case time complexity of Merge Sort?",
    options: ["O(1)", "O(log n)", "O(n log n)", "O(n²)"],
    answer: 2,
    explain: "Merge Sort performs O(log n) levels of division and processes O(n) elements per level.",
  },
  {
    q: "Which sorting technique is generally suitable for a small or nearly sorted array?",
    options: ["Insertion Sort", "Merge Sort only", "Selection Sort only", "None of these"],
    answer: 0,
    explain: "Insertion Sort works well on small or nearly sorted inputs because few shifts may be needed.",
  },
  {
    q: "What should be true of the final array after ascending sorting completes?",
    options: ["Each value is no greater than the value after it", "Every value is identical", "The values are in their original order", "The array has no elements"],
    answer: 0,
    explain: "Ascending order means each element is less than or equal to the next element.",
  },
];

/* =========================================================
   STEP GENERATORS
   Every step describes ONE moment of the algorithm:
     cells    : array state, each cell is {id, value} or null (empty slot)
     compare  : indices being compared
     swap     : indices being swapped / moved
     sorted   : indices already in a sorted state
     minIndex : current minimum (selection sort)
     held/hole: the key lifted out of the array (insertion sort)
     range/left/right/merged/consumed : merge sort markers
     what / why / changed / next : the four explanations
     line / vars : used by the Program tab
   ========================================================= */

const STEP_DEFAULTS = {
  type: "start",
  compare: [],
  swap: [],
  sorted: [],
  consumed: [],
  minIndex: null,
  iIndex: null,
  range: null,
  left: null,
  right: null,
  held: null,
  hole: null,
  merged: null,
  arrow: null,
  line: null,
  vars: {},
  what: "",
  why: "",
  changed: "",
  next: "",
};

const toCells = (values) => values.map((value, id) => ({ id, value }));
const range = (from, to) =>
  Array.from({ length: Math.max(0, to - from) }, (_, k) => from + k);
const fmt = (cells) =>
  `[${cells.map((c) => (c ? c.value : "_")).join(", ")}]`;

const blankStep = (cells) => ({ ...STEP_DEFAULTS, cells });

const createRecorder = () => {
  const steps = [];
  const stats = { comparisons: 0, swaps: 0 };
  const vars = {};

  const push = (cells, data) => {
    steps.push({
      ...STEP_DEFAULTS,
      cells: cells.map((c) => (c ? { ...c } : null)),
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      vars: { ...vars },
      ...data,
    });
  };

  return { steps, stats, vars, push };
};

/* ---------------- BUBBLE SORT ---------------- */

const buildBubbleSteps = (input) => {
  const { steps, stats, vars, push } = createRecorder();
  let cells = toCells(input);
  const n = cells.length;
  const sorted = [];
  vars.n = n;

  push(cells, {
    type: "start",
    line: 'scanf("%d", &a[i])',
    what: `We have ${n} number${n > 1 ? "s" : ""} to sort in ascending order (smallest to largest).`,
    why: "Bubble Sort compares two neighbouring numbers at a time and swaps them when they are in the wrong order.",
    changed: "Nothing yet. This is the original array.",
    next:
      n > 1
        ? `We start by comparing ${cells[0].value} and ${cells[1].value}.`
        : "A single number is already sorted.",
  });

  for (let i = 0; i < n - 1; i++) {
    vars.i = i;

    for (let j = 0; j < n - i - 1; j++) {
      vars.j = j;
      const l = cells[j].value;
      const r = cells[j + 1].value;
      const lastPair = j === n - i - 2;
      const willSwap = l > r;
      stats.comparisons++;

      const afterPair = lastPair
        ? `This was the last pair, so pass ${i + 1} ends.`
        : "Then we compare the next pair.";

      push(cells, {
        type: "compare",
        line: "if(a[j] > a[j + 1])",
        compare: [j, j + 1],
        sorted: [...sorted],
        arrow: { at: j, text: "↔", tone: "compare" },
        what: `Compare ${l} and ${r}.`,
        why: willSwap
          ? `${l} is greater than ${r}, so this pair is in the wrong order.`
          : `${l} is not greater than ${r}, so this pair is already in the right order.`,
        changed: "Nothing changes yet. We are only comparing.",
        next: willSwap
          ? `Swap them so the smaller number moves to the left.`
          : `Leave them as they are. ${afterPair}`,
      });

      if (willSwap) {
        vars.temp = l;
        cells = [...cells];
        [cells[j], cells[j + 1]] = [cells[j + 1], cells[j]];
        stats.swaps++;

        push(cells, {
          type: "swap",
          line: "a[j + 1] = temp;",
          swap: [j, j + 1],
          sorted: [...sorted],
          arrow: { at: j, text: "⇄", tone: "swap" },
          what: `Swap ${l} and ${r}.`,
          why: `The bigger number must move towards the right end, so ${l} goes right and ${r} goes left.`,
          changed: `Now ${r} is at index ${j} and ${l} is at index ${j + 1}.`,
          next: lastPair
            ? `This was the last pair, so pass ${i + 1} ends.`
            : "Compare the next pair.",
        });
      }
    }

    const last = n - 1 - i;
    sorted.push(last);

    push(cells, {
      type: "place",
      line: "for(i = 0; i < n - 1",
      sorted: [...sorted],
      what: `Pass ${i + 1} completed. The largest remaining number, ${cells[last].value}, has reached its correct position (index ${last}).`,
      why: "In every pass the biggest unsorted number bubbles to the right end.",
      changed: `Index ${last} is now sorted and will not be touched again.`,
      next:
        i < n - 2
          ? `Start pass ${i + 2} on the first ${last} numbers.`
          : "Only one number is left and it is already in its place.",
    });
  }

  push(cells, {
    type: "done",
    line: 'printf("Sorted array: ");',
    sorted: range(0, n),
    what: "All done! The array is sorted in ascending order.",
    why: "Every pass moved the largest remaining number to its place, so nothing is out of order any more.",
    changed: `Final array: ${fmt(cells)}`,
    next: "Check the Observation table, then try another technique.",
  });

  return steps;
};

/* ---------------- SELECTION SORT ---------------- */

const buildSelectionSteps = (input) => {
  const { steps, stats, vars, push } = createRecorder();
  let cells = toCells(input);
  const n = cells.length;
  vars.n = n;

  push(cells, {
    type: "start",
    line: 'scanf("%d", &a[i])',
    what: `We have ${n} number${n > 1 ? "s" : ""} to sort in ascending order.`,
    why: "Selection Sort finds the smallest number of the unsorted part and puts it at the front of that part.",
    changed: "Nothing yet. This is the original array.",
    next:
      n > 1
        ? "For index 0, we look for the smallest number in the whole array."
        : "A single number is already sorted.",
  });

  for (let i = 0; i < n - 1; i++) {
    vars.i = i;
    let min = i;
    vars.min = min;

    push(cells, {
      type: "pick",
      line: "min = i;",
      minIndex: min,
      iIndex: i,
      sorted: range(0, i),
      what: `Assume ${cells[i].value} (index ${i}) is the smallest.`,
      why: "We need a starting guess for the minimum. We will check the other numbers against it.",
      changed: `min = ${i}. The current minimum is ${cells[i].value}.`,
      next: `Compare ${cells[i].value} with each number on its right.`,
    });

    for (let j = i + 1; j < n; j++) {
      vars.j = j;
      stats.comparisons++;
      const minValue = cells[min].value;
      const jValue = cells[j].value;
      const smaller = jValue < minValue;

      push(cells, {
        type: "compare",
        line: "if(a[j] < a[min])",
        compare: [j],
        minIndex: min,
        iIndex: i,
        sorted: range(0, i),
        what: `Compare ${jValue} (index ${j}) with the current minimum ${minValue} (index ${min}).`,
        why: smaller
          ? `${jValue} is smaller than ${minValue}.`
          : `${jValue} is not smaller than ${minValue}, so the minimum stays the same.`,
        changed: "Nothing changes yet. We are only comparing.",
        next: smaller
          ? `${jValue} becomes the new minimum.`
          : j < n - 1
          ? "Check the next number."
          : "There are no more numbers to check.",
      });

      if (smaller) {
        min = j;
        vars.min = min;

        push(cells, {
          type: "pick",
          line: "min = j;",
          minIndex: min,
          iIndex: i,
          sorted: range(0, i),
          what: `${jValue} is the new minimum.`,
          why: `We remember its index (${j}) so we can swap it into place later.`,
          changed: `min = ${j}. The minimum is now ${jValue}.`,
          next:
            j < n - 1
              ? "Continue checking the remaining numbers."
              : "There are no more numbers to check.",
        });
      }
    }

    const minValue = cells[min].value;

    if (min === i) {
      push(cells, {
        type: "place",
        line: "if(min != i)",
        minIndex: min,
        iIndex: i,
        sorted: range(0, i + 1),
        what: `Minimum element ${minValue} is found. It is already at index ${i}.`,
        why: "The smallest number is already in the correct position, so no swap is needed.",
        changed: `Nothing moves. Index ${i} is now sorted.`,
        next:
          i < n - 2
            ? `Move on to index ${i + 1}.`
            : "Only one number is left and it is already in place.",
      });
    } else {
      push(cells, {
        type: "pick",
        line: "if(min != i)",
        minIndex: min,
        iIndex: i,
        sorted: range(0, i),
        what: `Minimum element ${minValue} is found at index ${min}.`,
        why: `All numbers from index ${i} to ${n - 1} were checked, and ${minValue} is the smallest.`,
        changed: "Nothing changes yet.",
        next: `Swap ${minValue} with ${cells[i].value}, the first unsorted element.`,
      });

      const first = cells[i].value;
      vars.temp = first;
      cells = [...cells];
      [cells[i], cells[min]] = [cells[min], cells[i]];
      stats.swaps++;

      push(cells, {
        type: "swap",
        line: "a[min] = temp;",
        swap: [i, min],
        sorted: range(0, i),
        what: `Swap ${minValue} with ${first}.`,
        why: `${minValue} is the smallest of the unsorted numbers, so it belongs at index ${i}.`,
        changed: `${minValue} is now at index ${i} and ${first} is at index ${min}. Index ${i} is sorted.`,
        next:
          i < n - 2
            ? `Move on to index ${i + 1}.`
            : "Only one number is left and it is already in place.",
      });
    }
  }

  push(cells, {
    type: "done",
    line: 'printf("Sorted array: ");',
    sorted: range(0, n),
    what: "All done! The array is sorted in ascending order.",
    why: "Each position received the smallest remaining number, so the array is in order.",
    changed: `Final array: ${fmt(cells)}`,
    next: "Check the Observation table, then try another technique.",
  });

  return steps;
};

/* ---------------- INSERTION SORT ---------------- */

const buildInsertionSteps = (input) => {
  const { steps, stats, vars, push } = createRecorder();
  let cells = toCells(input);
  const n = cells.length;
  vars.n = n;

  push(cells, {
    type: "start",
    line: "for(i = 1; i < n; i++)",
    sorted: [0],
    what: `We have ${n} number${n > 1 ? "s" : ""} to sort. The first number (${cells[0].value}) is treated as an already sorted part.`,
    why: "Insertion Sort grows a sorted part on the left, one number at a time.",
    changed: "Nothing yet. This is the original array.",
    next:
      n > 1
        ? `Take ${cells[1].value} (index 1) as the key and insert it into the sorted part.`
        : "A single number is already sorted.",
  });

  for (let i = 1; i < n; i++) {
    vars.i = i;
    const key = cells[i];
    vars.key = key.value;
    vars.j = i - 1;

    cells = [...cells];
    cells[i] = null;
    let hole = i;
    let j = i - 1;
    const sortedNow = () => range(0, i + 1).filter((x) => x !== hole);

    push(cells, {
      type: "pick",
      line: "key = a[i];",
      held: key,
      hole,
      sorted: sortedNow(),
      what: `Take ${key.value} (index ${i}) as the key.`,
      why: "The key is lifted out so we can find its correct place inside the sorted part on its left.",
      changed: `Index ${i} is now empty and ${key.value} is held above the array.`,
      next: `Compare the key with ${cells[i - 1].value}, the last number of the sorted part.`,
    });

    while (j >= 0) {
      vars.j = j;
      stats.comparisons++;
      const jValue = cells[j].value;
      const bigger = jValue > key.value;

      push(cells, {
        type: "compare",
        line: "while(j >= 0 && a[j] > key)",
        compare: [j],
        held: key,
        hole,
        sorted: sortedNow(),
        what: `Compare the key ${key.value} with ${jValue} (index ${j}).`,
        why: bigger
          ? `${jValue} is greater than ${key.value}, so ${jValue} must end up to the right of the key.`
          : `${jValue} is not greater than ${key.value}, so the key belongs right after ${jValue}.`,
        changed: "Nothing changes yet. We are only comparing.",
        next: bigger
          ? `Move ${jValue} one position to the right.`
          : `Place the key in the empty position (index ${hole}).`,
      });

      if (!bigger) break;

      const moved = hole;
      cells = [...cells];
      cells[hole] = cells[j];
      cells[j] = null;
      hole = j;
      stats.swaps++;
      j--;
      vars.j = j;

      push(cells, {
        type: "shift",
        line: "a[j + 1] = a[j];",
        swap: [moved],
        held: key,
        hole,
        sorted: sortedNow(),
        arrow: { at: hole, text: "→", tone: "swap" },
        what: `Move ${jValue} one position to the right.`,
        why: "This makes room for the key.",
        changed: `${jValue} moved from index ${hole} to index ${moved}. The empty position is now index ${hole}.`,
        next:
          j >= 0
            ? `Compare the key with ${cells[j].value}.`
            : "We reached the start of the array, so place the key in the empty position.",
      });
    }

    cells = [...cells];
    cells[hole] = key;

    push(cells, {
      type: "place",
      line: "a[j + 1] = key;",
      sorted: range(0, i + 1),
      what: `Place ${key.value} in the empty position (index ${hole}).`,
      why:
        hole === i
          ? "The key is already greater than or equal to its left neighbour, so it stays where it was."
          : "All bigger numbers have moved right, so this is the key's correct position.",
      changed: `The sorted part now has ${i + 1} numbers: ${fmt(cells.slice(0, i + 1))}.`,
      next:
        i < n - 1
          ? `Take the next number (index ${i + 1}) as the key.`
          : "All numbers have been inserted.",
    });
  }

  push(cells, {
    type: "done",
    line: 'printf("Sorted array: ");',
    sorted: range(0, n),
    what: "All done! The array is sorted in ascending order.",
    why: "Every number was inserted into its correct place in the sorted part.",
    changed: `Final array: ${fmt(cells)}`,
    next: "Check the Observation table, then try another technique.",
  });

  return steps;
};

/* ---------------- MERGE SORT ---------------- */

const buildMergeSteps = (input) => {
  const { steps, stats, vars, push } = createRecorder();
  let cells = toCells(input);
  const n = cells.length;
  let runs = [];

  const sortedFromRuns = () => runs.flatMap(([a, b]) => range(a, b + 1));

  push(cells, {
    type: "start",
    line: "mergeSort(a, 0, n - 1);",
    what: `We have ${n} number${n > 1 ? "s" : ""} to sort in ascending order.`,
    why: "Merge Sort uses divide and conquer: split the array into small parts, sort each part, then merge the sorted parts.",
    changed: "Nothing yet. This is the original array.",
    next:
      n > 1
        ? "First we divide the array into two parts."
        : "A single number is already sorted.",
  });

  const mergeSort = (lo, hi) => {
    if (lo >= hi) return;

    const mid = Math.floor((lo + hi) / 2);
    Object.assign(vars, { low: lo, mid, high: hi });

    push(cells, {
      type: "divide",
      line: "mid = (low + high) / 2;",
      range: [lo, hi],
      left: [lo, mid],
      right: [mid + 1, hi],
      sorted: sortedFromRuns(),
      what: `Divide the array into two parts.`,
      why: `Left part: positions ${lo} to ${mid}. Right part: positions ${mid + 1} to ${hi}. Small parts are easier to sort.`,
      changed: "The numbers do not move. We only mark the two parts.",
      next: "Sort the left part first.",
    });

    const recurse = (a, b, side) => {
      Object.assign(vars, { low: lo, mid, high: hi });
      const single = a === b;

      push(cells, {
        type: "divide",
        line: single
          ? "if(low < high)"
          : side === "left"
          ? "mergeSort(a, low, mid);"
          : "mergeSort(a, mid + 1, high);",
        range: [a, b],
        sorted: sortedFromRuns(),
        what: single
          ? `The ${side} part has only one number (${cells[a].value}), so it is already sorted.`
          : `Now sort the ${side} part (positions ${a} to ${b}).`,
        why: single
          ? "A part with a single number cannot be out of order."
          : "We repeat the same divide step on this smaller part.",
        changed: "The numbers do not move.",
        next: single
          ? side === "left"
            ? "Now sort the right part."
            : "Both parts are ready, so we can merge them."
          : "Divide this part again.",
      });

      mergeSort(a, b);
    };

    recurse(lo, mid, "left");
    recurse(mid + 1, hi, "right");

    /* ---- merge the two sorted parts ---- */
    Object.assign(vars, { low: lo, mid, high: hi });
    const L = cells.slice(lo, mid + 1);
    const R = cells.slice(mid + 1, hi + 1);
    const total = hi - lo + 1;
    const merged = [];
    const consumed = [];
    let li = 0;
    let ri = 0;

    const mergedInfo = (just) => ({
      start: lo,
      size: total,
      values: merged.map((c) => c.value),
      just,
    });

    vars.i = lo;
    vars.j = mid + 1;
    vars.k = 0;

    push(cells, {
      type: "merge",
      line: "int i = low, j = mid + 1, k = 0;",
      range: [lo, hi],
      left: [lo, mid],
      right: [mid + 1, hi],
      merged: mergedInfo(false),
      sorted: sortedFromRuns(),
      what: `Merge the two sorted parts [${L.map((c) => c.value).join(", ")}] and [${R
        .map((c) => c.value)
        .join(", ")}].`,
      why: "Both parts are sorted, so the smallest number of each part is at its front. We only compare those two.",
      changed: "An empty merged result is prepared.",
      next: "Compare the first number of each part.",
    });

    while (li < L.length && ri < R.length) {
      const lp = lo + li;
      const rp = mid + 1 + ri;
      const lv = L[li].value;
      const rv = R[ri].value;
      const takeLeft = lv <= rv;
      const pick = takeLeft ? L[li] : R[ri];

      stats.comparisons++;
      stats.swaps++;
      merged.push(pick);

      if (takeLeft) {
        consumed.push(lp);
        li++;
      } else {
        consumed.push(rp);
        ri++;
      }

      vars.i = lo + li;
      vars.j = mid + 1 + ri;
      vars.k = merged.length;

      const more = li < L.length && ri < R.length;

      push(cells, {
        type: "merge",
        line: takeLeft
          ? ["temp[k++] = a[i++];", 0]
          : ["temp[k++] = a[j++];", 0],
        compare: [lp, rp],
        consumed: [...consumed],
        range: [lo, hi],
        left: [lo, mid],
        right: [mid + 1, hi],
        merged: mergedInfo(true),
        sorted: sortedFromRuns(),
        what: `Compare the front numbers: ${lv} (left) and ${rv} (right).`,
        why: takeLeft
          ? `${lv} is ${lv === rv ? "equal to" : "smaller than"} ${rv}, so ${lv} goes into the merged result first.`
          : `${rv} is smaller than ${lv}, so ${rv} goes into the merged result first.`,
        changed: `${pick.value} is placed at position ${merged.length - 1} of the merged result.`,
        next: more
          ? "Compare the next two front numbers."
          : li < L.length
          ? "The right part is empty, so copy the rest of the left part."
          : ri < R.length
          ? "The left part is empty, so copy the rest of the right part."
          : "Copy the merged result back into the array.",
      });
    }

    while (li < L.length) {
      const p = lo + li;
      const v = L[li].value;
      merged.push(L[li]);
      consumed.push(p);
      li++;
      stats.swaps++;
      vars.i = lo + li;
      vars.k = merged.length;

      push(cells, {
        type: "merge",
        line: ["temp[k++] = a[i++];", 1],
        compare: [p],
        consumed: [...consumed],
        range: [lo, hi],
        left: [lo, mid],
        right: [mid + 1, hi],
        merged: mergedInfo(true),
        sorted: sortedFromRuns(),
        what: `The right part is empty, so copy ${v} from the left part.`,
        why: "The remaining numbers of this part are already in order, so they can be copied as they are.",
        changed: `${v} is placed at position ${merged.length - 1} of the merged result.`,
        next:
          li < L.length
            ? "Copy the next number."
            : "Copy the merged result back into the array.",
      });
    }

    while (ri < R.length) {
      const p = mid + 1 + ri;
      const v = R[ri].value;
      merged.push(R[ri]);
      consumed.push(p);
      ri++;
      stats.swaps++;
      vars.j = mid + 1 + ri;
      vars.k = merged.length;

      push(cells, {
        type: "merge",
        line: ["temp[k++] = a[j++];", 1],
        compare: [p],
        consumed: [...consumed],
        range: [lo, hi],
        left: [lo, mid],
        right: [mid + 1, hi],
        merged: mergedInfo(true),
        sorted: sortedFromRuns(),
        what: `The left part is empty, so copy ${v} from the right part.`,
        why: "The remaining numbers of this part are already in order, so they can be copied as they are.",
        changed: `${v} is placed at position ${merged.length - 1} of the merged result.`,
        next:
          ri < R.length
            ? "Copy the next number."
            : "Copy the merged result back into the array.",
      });
    }

    /* ---- write the merged result back ---- */
    cells = [...cells];
    merged.forEach((c, k) => {
      cells[lo + k] = c;
    });
    runs = runs.filter(([a, b]) => !(a >= lo && b <= hi));
    runs.push([lo, hi]);
    vars.i = hi;
    vars.k = total - 1;

    push(cells, {
      type: "place",
      line: "a[i] = temp[k];",
      range: [lo, hi],
      sorted: sortedFromRuns(),
      what: `Copy the merged result back. Positions ${lo} to ${hi} are now sorted.`,
      why: "The merged result replaces the two old parts in the array.",
      changed: `Positions ${lo} to ${hi} now hold ${fmt(cells.slice(lo, hi + 1))}.`,
      next:
        lo === 0 && hi === n - 1
          ? "The whole array is sorted."
          : "Continue with the next part.",
    });
  };

  mergeSort(0, n - 1);

  push(cells, {
    type: "done",
    line: 'printf("Sorted array: ");',
    sorted: range(0, n),
    what: "All done! The array is sorted in ascending order.",
    why: "Every small sorted part was merged into bigger sorted parts until one sorted array remained.",
    changed: `Final array: ${fmt(cells)}`,
    next: "Check the Observation table, then try another technique.",
  });

  return steps;
};

const generateSteps = (values, technique) => {
  switch (technique) {
    case "selection":
      return buildSelectionSteps(values);
    case "insertion":
      return buildInsertionSteps(values);
    case "merge":
      return buildMergeSteps(values);
    default:
      return buildBubbleSteps(values);
  }
};

/* =========================================================
   HOOKS
   ========================================================= */

/* Array size + elements with validation. Shared by Simulation and Program tabs. */
const invalidIndexes = (elements) => {
  const bad = [];

  elements.forEach((e, i) => {
    const t = String(e).trim();
    if (!/^-?\d+$/.test(t) || Math.abs(Number(t)) > 999) bad.push(i);
  });

  return bad;
};

const useArrayInput = (onEdit) => {
  const [size, setSize] = useState(6);
  const [sizeText, setSizeText] = useState("6");
  const [elements, setElements] = useState(
    DEFAULT_VALUES.slice(0, 6).map(String)
  );
  const [sizeError, setSizeError] = useState("");
  const [elementError, setElementError] = useState("");
  const [badIdx, setBadIdx] = useState([]);

  const touch = () => {
    if (onEdit) onEdit();
  };

  const changeSizeText = (raw) => {
    setSizeText(raw);

    if (raw.trim() === "") {
      setSizeError("Enter the array size (1 to 10).");
      return;
    }

    const v = Number(raw);

    if (!Number.isInteger(v) || v < 1 || v > 10) {
      setSizeError("Array size must be a whole number from 1 to 10.");
      return;
    }

    setSizeError("");
    setSize(v);
    setElements((old) => {
      const next = old.slice(0, v);
      while (next.length < v) {
        const d = DEFAULT_VALUES[next.length];
        next.push(String(d !== undefined ? d : (next.length + 1) * 10));
      }
      return next;
    });
    setBadIdx([]);
    setElementError("");
    touch();
  };

  const blurSize = () => {
    if (sizeError) {
      setSizeText(String(size));
      setSizeError("");
    }
  };

  const changeElement = (index, value) => {
    setElements((old) => {
      const next = [...old];
      next[index] = value;
      return next;
    });
    setBadIdx((old) => old.filter((x) => x !== index));
    setElementError("");
    touch();
  };

  const validate = () => {
    if (sizeError) return false;

    const bad = invalidIndexes(elements);

    if (bad.length) {
      setBadIdx(bad);
      setElementError(
        `Enter a whole number from -999 to 999 in ${
          bad.length === 1 ? "the highlighted box" : "every highlighted box"
        }.`
      );
      return false;
    }

    setBadIdx([]);
    setElementError("");
    return true;
  };

  const getValues = () => elements.map((e) => Number(String(e).trim()));

  const peekValues = () =>
    sizeError || invalidIndexes(elements).length ? null : getValues();

  return {
    size,
    sizeText,
    elements,
    sizeError,
    elementError,
    badIdx,
    changeSizeText,
    blurSize,
    changeElement,
    validate,
    getValues,
    peekValues,
  };
};

/* FLIP animation: remember where every box was, then slide it from there. */
const useFlip = (duration) => {
  const nodes = useRef({});
  const before = useRef({});

  const capture = useCallback(() => {
    const snap = {};

    Object.keys(nodes.current).forEach((id) => {
      const r = nodes.current[id].getBoundingClientRect();
      snap[id] = { left: r.left, top: r.top };
    });

    before.current = snap;
  }, []);

  const setRef = useCallback(
    (id) => (node) => {
      if (node) nodes.current[id] = node;
      else delete nodes.current[id];
    },
    []
  );

  useLayoutEffect(() => {
    const old = before.current;
    before.current = {};

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) return;

    Object.keys(nodes.current).forEach((id) => {
      const node = nodes.current[id];
      const o = old[id];
      if (!node || !o) return;

      const r = node.getBoundingClientRect();
      const dx = o.left - r.left;
      const dy = o.top - r.top;

      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

      node.style.transition = "none";
      node.style.transform = `translate(${dx}px, ${dy}px)`;
      node.style.zIndex = "6";
      node.getBoundingClientRect(); // force reflow before animating

      requestAnimationFrame(() => {
        node.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        node.style.transform = "translate(0, 0)";

        const done = (ev) => {
          if (ev && ev.propertyName !== "transform") return;
          node.style.transition = "";
          node.style.transform = "";
          node.style.zIndex = "";
          node.removeEventListener("transitionend", done);
        };

        node.addEventListener("transitionend", done);
      });
    });
  });

  return { capture, setRef };
};

/* =========================================================
   SMALL VIEW COMPONENTS
   ========================================================= */

const sizeFor = (n) =>
  n <= 6
    ? { cell: 64, gap: 26 }
    : n <= 8
    ? { cell: 56, gap: 20 }
    : { cell: 48, gap: 14 };

const ExplainBlocks = ({ step }) => (
  <div className="dst2-explain">
    <div className="dst2-explain-row">
      <span>Why?</span>
      <p>{step.why}</p>
    </div>
    <div className="dst2-explain-row">
      <span>What changed?</span>
      <p>{step.changed}</p>
    </div>
    <div className="dst2-explain-row next">
      <span>What next?</span>
      <p>{step.next}</p>
    </div>
  </div>
);

const SortStage = ({ step, technique, setRef }) => {
  const n = step.cells.length;
  const size = sizeFor(n);
  const inside = (r, i) => !!r && i >= r[0] && i <= r[1];
  const hasSplit = !!(step.left && step.right);

  const tagsFor = (i) => {
    const tags = [];

    if (technique === "selection") {
      if (step.iIndex === i) tags.push({ text: "i", tone: "plain" });
      if (step.minIndex === i) tags.push({ text: "min", tone: "active" });
      if (step.compare.includes(i) && step.minIndex !== i)
        tags.push({ text: "j", tone: "compare" });
      if (step.swap.includes(i)) tags.push({ text: "swap", tone: "swap" });
    } else if (technique === "bubble") {
      if (step.swap.includes(i)) {
        tags.push({ text: "swap", tone: "swap" });
      } else if (step.compare.length === 2) {
        if (i === step.compare[0]) tags.push({ text: "j", tone: "compare" });
        if (i === step.compare[1]) tags.push({ text: "j+1", tone: "compare" });
      }
    } else if (technique === "insertion") {
      if (step.held && step.hole === i)
        tags.push({ text: "key", tone: "active" });
      if (step.swap.includes(i)) tags.push({ text: "moved", tone: "swap" });
      else if (step.compare.includes(i))
        tags.push({ text: "j", tone: "compare" });
    } else if (step.compare.length === 2) {
      if (i === step.compare[0]) tags.push({ text: "L", tone: "compare" });
      if (i === step.compare[1]) tags.push({ text: "R", tone: "compare" });
    } else if (step.compare.length === 1 && step.compare[0] === i) {
      tags.push({ text: "copy", tone: "compare" });
    }

    return tags;
  };

  return (
    <div
      className={`dst2-stage tech-${technique}`}
      style={{
        "--cell-size": `${size.cell}px`,
        "--gap-size": `${size.gap}px`,
      }}
    >
      <div className="dst2-cells-row">
        {step.cells.map((c, i) => {
          const cls = ["dst2-cell"];

          if (!c) {
            cls.push("hole");
          } else {
            if (step.sorted.includes(i)) cls.push("sorted");
            if (step.consumed.includes(i)) cls.push("used");
            if (step.compare.includes(i)) cls.push("compare");
            if (step.minIndex === i) cls.push("active");
            if (step.swap.includes(i)) cls.push("swap");
          }

          const dimmed = !!step.range && !inside(step.range, i);
          const partCls = inside(step.left, i)
            ? "left"
            : inside(step.right, i)
            ? "right"
            : "";
          const partLabel =
            step.left && i === step.left[0]
              ? "Left"
              : step.right && i === step.right[0]
              ? "Right"
              : "";
          const arrow = step.arrow;

          return (
            <React.Fragment key={i}>
              <div className={`dst2-cell-col ${dimmed ? "dim" : ""}`}>
                <div className="dst2-pointer-slot">
                  {tagsFor(i).map((t, k) => (
                    <span key={k} className={`dst2-pointer-tag ${t.tone}`}>
                      {t.text}
                    </span>
                  ))}
                </div>

                {technique === "insertion" && (
                  <div className="dst2-lift-slot">
                    {step.held && step.hole === i && (
                      <div
                        ref={setRef(step.held.id)}
                        className="dst2-cell active key-float"
                      >
                        <strong>{step.held.value}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div
                  ref={c ? setRef(c.id) : undefined}
                  className={cls.join(" ")}
                >
                  {c && <strong>{c.value}</strong>}
                </div>

                <div className="dst2-cell-index">index {i}</div>

                {technique === "merge" && (
                  <div className={`dst2-part ${partCls}`}>{partLabel}</div>
                )}
              </div>

              {i < n - 1 && (
                <div className="dst2-gap">
                  <div className="dst2-pointer-slot" />
                  {technique === "insertion" && (
                    <div className="dst2-lift-slot" />
                  )}
                  <div className="dst2-gap-body">
                    {arrow && arrow.at === i && (
                      <span className={`dst2-gap-arrow ${arrow.tone}`}>
                        {arrow.text}
                      </span>
                    )}
                    {hasSplit && step.left[1] === i && (
                      <span className="dst2-divider" />
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {technique === "merge" && (
        <>
          <div
            className={`dst2-merged-label ${step.merged ? "" : "is-empty"}`}
          >
            Merged result (temporary array)
          </div>

          <div
            className={`dst2-cells-row dst2-merged-row ${
              step.merged ? "" : "is-empty"
            }`}
          >
            {step.cells.map((_, i) => {
              const m = step.merged;
              const k = m ? i - m.start : -1;
              const inM = m && k >= 0 && k < m.size;
              const filled = inM && k < m.values.length;
              const latest = filled && m.just && k === m.values.length - 1;

              return (
                <React.Fragment key={i}>
                  <div className="dst2-cell-col">
                    {inM ? (
                      <div
                        className={`dst2-cell small ${
                          filled ? "filled" : "empty"
                        } ${latest ? "active" : ""}`}
                      >
                        {filled && <strong>{m.values[k]}</strong>}
                      </div>
                    ) : (
                      <div className="dst2-cell small spacer" />
                    )}
                  </div>
                  {i < n - 1 && <div className="dst2-gap-plain" />}
                </React.Fragment>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const Legend = ({ technique }) => (
  <div className="dst2-legend">
    <span className="dst2-legend-item">
      <span className="dst2-swatch normal" />
      Normal
    </span>
    <span className="dst2-legend-item">
      <span className="dst2-swatch compare" />
      Comparing
    </span>
    <span className="dst2-legend-item">
      <span className="dst2-swatch active" />
      {technique === "insertion"
        ? "Key"
        : technique === "selection"
        ? "Minimum"
        : technique === "merge"
        ? "Merged value"
        : "Active"}
    </span>
    <span className="dst2-legend-item">
      <span className="dst2-swatch swap" />
      {technique === "insertion" ? "Shifting" : "Swapping"}
    </span>
    <span className="dst2-legend-item">
      <span className="dst2-swatch sorted" />
      Sorted
    </span>
  </div>
);

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

const DSTExperiment2 = () => {
  const navigate = useNavigate();

  /* ---------------- COMMON ---------------- */
  const [activeTab, setActiveTab] = useState("simulation");
  const [showTheory, setShowTheory] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  /* ---------------- SIMULATION ---------------- */
  const [technique, setTechnique] = useState("bubble");
  const [steps, setSteps] = useState([]);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const [runInput, setRunInput] = useState("");
  const [observations, setObservations] = useState([]);
  const recordedRef = useRef(false);

  const resetSimulation = () => {
    setSteps([]);
    setCurrent(0);
    setStarted(false);
    setPlaying(false);
    recordedRef.current = false;
  };

  /* ---------------- PROGRAM ---------------- */
  const [progTechnique, setProgTechnique] = useState("bubble");
  const [progSteps, setProgSteps] = useState([]);
  const [progCurrent, setProgCurrent] = useState(0);
  const [progRunning, setProgRunning] = useState(false);
  const [progAuto, setProgAuto] = useState(false);
  const [progInputText, setProgInputText] = useState("");
  const [programDone, setProgramDone] = useState(false);
  const codeBoxRef = useRef(null);

  const resetProgram = () => {
    setProgSteps([]);
    setProgCurrent(0);
    setProgRunning(false);
    setProgAuto(false);
  };

  const simInput = useArrayInput(resetSimulation);
  const progInput = useArrayInput(resetProgram);
  const simFlip = useFlip(Math.round(speed * 0.4));
  const progFlip = useFlip(600);

  /* ---------------- QUIZ + SUBMIT ---------------- */
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [experimentDone, setExperimentDone] = useState(false);

  /* =========================================================
     SIMULATION CONTROLS
  ========================================================= */

  const selectTechnique = (key) => {
    setTechnique(key);
    resetSimulation();
  };

  const startSimulation = () => {
    if (!simInput.validate()) return;

    const values = simInput.getValues();

    setSteps(generateSteps(values, technique));
    setRunInput(values.join(", "));
    setCurrent(0);
    setStarted(true);
    setPlaying(false);
    recordedRef.current = false;
  };

  const recordObservation = () => {
    if (recordedRef.current || !steps.length) return;
    recordedRef.current = true;

    const last = steps[steps.length - 1];

    setObservations((old) => [
      ...old,
      {
        id: `${Date.now()}-${old.length}`,
        technique,
        input: runInput,
        output: last.cells.map((c) => c.value).join(", "),
        comparisons: last.comparisons,
        moves: last.swaps,
      },
    ]);
  };

  const goTo = (index) => {
    if (!steps.length) return;

    const target = Math.max(0, Math.min(steps.length - 1, index));
    if (target === current) return;

    simFlip.capture();
    setCurrent(target);

    if (target === steps.length - 1) recordObservation();
  };

  const nextStep = () => {
    setPlaying(false);
    goTo(current + 1);
  };

  const previousStep = () => {
    setPlaying(false);
    goTo(current - 1);
  };

  const restartSimulation = () => {
    setPlaying(false);
    simFlip.capture();
    setCurrent(0);
  };

  const completed = started && steps.length > 0 && current === steps.length - 1;

  const togglePlay = () => {
    if (!started) return;

    if (completed) {
      simFlip.capture();
      setCurrent(0);
      setPlaying(true);
      return;
    }

    setPlaying((p) => !p);
  };

  useEffect(() => {
    if (!playing || !started) return undefined;

    if (current >= steps.length - 1) {
      setPlaying(false);
      return undefined;
    }

    const timer = setTimeout(() => goTo(current + 1), speed);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, current, steps, started, speed]);

  /* =========================================================
     PROGRAM CONTROLS
  ========================================================= */

  const runProgram = () => {
    if (!progInput.validate()) return;

    const values = progInput.getValues();

    setProgSteps(generateSteps(values, progTechnique));
    setProgInputText(values.join(" "));
    setProgCurrent(0);
    setProgRunning(true);
    setProgAuto(false);
  };

  const progGoTo = (index) => {
    if (!progSteps.length) return;

    const target = Math.max(0, Math.min(progSteps.length - 1, index));
    if (target === progCurrent) return;

    progFlip.capture();
    setProgCurrent(target);

    if (target === progSteps.length - 1) setProgramDone(true);
  };

  const progCompleted =
    progRunning && progSteps.length > 0 && progCurrent === progSteps.length - 1;

  useEffect(() => {
    if (!progAuto || !progRunning) return undefined;

    if (progCurrent >= progSteps.length - 1) {
      setProgAuto(false);
      return undefined;
    }

    const timer = setTimeout(() => progGoTo(progCurrent + 1), 1400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progAuto, progCurrent, progSteps, progRunning]);

  const progStep = progRunning ? progSteps[progCurrent] : null;
  const progPrev = progRunning && progCurrent > 0 ? progSteps[progCurrent - 1] : null;
  const progLine = progStep ? resolveLine(progTechnique, progStep.line) : 0;

  useEffect(() => {
    scrollActiveInto(codeBoxRef.current, ".dst2-code-line.active");
  }, [progCurrent, progSteps]);

  /* =========================================================
     QUIZ + FINAL SUBMIT
  ========================================================= */

  const quizScore = QUESTIONS.reduce(
    (score, question, index) =>
      score + (answers[index] === question.answer ? 1 : 0),
    0
  );

  const selectAnswer = (qIndex, optionIndex) => {
    if (quizSubmitted) return;
    setAnswers((old) => ({ ...old, [qIndex]: optionIndex }));
  };

  const retryQuiz = () => {
    setAnswers({});
    setQuizSubmitted(false);
  };

  const submitExperiment = () => {
    if (!observations.length) {
      setSubmitError(
        "Run a sorting simulation to its last step first (Simulation tab)."
      );
      return;
    }

    if (!programDone) {
      setSubmitError(
        "Run the program to its last step first (Program tab)."
      );
      return;
    }

    if (Object.keys(answers).length !== QUESTIONS.length) {
      setSubmitError(`Please answer all ${QUESTIONS.length} questions in the Quiz tab.`);
      setActiveTab("quiz");
      return;
    }

    setSubmitError("");
    setQuizSubmitted(true);
    setExperimentDone(true);

    const resultData = buildDstResult({
      experimentNo: 2,
      experimentName:
        "Sorting Techniques: Bubble, Insertion, Selection and Merge Sort",
      questionList: QUESTIONS,
      selectedAnswers: answers,
      observations,
    });

    try {
      localStorage.setItem(
        "DSTExperiment2Result",
        JSON.stringify({
          observations,
          quizScore,
          total: QUESTIONS.length,
          completed: true,
        })
      );
      localStorage.setItem("assignmentResult", JSON.stringify(resultData));
    } catch (e) {
      /* storage not available - ignore */
    }

    navigate("/result", { state: resultData });
  };

  const tryAgain = () => {
    resetSimulation();
    setObservations([]);
    resetProgram();
    setProgramDone(false);
    retryQuiz();
    setExperimentDone(false);
    setSubmitError("");
    setActiveTab("simulation");
  };

  /* =========================================================
     DERIVED VALUES FOR RENDER
  ========================================================= */

  const simStep = started ? steps[current] : null;
  const simPrevStep = started && current > 0 ? steps[current - 1] : null;
  const previewValues = !started ? simInput.peekValues() : null;
  const stageStep =
    simStep || (previewValues ? blankStep(toCells(previewValues)) : null);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dst2-root">
      <div className="dst2-container">
        {/* HEADER */}
        <header className="dst2-exp-header">
          <button className="dst2-back-btn" onClick={() => navigate("/dst-experiments")}>
            ← Back
          </button>

          <h1>Experiment 2 : Sorting Techniques</h1>

          <button
            className="dst2-help-btn"
            onClick={() => setShowHelp(true)}
          >
            ? Help
          </button>
        </header>

        {showHelp && (
          <div
            className="dst2-help-overlay"
            onClick={() => setShowHelp(false)}
          >
            <section
              aria-labelledby="dst2-help-title"
              aria-modal="true"
              className="dst2-card dst2-help-box"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dst2-help-head">
                <h2 id="dst2-help-title">How to Use This Experiment</h2>
                <button
                  aria-label="Close help"
                  className="dst2-help-close"
                  onClick={() => setShowHelp(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <ol>
                <li><b>Simulation:</b> choose a sorting technique, enter numbers, and step through or play the visualizer.</li>
                <li><b>Program:</b> choose a technique, enter the same input, and follow the C program execution.</li>
                <li><b>Quiz:</b> select one answer for each of the 20 questions.</li>
                <li><b>Submit Experiment:</b> complete the simulation and program, answer every quiz question, then submit to see your score.</li>
              </ol>
              <button
                className="dst2-primary-btn dst2-help-done"
                onClick={() => setShowHelp(false)}
                type="button"
              >
                Got it
              </button>
            </section>
          </div>
        )}

        {/* AIM */}
        <div className="dst2-card dst2-aim-card">
          <div className="dst2-card-title">Aim</div>
          <p>To implement different sorting techniques to sort the given elements.</p>
        </div>

        {/* THEORY */}
        <div className="dst2-card dst2-collapse-card">
          <button
            className="dst2-collapse-header"
            onClick={() => setShowTheory(!showTheory)}
          >
            <span>Theory</span>
            <span>{showTheory ? "▲" : "▼"}</span>
          </button>

          {showTheory && (
            <div className="dst2-collapse-content">
              <p>
                Sorting means arranging data in a particular order, usually
                ascending (smallest to largest). Four basic techniques are:
              </p>
              <ul>
                <li>
                  <b>Bubble Sort:</b> compares neighbouring elements and swaps
                  them if they are in the wrong order. The largest element
                  moves to the end in every pass.
                </li>
                <li>
                  <b>Selection Sort:</b> finds the minimum element of the
                  unsorted part and swaps it into the next position.
                </li>
                <li>
                  <b>Insertion Sort:</b> takes one element (the key) and
                  inserts it at the correct place in the sorted part by
                  shifting larger elements to the right.
                </li>
                <li>
                  <b>Merge Sort:</b> divides the array into halves, sorts each
                  half and merges the two sorted halves.
                </li>
              </ul>

              <div className="dst2-complexity-box">
                <span>
                  <b>Bubble:</b> O(n²)
                </span>
                <span>
                  <b>Selection:</b> O(n²)
                </span>
                <span>
                  <b>Insertion:</b> O(n²), best O(n)
                </span>
                <span>
                  <b>Merge:</b> O(n log n)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* PROCEDURE */}
        <div className="dst2-card dst2-collapse-card">
          <button
            className="dst2-collapse-header"
            onClick={() => setShowProcedure(!showProcedure)}
          >
            <span>Procedure</span>
            <span>{showProcedure ? "▲" : "▼"}</span>
          </button>

          {showProcedure && (
            <div className="dst2-collapse-content">
              <ol>
                <li>Select a sorting technique.</li>
                <li>Enter the array size (1 to 10) and the array elements.</li>
                <li>Click Start Simulation.</li>
                <li>
                  Press Next to move one step at a time, or press Play. Read
                  the &quot;What&apos;s Happening Now&quot; panel at every step.
                </li>
                <li>Continue until the array is completely sorted.</li>
                <li>
                  Open the Program tab and run the C program line by line.
                </li>
                <li>Answer the Quiz and click Submit Experiment.</li>
              </ol>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="dst2-tabs">
          {[
            ["simulation", "Simulation"],
            ["program", "Program"],
            ["quiz", "Quiz"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`dst2-tab ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* =====================================================
            SIMULATION TAB
        ===================================================== */}
        {activeTab === "simulation" && (
          <>
            <div className="dst2-sim-row">
              {/* INPUT PANEL */}
              <div className="dst2-card dst2-input-panel">
                <div className="dst2-panel-heading">Input Panel</div>

                <div className="dst2-field-label caps">
                  Select Sorting Technique
                </div>

                <div className="dst2-technique-list">
                  {TECHNIQUES.map((t) => (
                    <button
                      key={t.key}
                      className={`dst2-technique ${
                        technique === t.key ? "active" : ""
                      }`}
                      onClick={() => selectTechnique(t.key)}
                    >
                      <b>{t.name}</b>
                      <small>{t.desc}</small>
                    </button>
                  ))}
                </div>

                <label className="dst2-field-label" htmlFor="dst2-sim-size">
                  Array Size (1 to 10)
                </label>
                <input
                  id="dst2-sim-size"
                  className={`dst2-text-input ${
                    simInput.sizeError ? "bad" : ""
                  }`}
                  type="number"
                  min="1"
                  max="10"
                  value={simInput.sizeText}
                  onChange={(e) => simInput.changeSizeText(e.target.value)}
                  onBlur={simInput.blurSize}
                />
                {simInput.sizeError && (
                  <div className="dst2-field-error">{simInput.sizeError}</div>
                )}

                <div className="dst2-field-label">Array Elements</div>
                <div className="dst2-input-grid">
                  {simInput.elements.map((value, index) => (
                    <div className="dst2-small-input" key={index}>
                      <span>[{index}]</span>
                      <input
                        className={
                          simInput.badIdx.includes(index) ? "bad" : ""
                        }
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={value}
                        aria-label={`Element at index ${index}`}
                        onChange={(e) =>
                          simInput.changeElement(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                {simInput.elementError && (
                  <div className="dst2-field-error">
                    {simInput.elementError}
                  </div>
                )}

                <label className="dst2-field-label" htmlFor="dst2-speed">
                  Speed
                </label>
                <select
                  id="dst2-speed"
                  className="dst2-select"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                >
                  {SPEEDS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <div className="dst2-button-stack">
                  <button
                    className="dst2-primary-btn"
                    onClick={startSimulation}
                  >
                    ▶ Start Simulation
                  </button>
                  <button
                    className="dst2-reset-btn"
                    onClick={resetSimulation}
                  >
                    ↻ Reset
                  </button>
                </div>
              </div>

              {/* VISUAL PANEL */}
              <div className="dst2-card dst2-canvas-panel">
                <div className="dst2-canvas-header">
                  <div>
                    <div className="dst2-panel-heading">
                      {techniqueName(technique)} Visualizer
                    </div>
                    <div className="dst2-canvas-subtitle">
                      Every box shows its value and its index
                    </div>
                  </div>

                  <div className="dst2-step-badge">
                    {started ? `STEP ${current + 1}/${steps.length}` : "READY"}
                  </div>
                </div>

                <div className="dst2-live-strip">
                  <div>
                    <span>Technique</span>
                    <b>{techniqueName(technique)}</b>
                  </div>
                  <div>
                    <span>Array Size</span>
                    <b>{simInput.size}</b>
                  </div>
                  <div>
                    <span>Status</span>
                    <b
                      className={
                        completed ? "done" : started ? "running" : "ready"
                      }
                    >
                      {completed ? "COMPLETED" : started ? "RUNNING" : "READY"}
                    </b>
                  </div>
                </div>

                <Legend technique={technique} />

                <div className="dst2-stage-wrap">
                  {stageStep ? (
                    <SortStage
                      step={stageStep}
                      technique={technique}
                      setRef={simFlip.setRef}
                    />
                  ) : (
                    <div className="dst2-empty-canvas">
                      <div className="dst2-array-icon">▦</div>
                      <h3>Sorting Visualizer</h3>
                      <p>Fix the input errors, then click Start Simulation.</p>
                    </div>
                  )}
                </div>

                {started && simStep && (
                  <>
                    <div className="dst2-before-after">
                      <div>
                        <span>PREVIOUS STATE</span>
                        <b>
                          {simPrevStep ? fmt(simPrevStep.cells) : "Initial array"}
                        </b>
                      </div>
                      <div className="dst2-ba-arrow">→</div>
                      <div>
                        <span>CURRENT STATE</span>
                        <b>{fmt(simStep.cells)}</b>
                      </div>
                    </div>

                    <div className="dst2-navigation">
                      <button
                        className="dst2-nav-btn"
                        onClick={previousStep}
                        disabled={current === 0}
                      >
                        ← Previous
                      </button>
                      <button className="dst2-nav-btn" onClick={togglePlay}>
                        {playing
                          ? "⏸ Pause"
                          : completed
                          ? "↻ Replay"
                          : "▶ Play"}
                      </button>
                      <button
                        className="dst2-nav-btn"
                        onClick={nextStep}
                        disabled={completed}
                      >
                        Next →
                      </button>
                      <button
                        className="dst2-secondary-btn"
                        onClick={restartSimulation}
                        disabled={current === 0}
                      >
                        Restart
                      </button>
                    </div>

                    <div className="dst2-progress">
                      <div
                        style={{
                          width: `${((current + 1) / steps.length) * 100}%`,
                        }}
                      />
                    </div>

                    {completed && (
                      <div className="dst2-success-box">
                        ✓ Sorting completed successfully
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* WHAT'S HAPPENING NOW */}
              <div className="dst2-card dst2-analysis-panel">
                <div className="dst2-panel-heading">What&apos;s Happening Now</div>

                {simStep ? (
                  <div className="dst2-now-card">
                    <div className="dst2-now-head">
                      <span className={`dst2-now-badge type-${simStep.type}`}>
                        {STEP_LABEL[simStep.type]}
                      </span>
                      <span className="dst2-now-count">
                        Step {current + 1} of {steps.length}
                      </span>
                    </div>
                    <p className="dst2-now-text">{simStep.what}</p>
                    <ExplainBlocks step={simStep} />
                  </div>
                ) : (
                  <div className="dst2-howto">
                    <p>Start the simulation to see a simple explanation of every step here.</p>
                    <ol>
                      <li>Choose a sorting technique.</li>
                      <li>Enter the array size and elements.</li>
                      <li>Click Start Simulation.</li>
                      <li>Press Next and read what happens.</li>
                    </ol>
                  </div>
                )}

                <div className="dst2-stats">
                  <div className="dst2-stat-row">
                    <span>Comparisons</span>
                    <b>{simStep ? simStep.comparisons : 0}</b>
                  </div>
                  <div className="dst2-stat-row">
                    <span>{moveLabel(technique)}</span>
                    <b>{simStep ? simStep.swaps : 0}</b>
                  </div>
                  <div className="dst2-stat-row">
                    <span>Sorted Elements</span>
                    <b>
                      {simStep ? simStep.sorted.length : 0}/{simInput.size}
                    </b>
                  </div>
                  <div className="dst2-stat-row">
                    <span>Time Complexity</span>
                    <b className="dst2-complexity">{COMPLEXITY[technique]}</b>
                  </div>
                </div>
              </div>
            </div>

            {/* OBSERVATION */}
            <div className="dst2-card dst2-table-section">
              <div className="dst2-section-heading">Observation</div>

              {!observations.length ? (
                <div className="dst2-no-observation">
                  No observation recorded yet. Run a simulation to its last step.
                </div>
              ) : (
                <div className="dst2-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Technique</th>
                        <th>Input</th>
                        <th>Sorted Output</th>
                        <th>Comparisons</th>
                        <th>Swaps / Shifts / Merges</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observations.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{techniqueName(item.technique)}</td>
                          <td>{item.input}</td>
                          <td>{item.output}</td>
                          <td>{item.comparisons}</td>
                          <td>{item.moves}</td>
                          <td>
                            <span className="dst2-success-badge">
                              Completed
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
          <div className="dst2-program-area">
            <div className="dst2-card dst2-program-dropdown-row">
              <label htmlFor="dst2-prog-select">Select Program</label>

              <select
                id="dst2-prog-select"
                className="dst2-program-dropdown"
                value={progTechnique}
                onChange={(e) => {
                  setProgTechnique(e.target.value);
                  resetProgram();
                }}
              >
                {TECHNIQUES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name}
                  </option>
                ))}
              </select>

              <span className="dst2-predefined-badge">PREDEFINED PROGRAM</span>
            </div>

            <div className="dst2-program-grid">
              {/* LEFT */}
              <div className="dst2-program-left">
                <div className="dst2-card dst2-code-card">
                  <div className="dst2-section-heading">C Program</div>

                  <div className="dst2-code-header">
                    <span>{progTechnique}_sort.c</span>
                    <span>READ ONLY</span>
                  </div>

                  <div className="dst2-code dst2-code-lines" ref={codeBoxRef}>
                    {CODE[progTechnique].split("\n").map((text, idx) => (
                      <div
                        key={idx}
                        className={`dst2-code-line ${
                          progLine === idx + 1 ? "active" : ""
                        }`}
                      >
                        <span className="dst2-code-ln">{idx + 1}</span>
                        <code>{text ? highlightC(text) : " "}</code>
                      </div>
                    ))}
                  </div>
                </div>

                {progStep && (
                  <div className="dst2-card dst2-watch-card">
                    <div className="dst2-watch-head">
                      <div className="dst2-section-heading">Variable Watch</div>
                      <span>Line {progLine}</span>
                    </div>

                    <table className="dst2-var-table">
                      <thead>
                        <tr>
                          <th>Variable</th>
                          <th>Previous</th>
                          <th>Current</th>
                        </tr>
                      </thead>
                      <tbody>
                        {VAR_KEYS[progTechnique].map((key) => {
                          const cur = progStep.vars[key];
                          const prev = progPrev ? progPrev.vars[key] : undefined;
                          const changed = !!progPrev && prev !== cur;

                          return (
                            <tr key={key} className={changed ? "changed" : ""}>
                              <td>{key}</td>
                              <td>{prev === undefined ? "—" : String(prev)}</td>
                              <td>{cur === undefined ? "—" : String(cur)}</td>
                            </tr>
                          );
                        })}
                        <tr
                          className={
                            progPrev &&
                            fmt(progPrev.cells) !== fmt(progStep.cells)
                              ? "changed"
                              : ""
                          }
                        >
                          <td>a[]</td>
                          <td>{progPrev ? fmt(progPrev.cells) : "—"}</td>
                          <td>{fmt(progStep.cells)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="dst2-card dst2-program-input">
                  <div className="dst2-section-heading">Program Input</div>

                  <label className="dst2-field-label" htmlFor="dst2-prog-size">
                    Array Size (1 to 10)
                  </label>
                  <input
                    id="dst2-prog-size"
                    className={`dst2-text-input ${
                      progInput.sizeError ? "bad" : ""
                    }`}
                    type="number"
                    min="1"
                    max="10"
                    value={progInput.sizeText}
                    onChange={(e) => progInput.changeSizeText(e.target.value)}
                    onBlur={progInput.blurSize}
                  />
                  {progInput.sizeError && (
                    <div className="dst2-field-error">{progInput.sizeError}</div>
                  )}

                  <div className="dst2-field-label">
                    Array Elements ({progInput.size})
                  </div>
                  <div className="dst2-program-elements">
                    {progInput.elements.map((value, index) => (
                      <div className="dst2-program-element" key={index}>
                        <span>a[{index}]</span>
                        <input
                          className={
                            progInput.badIdx.includes(index) ? "bad" : ""
                          }
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          value={value}
                          aria-label={`Element at index ${index}`}
                          onChange={(e) =>
                            progInput.changeElement(index, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                  {progInput.elementError && (
                    <div className="dst2-field-error">
                      {progInput.elementError}
                    </div>
                  )}

                  <div className="dst2-program-buttons">
                    <button className="dst2-primary-btn" onClick={runProgram}>
                      ▶ Run Program
                    </button>
                    <button className="dst2-reset-btn" onClick={resetProgram}>
                      ↻ Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="dst2-card dst2-execution-card">
                <div className="dst2-canvas-header">
                  <div>
                    <div className="dst2-panel-heading">Program Execution</div>
                    <div className="dst2-canvas-subtitle">
                      Run the C program one step at a time
                    </div>
                  </div>

                  <div className="dst2-step-badge">
                    {progRunning
                      ? `STEP ${progCurrent + 1}/${progSteps.length}`
                      : "READY"}
                  </div>
                </div>

                <div className="dst2-live-strip">
                  <div>
                    <span>Program</span>
                    <b>{techniqueName(progTechnique)}</b>
                  </div>
                  <div>
                    <span>Input Size</span>
                    <b>{progInput.size}</b>
                  </div>
                  <div>
                    <span>Status</span>
                    <b
                      className={
                        progCompleted
                          ? "done"
                          : progRunning
                          ? "running"
                          : "ready"
                      }
                    >
                      {progCompleted
                        ? "COMPLETED"
                        : progRunning
                        ? "RUNNING"
                        : "READY"}
                    </b>
                  </div>
                </div>

                {progStep ? (
                  <>
                    <div className="dst2-stage-wrap">
                      <SortStage
                        step={progStep}
                        technique={progTechnique}
                        setRef={progFlip.setRef}
                      />
                    </div>

                    <div className="dst2-dryrun">
                      <div className="dst2-dryrun-head">
                        <div className="dst2-step-icon">{progCurrent + 1}</div>
                        <div>
                          <span>Dry Run · Line {progLine}</span>
                          <p>{progStep.what}</p>
                        </div>
                      </div>

                      {progLine > 0 && (
                        <div className="dst2-dryrun-code">
                          <span>{progLine}</span>
                          <code>
                            {highlightC(
                              CODE[progTechnique].split("\n")[progLine - 1].trim()
                            )}
                          </code>
                        </div>
                      )}

                      <ExplainBlocks step={progStep} />
                    </div>

                    <div className="dst2-navigation">
                      <button
                        className="dst2-nav-btn"
                        disabled={progCurrent === 0}
                        onClick={() => {
                          setProgAuto(false);
                          progGoTo(progCurrent - 1);
                        }}
                      >
                        ← Previous
                      </button>
                      <button
                        className="dst2-nav-btn"
                        disabled={progCompleted}
                        onClick={() => setProgAuto((v) => !v)}
                      >
                        {progAuto ? "⏸ Pause" : "▶ Auto Play"}
                      </button>
                      <button
                        className="dst2-nav-btn"
                        disabled={progCompleted}
                        onClick={() => {
                          setProgAuto(false);
                          progGoTo(progCurrent + 1);
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="dst2-empty-canvas">
                    <div className="dst2-array-icon">▶</div>
                    <h3>Execution Ready</h3>
                    <p>Enter the input and click Run Program.</p>
                  </div>
                )}
              </div>
            </div>

            {progCompleted && progStep && (
              <div className="dst2-card dst2-output-card">
                <div className="dst2-section-heading">Program Output</div>

                <pre className="dst2-output">
{`Technique    : ${techniqueName(progTechnique)}
Input Array  : ${progInputText}

Sorted array : ${progStep.cells.map((c) => c.value).join(" ")}

Comparisons  : ${progStep.comparisons}
${moveLabel(progTechnique).padEnd(12, " ")} : ${progStep.swaps}

Execution Status : SUCCESS`}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            QUIZ TAB
        ===================================================== */}
        {activeTab === "quiz" && (
          <div className="dst2-card dst2-questions-section">
            <div className="dst2-quiz-head">
              <div>
                <div className="dst2-section-heading">Quiz</div>
                <p className="dst2-question-note">
                  Choose one answer for each question. Your answers are checked when you submit the experiment.
                </p>
              </div>

              {quizSubmitted && (
                <div className="dst2-score">
                  Score: {quizScore}/{QUESTIONS.length}
                </div>
              )}
            </div>

            <div className="dst2-question-list">
              {QUESTIONS.map((question, qIndex) => (
                <div className="dst2-question-card" key={qIndex}>
                  <div className="dst2-question-title">
                    {qIndex + 1}. {question.q}
                  </div>

                  <div className="dst2-options">
                    {question.options.map((option, optionIndex) => {
                      let extra = "";

                      if (quizSubmitted) {
                        if (optionIndex === question.answer)
                          extra = " correct-answer";
                        else if (answers[qIndex] === optionIndex)
                          extra = " wrong-answer";
                      }

                      return (
                        <label
                          key={optionIndex}
                          className={`dst2-option ${
                            answers[qIndex] === optionIndex ? "selected" : ""
                          }${extra}`}
                        >
                          <input
                            type="radio"
                            name={`dst2-q-${qIndex}`}
                            checked={answers[qIndex] === optionIndex}
                            disabled={quizSubmitted}
                            onChange={() => selectAnswer(qIndex, optionIndex)}
                          />
                          <span className="dst2-option-letter">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div
                      className={`dst2-question-verdict ${
                        answers[qIndex] === question.answer ? "correct" : "wrong"
                      }`}
                    >
                      {answers[qIndex] === question.answer
                        ? "✓ Correct. "
                        : `✕ Incorrect. Correct answer: ${
                            question.options[question.answer]
                          }. `}
                      <span>{question.explain}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* =====================================================
            SUBMIT EXPERIMENT
        ===================================================== */}
        <div className="dst2-submit-section">
          <button
            className="dst2-submit-btn"
            onClick={submitExperiment}
            disabled={experimentDone}
          >
            {experimentDone ? "✓ Submitted" : "Submit Experiment"}
          </button>
          {submitError && <div className="dst2-submit-error">{submitError}</div>}
        </div>

        {experimentDone && (
          <div className="dst2-result-card">
            <div className="dst2-result-top">
              <div className="dst2-result-icon">✓</div>

              <div>
                <h3>Experiment Completed Successfully</h3>
                <p>
                  Sorting simulation, program execution and quiz have been
                  completed. Simulations recorded: {observations.length}.
                </p>
              </div>

              <div className="dst2-result-score">
                <b>
                  {quizScore}/{QUESTIONS.length}
                </b>
                <span>Quiz Score</span>
              </div>
            </div>

            <div className="dst2-result-actions">
              <button className="dst2-reset-btn" onClick={tryAgain}>
                ↻ Try Again
              </button>
              <button className="dst2-back-btn" onClick={() => navigate(-1)}>
                ← Back to Dashboard
              </button>
              <button
                className="dst2-primary-btn"
                onClick={() => setActiveTab("quiz")}
              >
                View Answers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DSTExperiment2;
