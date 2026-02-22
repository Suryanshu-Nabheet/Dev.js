# Attribute Behavior Fixture

**WIP:** This is an MVP, still needs polish.

### Known Issues
- There are currently two errors thrown when the page loads;
  `SyntaxError: missing ; before statement`

## Instructions

`pnpm build --type=UMD_DEV devjs/index,devjs-dom && cd fixtures/attribute-behavior && pnpm install && pnpm dev`

## Interpretation

Each row is an attribute which could be set on some DOM component. Some of
them are invalid or mis-capitalized or mixed up versions of real ones.
Each column is a value which can be passed to that attribute.
Every cell has a box on the left and a box on the right.
The left box shows the property (or attribute) assigned by the latest stable release of Devjs, and the
right box shows the property (or attribute) assigned by the locally built version of Devjs.

Right now, we use a purple outline to call out cases where the assigned property
(or attribute) has changed between Devjs 15 and 16.

---


This project was bootstrapped with [Create Devjs App](https://github.com/Suryanshu-Nabheet/create-devjs-app).

You can find the guide for how to do things in a CRA [here](https://github.com/Suryanshu-Nabheet/create-devjs-app/blob/main/packages/cra-template/template/README.md).
