// Python code that is preloaded before the user's code is run
// <- [reference](https://stackoverflow.com/a/59571016/1375972)
export const preloadMatplotlibCode = (plotElementId: string) => `
import matplotlib.pyplot as plt
from js import document

fig = plt.figure()

def get_render_element(self):
    return document.getElementById('${plotElementId}')

fig.canvas.create_root_element = get_render_element.__get__(
    get_render_element, fig.canvas.__class__
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
    // TODO next: change this to dateutil.parser.isoparse - more flexible!
    return `d['${dateConversion.field}'] = dateutil.parser.isoparse(d['${dateConversion.field}'])`
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
    .replaceAll('\\"', "")
    .replaceAll("\\", "/")
    .replaceAll("'", "\\'")
  }')
` + (dateConversions.length > 0 ? processDateConversions(dateConversions) : '')

export const pandasEditorDefault = `import pandas as pd 

df = pd.DataFrame(data)
df.describe().to_html()`;

export const matplotlibEditorDefault = `# preloaded:
# import matplotlib.pyplot as plt
# fig = plt.figure()

x = [1,2,3]
y = [4,5,6]
plt.clf() # clear existing plot
plt.plot(x, y)
plt.show()`;