# CSE 110 Spring 2024 Group 35 Final Project - Journal App

- Coverage: ![Code Climate coverage](https://img.shields.io/codeclimate/coverage-letter/cse110-sp24-group35/journal) 
- Dev Pipeline: ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/cse110-sp24-group35/journal/.github%2Fworkflows%2Fintegration.yml?branch=dev)
- Production Pipeline: ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/cse110-sp24-group35/journal/.github%2Fworkflows%2Fintegration.yml)
- Production Deployment: ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/cse110-sp24-group35/journal/.github%2Fworkflows%2Fdeployment.yml)

## Deployment
A live deployment of the production build of this application is located [here](https://cse110-sp24-group35.github.io/journal/)

A live deployment of the JSDocs associated with production deployment is located [here](https://cse110-sp24-group35.github.io/journal/docs/)

## Features

### Overview
* A pie chart to show task completion status
* Quick check-list for tasks that are due today so users can mark them off within one click
* Displays upcoming tasks within 7 days from now

### Calendar
* A quick calendar view to show tasks that are due at a specific day of the month
* Hover / click on each cell for a more informative view of the tasks on that day

### Kanban / Task List
* 4 built-in columns (`PLANNED`, `ONGOING`, `COMPLETED`, `ABANDONED`) with capability to remove / add custom columns
* Users can drag-and-drop tasks around columns to quickly change their statuses
* Users can add task under a column to create a task and quickly assign its status

### Journal
* A file-explorer based view for users to elegantly organize journals (files) and folders
* Each journal file has its title, tags, and content editable
* The content is rendered as markdown, with side-by-side toggleable live-preview
* The journal editor auto saves the content based on user action, with 0.5 seconds delay to prevent spamming save operation

### Offline Capacity
* Uses ServiceWorker to cache styles, vendor scripts, and HTML files so once user accessed the website, they will no longer require internet
* Progressive-Web-Application (PWA) built in

## Setup

### Run the application locally
1. Clone the repository `git clone https://github.com/cse110-sp24-group35/journal.git`
2. Navigate to the cloned repository within your terminal
3. Run `npm install` (or `pnpm install`) which is recommended since we base our development on PNPM
4. Run `pnpm` / `npm` `dev` to spin up a local development server
5. Access `http://localhost:1234` to see a local preview!

### Run Tests
1. Clone the repository `git clone https://github.com/cse110-sp24-group35/journal.git`
2. Navigate to the cloned repository within your terminal
3. Run `npm install` (or `pnpm install`) which is recommended since we base our development on PNPM
4. Run `pnpm` / `npm` `test` to run both E2E and unit tests, use `test:unit` and/or `test:e2e` if you want to run individual ones

