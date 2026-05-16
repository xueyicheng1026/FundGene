from app.runtime.v2.schemas import ToolResult, WorkerOutput
from app.runtime.v2.workers.common import (
    collect_evidence,
    finding_from_evidence,
    tool_payload,
)


class NewsWorker:
    name = "NewsWorker"
    intent = "news"

    def run(self, *, message: str, tool_results: list[ToolResult]) -> WorkerOutput:
        news = tool_payload(tool_results, "news.latest_analysis")
        impact_lens = tool_payload(tool_results, "news.impact_lens")
        evidence_payload = tool_payload(tool_results, "news.policy_evidence_search")
        title = news.get("title")
        translation = news.get("beginner_translation")
        evidence_hits = evidence_payload.get("hits") or []

        finding = "新闻解读先分清事实、影响路径和不确定性，不要把标题情绪直接当成投资结论。"
        if translation:
            finding += f" 最近一条真实新闻/政策分析是“{title}”：{translation}"
        elif title:
            finding += f" 当前最近信息是“{title}”，但还需要生成结构化解读。"
        if impact_lens.get("summary"):
            finding += f" 影响路径约束：{impact_lens['summary']}"
        if evidence_hits:
            first_hit = evidence_hits[0]
            finding += f" 检索证据提示：{first_hit.get('snippet')}"

        action = news.get("recommended_action") or "回到 News，选择一条新闻或政策生成结构化解读。"

        evidence_refs = collect_evidence(tool_results)
        return WorkerOutput(
            worker_name=self.name,
            intent=self.intent,
            findings=[finding],
            structured_findings=[
                finding_from_evidence(
                    claim=finding,
                    evidence_refs=evidence_refs,
                    explanation="新闻 worker 将最近持久化解读和政策检索证据转成影响路径解释。",
                    safety_boundary="新闻/政策解读不能被当作买卖建议。",
                )
            ],
            evidence_refs=evidence_refs,
            risk_flags=["新闻/政策解读不能被当作买卖建议。"],
            recommended_actions=[
                action,
                "继续追问这条信息通过什么路径影响你正在学习或持有的基金类型。",
            ],
            confidence=0.72,
            limitations=["当前新闻解释引用最近持久化解读和关键词检索到的新闻/政策证据。"],
        )
