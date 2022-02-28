import { useFrame } from "@react-three/fiber"

export default function useFrameSlow(ts, cb) {
  let t = 0
  return useFrame((state, dt) => {
    t += dt
    if (t >= ts) {
      cb(state, t)
      t = 0
    }
  })
}
