# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class ScatterPlot(Component):
    """A ScatterPlot component.
The 3d canvas view underyling the scatterBoard

Keyword arguments:
- data (dict; optional): ([{x: 0, y: 0, z: 0, ...}]): the json formatted data. data has the following type: list of dicts containing keys 'x', 'y', 'z'.
Those keys have the following types:
  - x (number; required)
  - y (number; required)
  - z (number; optional)
- model (boolean | number | string | dict | list; optional): ScatterData(data)
- width (number; optional): (_number_): the width of the component in pixels. Default: 1400.
- height (number; optional): (_number_): the height of the component in pixels. Default: 800.
- DPR (number; optional): (_number_): the device pixel ratio (window.devicePixelRatio)
- colorKey (string; optional): (_string_): the key to color the dots by default.
- shapeKey (string; optional): (_string_): the key to shape the dots by default.
- labelKeys (list of strings; optional): (_Array_ of strings): the ordered list of keys of attributes to display for the dots when mouse hovers.
- colorScale (boolean | number | string | dict | list; optional): (d3-color-scale): Color scale
- shapeScale (boolean | number | string | dict | list; optional): (d3-color-scale): Color scale
- shapeLabels (boolean | number | string | dict | list; optional): (d3-color-scale): Color scale
- is3d (boolean; optional): (_boolean_): should the scatter plot in 3-D (true) or 2-D (false).
- id (string; optional): The ID used to identify this component in Dash callbacks."""
    @_explicitize_args
    def __init__(self, data=Component.UNDEFINED, model=Component.UNDEFINED, width=Component.UNDEFINED, height=Component.UNDEFINED, DPR=Component.UNDEFINED, colorKey=Component.UNDEFINED, shapeKey=Component.UNDEFINED, labelKeys=Component.UNDEFINED, colorScale=Component.UNDEFINED, shapeScale=Component.UNDEFINED, shapeLabels=Component.UNDEFINED, is3d=Component.UNDEFINED, onClick=Component.UNDEFINED, onMouseOver=Component.UNDEFINED, id=Component.UNDEFINED, **kwargs):
        self._prop_names = ['data', 'model', 'width', 'height', 'DPR', 'colorKey', 'shapeKey', 'labelKeys', 'colorScale', 'shapeScale', 'shapeLabels', 'is3d', 'id']
        self._type = 'ScatterPlot'
        self._namespace = 'react_scatter_board'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['data', 'model', 'width', 'height', 'DPR', 'colorKey', 'shapeKey', 'labelKeys', 'colorScale', 'shapeScale', 'shapeLabels', 'is3d', 'id']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in []:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(ScatterPlot, self).__init__(**args)
