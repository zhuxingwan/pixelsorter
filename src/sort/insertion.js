import {exchange} from "./exchange";


// Insertion Sort
// Iterate through the list. For each element place it in the correct place in a new list.
// Insertions are expensive because it requires shifting elements in the list.

// Helper function for inserting elements. How to measure cost? Number of items shifted?
// Maybe implement in terms of exchange to keep counting consistent.
export function insert (list, el, index) {
    for (let i = list.length - 1; i >= index; i--) {
        list[i + 1] = list[i];
    }
    list[index] = el;
};

// without mutation
export function _insertion (compare, list) {
    // Create an array that will hold the sorted elements. The first element of
    // the list will always start at sorted[0].
    const sorted = [list[0]];
    for (let i = 1; i < list.length; i++) {
        // Element tthat will be insterted into the sorted list.
        const el = list[i];
        // find the position to insert;
        const sortedIndex = sorted.findIndex(s => compare(el, s) < 0);
        // Insert item at the end of list if not smaller than any already sorted elements.
        insert(sorted, el, sortedIndex === -1 ? sorted.length : sortedIndex);
    }
    return sorted;
}

// Insertion sort with mutation.
export function sort (compare, list) {
    for (let i = 0; i < list.length; i++) {
        // Move backwards over the already sorted elements and continue swaping until
        // newest element is in the correct location.
        for (let j = i; j > 0 && compare(list[j], list[j-1]) < 0; j--) {
            exchange(list, j, j-1);
        }
    }
    return list;
}
