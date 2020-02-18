# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class ScatterBoard(Component):
    """A ScatterBoard component.
A React implementation of THREE.js 2d/3d scatter plot.

Keyword arguments:
- data (dict; optional): ([{x: 0, y: 0, z: 0, ...}]): the json formatted data. data has the following type: list of dicts containing keys 'x', 'y', 'z'.
Those keys have the following types:
  - x (number; required)
  - y (number; required)
  - z (number; optional)
- shapeKey (string; optional): (_string_): the key to shape the dots by default.
- colorKey (string; optional): (_string_): the key to color the dots by default.
- labelKeys (list of strings; optional): (_Array_ of strings): the ordered list of keys of attributes to display for the dots when mouse hovers.
- searchKeys (list of strings; optional): (_Array_ of strings): the list of keys of attributes to enable the search functionality to query against. If not provided, the SearchSelectize component will not be rendered.
- width (number; optional): (_number_): the width of the component in pixels. Default: 1400.
- height (number; optional): (_number_): the height of the component in pixels. Default: 800.
- is3d (boolean; optional): (_boolean_): should the scatter plot in 3-D (true) or 2-D (false).
- id (string; optional): The ID used to identify this component in Dash callbacks."""
    @_explicitize_args
    def __init__(self, data=Component.UNDEFINED, shapeKey=Component.UNDEFINED, colorKey=Component.UNDEFINED, labelKeys=Component.UNDEFINED, searchKeys=Component.UNDEFINED, width=Component.UNDEFINED, height=Component.UNDEFINED, is3d=Component.UNDEFINED, onClick=Component.UNDEFINED, onMouseOver=Component.UNDEFINED, id=Component.UNDEFINED, **kwargs):
        self._prop_names = ['data', 'shapeKey', 'colorKey', 'labelKeys', 'searchKeys', 'width', 'height', 'is3d', 'id']
        self._type = 'ScatterBoard'
        self._namespace = 'react_scatter_board'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['data', 'shapeKey', 'colorKey', 'labelKeys', 'searchKeys', 'width', 'height', 'is3d', 'id']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in []:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(ScatterBoard, self).__init__(**args)
