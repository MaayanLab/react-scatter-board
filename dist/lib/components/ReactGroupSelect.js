import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

import React from 'react';
var Select = /*#__PURE__*/React.lazy(function () {
  return new Promise(function (resolve) {
    (function () {
      resolve(require('react-select'));
    })();
  });
});

function formatGroupLabel(data) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      opacity: 0.8
    }
  }, /*#__PURE__*/React.createElement("span", null, data.label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block'
    }
  }, data.options.length));
}

export default function ReactGroupSelect(_ref) {
  var label = _ref.label,
      facets = _ref.facets,
      current = _ref.current,
      _onChange = _ref.onChange;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '200px',
      marginBottom: '10px',
      color: 'black',
      pointerEvents: 'auto',
      opacity: 0.8
    }
  }, /*#__PURE__*/React.createElement("b", null, label), /*#__PURE__*/React.createElement(Select, {
    menuPortalTarget: document.body,
    styles: {
      menu: function menu(styles) {
        return _objectSpread(_objectSpread({}, styles), {}, {
          opacity: 1,
          zIndex: 10
        });
      },
      menuPortal: function menuPortal(styles) {
        return _objectSpread(_objectSpread({}, styles), {}, {
          opacity: 1,
          zIndex: 10
        });
      }
    },
    classNamePrefix: "select",
    value: current,
    onChange: function onChange(evt) {
      if (evt === null) evt = undefined;

      _onChange(evt);
    },
    isClearable: true,
    isSearchable: true,
    options: Object.keys(facets).map(function (key) {
      return {
        label: key,
        options: Object.keys(facets[key].values).map(function (value) {
          return {
            key: key,
            label: value,
            value: value
          };
        })
      };
    }),
    formatGroupLabel: formatGroupLabel
  }));
}