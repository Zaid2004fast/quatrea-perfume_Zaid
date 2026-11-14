import { TLink } from "@/components/shell/TLink";
import { WorldDirector } from "@/components/shell/WorldDirector";
import { SeasonMark } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="page lost container-x">
      <WorldDirector mode="hidden" tone="dark" />
      <SeasonMark size={54} stroke={0.7} />
      <span className="eyebrow">Error 404 · Out of season</span>
      <h1 className="display" style={{ fontSize: "clamp(3rem,8vw,8rem)", margin: 0 }}>
        This page has <em>not yet bloomed.</em>
      </h1>
      <TLink href="/" className="btn btn-solid">
        Return to the experience
      </TLink>
    </main>
  );
}
