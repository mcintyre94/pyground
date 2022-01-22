type Props = {
  output: string
}

export default function PythonOutput({ output }: Props) {
  return <div className="prose prose-invert prose-table:table-auto prose-th:text-center whitespace-pre-wrap overflow-x-auto" dangerouslySetInnerHTML={{ __html: output }} />
}