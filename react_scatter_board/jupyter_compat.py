''' Jupyter Notebook Compatibility functions
'''

def dash_to_ipython_HTML_template(mod):
  import os, json
  from textwrap import dedent
  sources = [
    open(os.path.join(mod._current_path, dist['relative_package_path'])).read()
    for dist in mod._js_dist
  ]
  newline = '\n'
  global_source = dedent(f"""
    <script src="/static/components/requirejs/require.js"></script>
    <script>
    require.config({json.dumps({
      'paths': {
        'react': 'https://cdnjs.cloudflare.com/ajax/libs/react/16.13.1/umd/react.production.min',
        'prop-types': 'https://cdnjs.cloudflare.com/ajax/libs/prop-types/15.7.2/prop-types.min',
        'react-dom': 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.13.1/umd/react-dom.production.min',
      },
      'map': {
        '*': {
          'React': 'react',
          'ReactDOM': 'react-dom',
          'PropTypes': 'prop-types',
        }
      },
      'catchError': True,
    })})
    {newline.join(sources)}
    </script>
  """)
  
  def dash_to_ipython_HTML(instance):
    from IPython.display import HTML
    import uuid
    id = '_' + str(uuid.uuid4())
    plotly_json = instance.to_plotly_json()
    local_source = global_source + dedent(f"""
      <div id='{id}'>Loading...</div>
      <script>
      require(['react', 'react-dom', '{plotly_json['namespace']}'], function (React, ReactDOM, {plotly_json['namespace']}) {{
        var el = document.getElementById('{id}')
        var err_timeout = setTimeout(
          function() {{
            if (el.innerHTML === '') {{
              el.innerHTML =  '<b style="color:red">An unknown error has likely occured, please check the logs</b>'
            }}
          }},
          100
        )
        ReactDOM.render(
          React.createElement(
            {plotly_json['namespace']}.{plotly_json['type']},
            {json.dumps(plotly_json['props'])},
            null
          ),
          el
        )
        clearTimeout(err_timeout)
      }}, function (e) {{
        console.error(e)
        document.getElementById('{id}').innerHTML = '<b style="color:red">' + e + '</b>'
      }})
      </script>
    """)
    return HTML(local_source)
  
  return dash_to_ipython_HTML

import react_scatter_board
display_dash = dash_to_ipython_HTML_template(react_scatter_board)

def ScatterBoard(**kwargs):
  return display_dash(react_scatter_board.ScatterBoard(**kwargs))
