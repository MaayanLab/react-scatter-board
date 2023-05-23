import React, { useEffect } from 'react';
import { Html } from '@react-three/drei';
export default function THREEScatterPlotTooltip(_ref) {
  var name = _ref.name,
      threeRef = _ref.threeRef;
  var ref = React.useRef();
  useEffect(function () {
    if (!threeRef.current || !ref.current) return;
    var groupNode = threeRef.current.three.scene.getObjectByName(name);

    var listener = function listener(closestPoint) {
      if (closestPoint !== undefined && closestPoint.label) {
        groupNode.position.x = closestPoint.x;
        groupNode.position.y = closestPoint.y;
        groupNode.position.z = closestPoint.z;
        ref.current.textContent = closestPoint.label;
        ref.current.style.display = 'block';
      } else {
        ref.current.style.display = 'none';
      }
    };

    threeRef.current.events.on('hover', listener);
    return function () {
      threeRef.current.events.off('hover', listener);
    };
  }, [ref.current, threeRef.current]);
  return /*#__PURE__*/React.createElement(Html, {
    ref: ref,
    name: name,
    zIndexRange: [5, 0],
    style: {
      display: 'none',
      backgroundColor: 'lightgrey',
      borderRadius: 5,
      opacity: 0.9,
      padding: 5,
      pointerEvents: 'none',
      whiteSpace: 'pre'
    },
    position: [0, 0, 0]
  });
}