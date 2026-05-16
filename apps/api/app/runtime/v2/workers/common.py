from app.runtime.v2.schemas import EvidenceRef, ToolResult, WorkerFinding


def tool_payload(tool_results: list[ToolResult], tool_name: str) -> dict:
    for result in tool_results:
        if result.tool_name == tool_name:
            return result.output_payload
    return {}


def collect_evidence(tool_results: list[ToolResult]) -> list[EvidenceRef]:
    return [evidence for result in tool_results for evidence in result.evidence_refs]


def evidence_keys(evidence_refs: list[EvidenceRef]) -> list[str]:
    keys = [
        f"{evidence.source_type}:{evidence.source_id}"
        if evidence.source_id
        else evidence.source_type
        for evidence in evidence_refs
    ]
    return list(dict.fromkeys(keys))


def finding_from_evidence(
    *,
    claim: str,
    evidence_refs: list[EvidenceRef],
    explanation: str | None = None,
    safety_boundary: str | None = None,
) -> WorkerFinding:
    return WorkerFinding(
        claim=claim,
        explanation=explanation,
        evidence_refs=evidence_keys(evidence_refs),
        support_level="direct" if evidence_refs else "unsupported",
        safety_boundary=safety_boundary,
    )
