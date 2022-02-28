import React from 'react';
export default function ReactSwitch(_ref) {
  var on = _ref.on,
      off = _ref.off,
      current = _ref.current,
      onChange = _ref.onChange;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      alignSelf: 'center',
      display: 'flex',
      justifyContent: 'center',
      borderRadius: '4px',
      border: 'solid 1px grey',
      pointerEvents: 'auto',
      cursor: 'pointer',
      opacity: 0.8
    },
    onClick: function onClick(evt) {
      return onChange(!current);
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '40px',
      height: '40px',
      backgroundColor: current ? 'white' : '#0088aa'
    }
  }, off), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '40px',
      height: '40px',
      backgroundColor: current ? '#0088aa' : 'white'
    }
  }, on));
}