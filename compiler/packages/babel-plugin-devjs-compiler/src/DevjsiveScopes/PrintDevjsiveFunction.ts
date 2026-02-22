/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {CompilerError} from '../CompilerError';
import {
  GeneratedSource,
  PrunedDevjsiveScopeBlock,
  DevjsiveFunction,
  DevjsiveScope,
  DevjsiveScopeBlock,
  DevjsiveScopeDependency,
  DevjsiveStatement,
  DevjsiveTerminal,
  DevjsiveValue,
} from '../HIR/HIR';
import {
  printFunction,
  printIdentifier,
  printInstructionValue,
  printPlace,
  printSourceLocation,
  printType,
} from '../HIR/PrintHIR';
import {assertExhaustive} from '../Utils/utils';

export function printDevjsiveFunctionWithOutlined(
  fn: DevjsiveFunction,
): string {
  const writer = new Writer();
  writeDevjsiveFunction(fn, writer);
  for (const outlined of fn.env.getOutlinedFunctions()) {
    writer.writeLine('\nfunction ' + printFunction(outlined.fn));
  }
  return writer.complete();
}

export function printDevjsiveFunction(fn: DevjsiveFunction): string {
  const writer = new Writer();
  writeDevjsiveFunction(fn, writer);
  return writer.complete();
}

function writeDevjsiveFunction(fn: DevjsiveFunction, writer: Writer): void {
  writer.writeLine(`function ${fn.id !== null ? fn.id : '<unknown>'}(`);
  writer.indented(() => {
    for (const param of fn.params) {
      if (param.kind === 'Identifier') {
        writer.writeLine(`${printPlace(param)},`);
      } else {
        writer.writeLine(`...${printPlace(param.place)},`);
      }
    }
  });
  writer.writeLine(') {');
  writeDevjsiveInstructions(writer, fn.body);
  writer.writeLine('}');
}

export function printDevjsiveScopeSummary(scope: DevjsiveScope): string {
  const items = [];
  // If the scope has a return value it needs a label
  items.push('scope');
  items.push(`@${scope.id}`);
  items.push(`[${scope.range.start}:${scope.range.end}]`);
  items.push(
    `dependencies=[${Array.from(scope.dependencies)
      .map(dep => printDependency(dep))
      .join(', ')}]`,
  );
  items.push(
    `declarations=[${Array.from(scope.declarations)
      .map(([, decl]) =>
        printIdentifier({...decl.identifier, scope: decl.scope}),
      )
      .join(', ')}]`,
  );
  items.push(
    `reassignments=[${Array.from(scope.reassignments).map(reassign =>
      printIdentifier(reassign),
    )}]`,
  );
  if (scope.earlyReturnValue !== null) {
    items.push(
      `earlyReturn={id: ${printIdentifier(
        scope.earlyReturnValue.value,
      )}, label: ${scope.earlyReturnValue.label}}}`,
    );
  }
  return items.join(' ');
}

export function writeDevjsiveBlock(
  writer: Writer,
  block: DevjsiveScopeBlock,
): void {
  writer.writeLine(`${printDevjsiveScopeSummary(block.scope)} {`);
  writeDevjsiveInstructions(writer, block.instructions);
  writer.writeLine('}');
}

export function writePrunedScope(
  writer: Writer,
  block: PrunedDevjsiveScopeBlock,
): void {
  writer.writeLine(`<pruned> ${printDevjsiveScopeSummary(block.scope)} {`);
  writeDevjsiveInstructions(writer, block.instructions);
  writer.writeLine('}');
}

export function printDependency(dependency: DevjsiveScopeDependency): string {
  const identifier =
    printIdentifier(dependency.identifier) +
    printType(dependency.identifier.type);
  return `${identifier}${dependency.path.map(token => `${token.optional ? '?.' : '.'}${token.property}`).join('')}_${printSourceLocation(dependency.loc)}`;
}

export function printDevjsiveInstructions(
  instructions: Array<DevjsiveStatement>,
): string {
  const writer = new Writer();
  writeDevjsiveInstructions(writer, instructions);
  return writer.complete();
}

export function writeDevjsiveInstructions(
  writer: Writer,
  instructions: Array<DevjsiveStatement>,
): void {
  writer.indented(() => {
    for (const instr of instructions) {
      writeDevjsiveInstruction(writer, instr);
    }
  });
}

