// quick search: the place of the target to insert
export default function quickSearch(sorted: number[], target: number): number {
    if (sorted.length <= 2) {
        if (sorted[sorted.length - 1] < target) {
            return sorted.length;
        } else if (sorted[0] < target) {
            return 1;
        } else {
            return 0;
        }
    }
    const midIndex = Math.floor(sorted.length / 2);
    const mid = sorted[midIndex];
    if (mid < target) {
        const subSOrted = sorted.slice(midIndex);
        return midIndex + quickSearch(subSOrted, target);
    } else {
        const subSOrted = sorted.slice(0, midIndex);
        return quickSearch(subSOrted, target);
    }
}
