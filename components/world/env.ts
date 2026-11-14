import { createEnvState } from "@/lib/journey";

/** The live, interpolated environment for the current journey time. Written by the Rig each frame. */
export const envState = createEnvState();
