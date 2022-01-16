// Python code that is preloaded before the user's code is run
// <- [reference](https://stackoverflow.com/a/59571016/1375972)
export const preloadMatplotlibCode = (plotElementId: string) => `
import matplotlib.pyplot as plt
from js import document

f = plt.figure()

def get_render_element(self):
    return document.getElementById('${plotElementId}')

f.canvas.create_root_element = get_render_element.__get__(
    get_render_element, f.canvas.__class__
)`;

export type DateConversionFormat = "timestamp_seconds" | "isoformat" | string

export type DateConversion = {
  field: string,
  format: DateConversionFormat,
}

const pythonDateConvert = (dateConversion: DateConversion) => {
  if (dateConversion.format === "timestamp_seconds") {
    return `d['${dateConversion.field}'] = datetime.fromtimestamp(int(d['${dateConversion.field}']))`
  } else if (dateConversion.format === "isoformat") {
    return `d['${dateConversion.field}'] = datetime.fromisoformat(d['${dateConversion.field}'])`
  } else {
    // assume format is a valid input to strptime
    return `d['${dateConversion.field}'] = datetime.strptime(d['${dateConversion.field}'], '${dateConversion.format}')`
  }
}

const processDateConversions = (dateConversions: DateConversion[]) => `
for d in data:
${dateConversions.map(dc => `    ${pythonDateConvert(dc)}`).join('\n')}
`

export const preprocessData = (data: Object[], dateConversions: DateConversion[]) => `
from datetime import datetime
import json

data = json.loads('${JSON.stringify(data)
    .replaceAll("\\n", " ")
    .replaceAll("\\t", " ")
    .replaceAll("\\", "/")
    .replaceAll("'", "\\'")
  }')
` + (dateConversions.length > 0 ? processDateConversions(dateConversions) : '')
