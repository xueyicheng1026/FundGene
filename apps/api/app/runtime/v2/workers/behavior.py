from app.runtime.v2.schemas import ToolResult, WorkerOutput
from app.runtime.v2.workers.common import (
    collect_evidence,
    finding_from_evidence,
    tool_payload,
)


class BehaviorWorker:
    name = "BehaviorWorker"
    intent = "behavior"

    def run(self, *, message: str, tool_results: list[ToolResult]) -> WorkerOutput:
        behavior = tool_payload(tool_results, "behavior.profile")
        training_plan = tool_payload(tool_results, "behavior.training_plan")
        simulation = tool_payload(tool_results, "simulation.latest_review")
        bias_tags = behavior.get("bias_tags") or []
        training_focus = training_plan.get("training_focus") or behavior.get("training_focus")
        review_summary = simulation.get("latest_review_summary")

        finding = "行为陪练先识别触发情绪的情境，再把情绪和投资动作拆开。"
        if "情境" in message or "演练" in message or "复盘" in message or "simulation" in message.lower():
            finding = "历史情境演练的价值不在于猜对涨跌，而在于练习把情绪和动作拆开并留下复盘证据。"
        if "追涨" in message or "chase" in message.lower():
            finding = "追涨的关键风险是把短期涨幅误当成长期确定性，需要先确认冲动来自计划还是害怕错过。"
        if bias_tags:
            finding += f" 当前画像已出现“{bias_tags[0]}”信号。"
        if training_focus:
            finding += f" 更适合的训练方向是“{training_focus}”。"
        if review_summary:
            finding += f" 最近一次训练复盘提示：{review_summary}"
        elif training_plan.get("summary"):
            finding += f" 当前训练计划提示：{training_plan['summary']}"

        evidence_refs = collect_evidence(tool_results)
        return WorkerOutput(
            worker_name=self.name,
            intent=self.intent,
            findings=[finding],
            structured_findings=[
                finding_from_evidence(
                    claim=finding,
                    evidence_refs=evidence_refs,
                    explanation="行为 worker 将行为画像和最近情境复盘转成训练建议，不把标签当成诊断。",
                    safety_boundary="行为标签是训练线索，不是对用户的永久判断。",
                )
            ],
            evidence_refs=evidence_refs,
            risk_flags=["行为标签是训练线索，不是对用户的永久判断。"],
            recommended_actions=[
                "进入 Simulation，完成当前训练焦点对应的情境训练。",
                "记录最近一次想追涨或想止损时的触发点。",
            ],
            confidence=0.74,
            limitations=["行为判断仅基于问卷、行为画像和最近情境复盘摘要。"],
        )
