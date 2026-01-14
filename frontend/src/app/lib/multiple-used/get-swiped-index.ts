export function getSwipedIndex(swipeEvent: { deltaX: number }, currentIndex: number, maxIndex: number): number {
    if (swipeEvent.deltaX < 0) {
        return increaseTabIndex(currentIndex, maxIndex);
    } else {
        return decreaseTabIndex(currentIndex);
    }
}


// private


function increaseTabIndex(index: number, maxIndex: number): number {
    if (index < maxIndex) {
        return index + 1;
    } else {
        return maxIndex;
    }
}

function decreaseTabIndex(index: number): number {
    if (index > 0) {
        return index - 1;
    } else {
        return 0;
    }
}