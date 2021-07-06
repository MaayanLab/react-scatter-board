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
    display(Javascript(open(Path(__file__).parent/'react_scatter_board.js').read()))

def ScatterBoard(id=None, **kwargs):
  _init()
  if id is None:
    id = str(uuid.uuid4())
  return HTML(dedent(f'''
    <div id="{id}"></div>
    <script>
    require(['react_scatter_board'], function (react_scatter_board) {{
      var self = document.getElementById('{id}')
      while (self.children.length > 0) self.children[0].remove()
      react_scatter_board.ReactScatterBoard(
        self,
        {json.dumps(kwargs)}
      )
    }}, function (e) {{
      console.error(e)
      var self = document.getElementById('{id}')
      self.innerHTML = '<b style="color:red">' + e + '</b>'
    }})
    </script>
  '''))
