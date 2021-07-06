import json
import uuid
import pandas as pd
from pathlib import Path
from textwrap import dedent
from IPython.display import display, HTML, Javascript

def react_scatter_board_js():
  return open(Path(__file__).parent/'react_scatter_board.js', 'r').read()

def define_react_scatter_board():
  display(Javascript(react_scatter_board_js()))

_defined = False

def ReactScatterBoard(id=None, **kwargs):
  global _defined
  if not _defined:
    define_react_scatter_board()
    _defined = True
  if id is None:
    id = str(uuid.uuid4())
  if isinstance(kwargs.get('data'), pd.DataFrame):
    kwargs['data'] = kwargs['data'].to_dict(orient='records')
  return HTML(dedent(f'''
    <div id="{id}"></div>
    <script>
    require(['react_scatter_board'], function (react_scatter_board) {{
      try {{
        var self = document.getElementById('{id}')
        while (self.children.length > 0) self.children[0].remove()
        react_scatter_board.ReactScatterBoard(
          self,
          {json.dumps(kwargs)}
        )
      }} catch (e) {{
        console.error(e)
        var self = document.getElementById('{id}')
        self.innerHTML = '<b style="color:red">' + e + '</b>'
      }}
    }}, function (e) {{
      console.error(e)
      var self = document.getElementById('{id}')
      self.innerHTML = '<b style="color:red">' + e + '</b>'
    }})
    </script>
  '''))
