import { expect, test } from "bun:test"
import { Circuit } from "@tscircuit/core"
import type { AnyCircuitElement, PcbHole } from "circuit-json"
import { runSolverAndRenderToSvg } from "./utils/run-solver-and-render-to-svg"

test("non-plated square holes receive copper-pour clearance", async () => {
  const clearance = 0.3
  const holeX = 2
  const holeSize = 2
  const circuit = new Circuit()
  circuit.add(
    <board width={12} height={8} routingDisabled>
      <net name="GND" isGroundNet />
      <pcbnotetext
        text={`GND POUR: ${clearance} mm clearance`}
        pcbY={3}
        fontSize={0.6}
      />
      <pcbnotetext
        text="Expected: clearance around square hole"
        pcbY={-3}
        fontSize={0.5}
      />
    </board>,
  )
  await circuit.renderUntilSettled()
  const squareHole: PcbHole = {
    type: "pcb_hole",
    pcb_hole_id: "pcb_hole_square",
    hole_shape: "square",
    hole_diameter: holeSize,
    x: holeX,
    y: 0,
  }
  const circuitJson = [
    ...circuit.getCircuitJson(),
    squareHole,
  ] as AnyCircuitElement[]

  expect(
    runSolverAndRenderToSvg(circuitJson, {
      layer: "top",
      net_name: "GND",
      pad_margin: clearance,
      trace_margin: clearance,
      board_edge_margin: 0.5,
      cutout_margin: clearance,
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
