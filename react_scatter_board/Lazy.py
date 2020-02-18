# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class Lazy(Component):
    """A Lazy component.
Lazy react component helper for constructing objects with async render functions

Keyword arguments:
- loading (dash component; optional): Loading indicator (node or react component)"""
    @_explicitize_args
    def __init__(self, children=None, loading=Component.UNDEFINED, **kwargs):
        self._prop_names = ['loading']
        self._type = 'Lazy'
        self._namespace = 'react_scatter_board'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['loading']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in []:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(Lazy, self).__init__(children=children, **args)
