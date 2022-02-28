import React from 'react';
import Loader from './Loader';
export default function Suspense(_ref) {
  var children = _ref.children;
  return /*#__PURE__*/React.createElement(React.Suspense, {
    fallback: /*#__PURE__*/React.createElement(Loader, null)
  }, children);
}