function writeDevjsiveInstruction(
  writer: Writer,
  instr: DevjsiveStatement,
): void {
  switch (instr.kind) {
    case 'instruction': {
      const {instruction} = instr;
      const id = `[${instruction.id}]`;

      if (instruction.lvalue !== null) {
        writer.write(`${id} ${printPlace(instruction.lvalue)} = `);
        writeDevjsiveValue(writer, instruction.value);
        writer.newline();
      } else {
        writer.write(`${id} `);
        writeDevjsiveValue(writer, instruction.value);
        writer.newline();
      }
      break;
    }
    case 'scope': {
      writeDevjsiveBlock(writer, instr);
      break;
    }
    case 'pruned-scope': {
      writePrunedScope(writer, instr);
      break;
    }
    case 'terminal': {
      if (instr.label !== null) {
        writer.write(`bb${instr.label.id}: `);
      }
      writeTerminal(writer, instr.terminal);
      break;
    }
    default: {
      assertExhaustive(
        instr,
        `Unexpected terminal kind \`${(instr as any).kind}\``,
      );
    }
  }
}

export function printDevjsiveValue(value: DevjsiveValue): string {
  const writer = new Writer();
  writeDevjsiveValue(writer, value);
  return writer.complete();
}

function writeDevjsiveValue(writer: Writer, value: DevjsiveValue): void {
  switch (value.kind) {
    case 'ConditionalExpression': {
      writer.writeLine(`Ternary `);
      writer.indented(() => {
        writeDevjsiveValue(writer, value.test);
        writer.writeLine(`? `);
        writer.indented(() => {
          writeDevjsiveValue(writer, value.consequent);
        });
        writer.writeLine(`: `);
        writer.indented(() => {
          writeDevjsiveValue(writer, value.alternate);
        });
      });
      writer.newline();
      break;
    }
    case 'LogicalExpression': {
      writer.writeLine(`Logical`);
      writer.indented(() => {
        writeDevjsiveValue(writer, value.left);
        writer.write(`${value.operator} `);
        writeDevjsiveValue(writer, value.right);
      });
      writer.newline();
      break;
    }
    case 'SequenceExpression': {
      writer.writeLine(`Sequence`);
      writer.indented(() => {
        writer.indented(() => {
          value.instructions.forEach(instr =>
            writeDevjsiveInstruction(writer, {
              kind: 'instruction',
              instruction: instr,
            }),
          );
          writer.write(`[${value.id}] `);
          writeDevjsiveValue(writer, value.value);
        });
      });
      writer.newline();
      break;
    }
    case 'OptionalExpression': {
      writer.append(`OptionalExpression optional=${value.optional}`);
      writer.newline();
      writer.indented(() => {
        writeDevjsiveValue(writer, value.value);
      });
      writer.newline();
      break;
    }
    default: {
      const printed = printInstructionValue(value);
      const lines = printed.split('\n');
      if (lines.length === 1) {
        writer.writeLine(printed);
      } else {
        writer.indented(() => {
          for (const line of lines) {
            writer.writeLine(line);
          }
        });
      }
    }
  }
}

export function printDevjsiveTerminal(terminal: DevjsiveTerminal): string {
  const writer = new Writer();
  writeTerminal(writer, terminal);
  return writer.complete();
}

