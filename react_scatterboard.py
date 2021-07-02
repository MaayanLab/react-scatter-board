import json
import uuid
from pathlib import Path
from textwrap import dedent
from IPython.display import display, HTML, Javascript

__init = False

def _init():
  global __init
  if not __init:
    __init = True
    display(Javascript(open(Path(__file__).parent/'dist/react_scatterboard.js').read()))

def ScatterBoard(id=None, **kwargs):
  _init()
  if id is None:
    id = str(uuid.uuid4())
  return HTML(dedent(f'''
    <div id="{id}"></div>
    <script>
    require(['react_scatterboard'], function (react_scatterboard) {{
      react_scatterboard.ReactScatterBoard(
        document.getElementById('{id}'),
        {json.dumps(kwargs)}
      )
    }}, function (e) {{
      console.error(e)
      document.getElementById('{id}').innerHTML = '<b style="color:red">' + e + '</b>'
    }})
    </script>
  '''))
