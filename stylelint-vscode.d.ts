declare module 'stylelint-vscode' {
  import { Diagnostic } from 'vscode';

  export interface StylelintWarning {
    line: number;
    column: number;
    rule: string;
    severity: 'warning' | 'error';
    text: string;
  }

  export interface StylelintResult {
    warnings: any;
    errored: boolean;
    output: string;
    results: {
      source: string;
      warnings: StylelintWarning[];
    }[];
  }

  export function processText(
    uri: string,
    text: string,
    options?: any
  ): Thenable<StylelintResult>;
}
