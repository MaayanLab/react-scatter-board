import os
import json
import dash
import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import Input, Output
from react_scatter_board import DashScatterBoard

app = dash.Dash(__name__)

app.index_string = '''
<!DOCTYPE html>
<html>
    <head>
        {%metas%}
        <title>{%title%}</title>
        {%favicon%}
        {%css%}
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
        {%app_entry%}
        <footer>
            {%config%}
            {%scripts%}
            {%renderer%}
        </footer>
    </body>
</html>
'''
app.layout = html.Div(className='row', children=[
  html.Div(
    className='col-sm-12',
    children=[
      DashScatterBoard(
        id='scatterboard',
        is3d=True,
        data=[
          dict(x=0, y=0, z=0, label='a', shape='s', color='r'),
          dict(x=1, y=1, z=-1, label='b', shape='t', color='g'),
          dict(x=-1, y=-1, z=-1, label='c', shape='c', color='b'),
          dict(x=0, y=0, z=1, label='d', shape='c', color='r'),
          dict(x=0, y=1, z=0, label='e', shape='t', color='g'),
          dict(x=0, y=0, z=-1, label='f', shape='t', color='b'),
        ],
        shapeKey='shape',
        colorKey='color',
        labelKeys=['label'],
        searchKeys=['label', 'shape', 'color'],
        width=800,
        height=400,
      ),
    ],
  ),
  html.Div(
    id='clickStatus',
    className='col-sm-6',
  ),
  html.Div(
    id='hoverStatus',
    className='col-sm-6',
  ),
])

@app.callback(
    Output('clickStatus', 'children'),
    [Input('scatterboard', 'clickData')]
)
def update_click(clickData):
  return 'click:' + json.dumps(clickData)

@app.callback(
    Output('hoverStatus', 'children'),
    [Input('scatterboard', 'hoverData')]
)
def update_click(hoverData):
  return 'hover:' + json.dumps(hoverData)

app.run_server(
  host=os.environ.get('HOST', '0.0.0.0'),
  port=json.loads(os.environ.get('PORT', '8050')),
  debug=json.loads(os.environ.get('DEBUG', 'true')),
)