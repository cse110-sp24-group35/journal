/** @type {import('jest').Config} */
export default {
    transform: {

    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/scripts/**/*.{js,jsx}',
        '!src/scripts/sw/*.js',
        '!**/node_modules/**',
        '!**/vendor/**',
    ],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90
        },
    }
}