/**
 * Formats a Date object into a string in the format MM/dd/YYYY HH:mm:ss.
 *
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string in the format MM/dd/YYYY HH:mm:ss.
 *
 * @example
 * const date = new Date();
 * console.log(formatDate(date)); // Output example: 06/09/2024 14:45:30
 */
export function formatDate(date) {
    // Get individual parts of the date
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Format the date and time as MM/dd/YYYY HH:mm:ss
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}