/**
 * Predefined colors for user cursors and avatars in collaborative editing
 * Colors are chosen to be visually distinct and accessible
 */
const COLLABORATION_COLORS = [
    '#f44336', // red
    '#e91e63', // pink
    '#9c27b0', // purple
    '#673ab7', // deep purple
    '#3f51b5', // indigo
    '#2196f3', // blue
    '#03a9f4', // light blue
    '#00bcd4', // cyan
    '#009688', // teal
    '#4caf50', // green
    '#8bc34a', // light green
    '#ff9800', // orange
    '#ff5722', // deep orange
];

/**
 * Generate a consistent color based on user UUID.
 * The same UUID will always produce the same color.
 * 
 * @param uuid - User's unique identifier
 * @returns Hex color string (e.g., '#f44336')
 */
export function generateUserColor(uuid: string): string {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLLABORATION_COLORS[Math.abs(hash) % COLLABORATION_COLORS.length];
}
