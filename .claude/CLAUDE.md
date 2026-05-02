# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

## Quality Gates

After completing edits, always run the linter for the affected layer before considering the task done:

- PHP files → `composer cs && composer analysis`
- TS/JS files → `pnpm lint:scripts` and `pnpm lint:scripts:fix` to fixing them
- SCSS/CSS files → `pnpm lint:styles` and `pnpm lint:styles:fix` to fixing them

Before committing, run the full suite: `composer qa && pnpm lint:scripts && pnpm lint:styles`. Do not commit if any linter or test reports an error.
