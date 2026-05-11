import katex from 'katex';

type Props = {
  expression: string;
  block?: boolean;
  label?: string;
  testId?: string;
};

export function MathBlock({ expression, block = false, label, testId }: Props) {
  const html = katex.renderToString(expression, {
    throwOnError: false,
    displayMode: block,
    strict: 'ignore',
  });

  return (
    <span
      className={block ? 'math-block' : 'math-inline'}
      aria-label={label ?? expression.replace(/\\/g, '')}
      data-testid={testId}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
