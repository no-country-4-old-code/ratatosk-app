import {getSwipedIndex} from '@lib/multiple-used/get-swiped-index';

describe('Test calculation of swiped index (no rotation)', function () {
    const swipeRight = {deltaX: -1};
    const swipeLeft = {deltaX: 1};
    const maxIndex = 3;

    function act(swipeEvent, currentIndex, expectedIndex): void {
        const newIndex = getSwipedIndex(swipeEvent, currentIndex, maxIndex);
        expect(newIndex).toEqual(expectedIndex);
    }

    it('should increase on swipe to right', function () {
        act(swipeRight, 0, 1);
        act(swipeRight, 1, 2);
    });

    it('should decrease on swipe to left', function () {
        act(swipeLeft, 2, 1);
        act(swipeLeft, 1, 0);
    });

    it('should not rotate and handle values out of bounds', function () {
        act(swipeLeft, 0, 0);
        act(swipeLeft, -1, 0);
        act(swipeLeft, -2, 0);
        act(swipeRight, maxIndex, maxIndex);
        act(swipeRight, maxIndex + 1, maxIndex);
        act(swipeRight, maxIndex + 2, maxIndex);
    });
});