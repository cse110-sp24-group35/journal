/** @type {import('jest').Config} */
export default {
    testTimeout: 600000,
    transform: {

    },
    collectCoverageFrom: [
        'src/scripts/**/*.{js,jsx}',
        '!src/scripts/components/**/*.js',
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