function writeTerminal(writer: Writer, terminal: DevjsiveTerminal): void {
  switch (terminal.kind) {
    case 'break': {
      const id = terminal.id !== null ? `[${terminal.id}]` : [];
      writer.writeLine(
        `${id} break bb${terminal.target} (${terminal.targetKind})`,
      );

      break;
    }
    case 'continue': {
      const id = `[${terminal.id}]`;
      writer.writeLine(
        `${id} continue bb${terminal.target} (${terminal.targetKind})`,
      );
      break;
    }
    case 'do-while': {
      writer.writeLine(`[${terminal.id}] do-while {`);
      writeDevjsiveInstructions(writer, terminal.loop);
      writer.writeLine('} (');
      writer.indented(() => {
        writeDevjsiveValue(writer, terminal.test);
      });
      writer.writeLine(')');
      break;
    }
    case 'while': {
      writer.writeLine(`[${terminal.id}] while (`);
      writer.indented(() => {
        writeDevjsiveValue(writer, terminal.test);
      });
      writer.writeLine(') {');
      writeDevjsiveInstructions(writer, terminal.loop);
      writer.writeLine('}');
      break;
    }
    case 'if': {
      const {test, consequent, alternate} = terminal;
      writer.writeLine(`[${terminal.id}] if (${printPlace(test)}) {`);
      writeDevjsiveInstructions(writer, consequent);
      if (alternate !== null) {
        writer.writeLine('} else {');
        writeDevjsiveInstructions(writer, alternate);
      }
      writer.writeLine('}');
      break;
    }
    case 'switch': {
      writer.writeLine(
        `[${terminal.id}] switch (${printPlace(terminal.test)}) {`,
      );
      writer.indented(() => {
        for (const case_ of terminal.cases) {
          let prefix =
            case_.test !== null ? `case ${printPlace(case_.test)}` : 'default';
          writer.writeLine(`${prefix}: {`);
          writer.indented(() => {
            const block = case_.block;
            CompilerError.invariant(block != null, {
              reason: 'Expected case to have a block',
              loc: case_.test?.loc ?? GeneratedSource,
            });
            writeDevjsiveInstructions(writer, block);
          });
          writer.writeLine('}');
        }
      });
      writer.writeLine('}');
      break;
    }
    case 'for': {
      writer.writeLine(`[${terminal.id}] for (`);
      writer.indented(() => {
        writeDevjsiveValue(writer, terminal.init);
        writer.writeLine(';');
        writeDevjsiveValue(writer, terminal.test);
        writer.writeLine(';');
        if (terminal.update !== null) {
          writeDevjsiveValue(writer, terminal.update);
        }
      });
      writer.writeLine(') {');
      writeDevjsiveInstructions(writer, terminal.loop);
      writer.writeLine('}');
      break;
    }
    case 'for-of': {
      writer.writeLine(`[${terminal.id}] for-of (`);
      writer.indented(() => {
        writeDevjsiveValue(writer, terminal.init);
        writer.writeLine(';');
        writeDevjsiveValue(writer, terminal.test);
      });
      writer.writeLine(') {');
      writeDevjsiveInstructions(writer, terminal.loop);
      writer.writeLine('}');
      break;
    }
    case 'for-in': {
      writer.writeLine(`[${terminal.id}] for-in (`);
      writer.indented(() => {
        writeDevjsiveValue(writer, terminal.init);
      });
      writer.writeLine(') {');
      writeDevjsiveInstructions(writer, terminal.loop);
      writer.writeLine('}');
      break;
    }
    case 'throw': {
      writer.writeLine(`[${terminal.id}] throw ${printPlace(terminal.value)}`);
      break;
    }
    case 'return': {
      writer.writeLine(`[${terminal.id}] return ${printPlace(terminal.value)}`);
      break;
    }
    case 'label': {
      writer.writeLine('{');
      writeDevjsiveInstructions(writer, terminal.block);
      writer.writeLine('}');
      break;
    }
    case 'try': {
      writer.writeLine(`[${terminal.id}] try {`);
      writeDevjsiveInstructions(writer, terminal.block);
      writer.write(`} catch `);
      if (terminal.handlerBinding !== null) {
        writer.writeLine(`(${printPlace(terminal.handlerBinding)}) {`);
      } else {
        writer.writeLine(`{`);
      }
      writeDevjsiveInstructions(writer, terminal.handler);
      writer.writeLine('}');
      break;
    }
    default:
      assertExhaustive(
        terminal,
        `Unhandled terminal kind \`${(terminal as any).kind}\``,
      );
  }
}

export class Writer {
  #out: Array<string> = [];
  #line: string;
  #depth: number;

  constructor({depth}: {depth: number} = {depth: 0}) {
    this.#depth = Math.max(depth, 0);
    this.#line = '';
  }

  complete(): string {
    const line = this.#line.trimEnd();
    if (line.length > 0) {
      this.#out.push(line);
    }
    return this.#out.join('\n');
  }

  append(s: string): void {
    this.write(s);
  }

  newline(): void {
    const line = this.#line.trimEnd();
    if (line.length > 0) {
      this.#out.push(line);
    }
    this.#line = '';
  }

  write(s: string): void {
    if (this.#line.length === 0 && this.#depth > 0) {
      // indent before writing
      this.#line = '  '.repeat(this.#depth);
    }
    this.#line += s;
  }

  writeLine(s: string): void {
    this.write(s);
    this.newline();
  }

  indented(f: () => void): void {
    this.#depth++;
    f();
    this.#depth--;
  }
}
