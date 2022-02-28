import { useFrame } from "@react-three/fiber";
export default function useFrameSlow(ts, cb) {
  var t = 0;
  return useFrame(function (state, dt) {
    t += dt;

    if (t >= ts) {
      cb(state, t);
      t = 0;
    }
  });
}