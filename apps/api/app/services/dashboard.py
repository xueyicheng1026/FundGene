from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.models.user import UserProfile
from app.schemas.dashboard import (
    DashboardCoachActivity,
    DashboardLearningStatus,
    DashboardPortfolioStatus,
    DashboardResponse,
    DashboardSimulationStatus,
    DashboardSummaryCard,
)
from app.services.behavior import (
    get_behavior_profile,
    get_behavior_training_plan,
    get_latest_questionnaire,
)
from app.services.learning import get_learning_overview
from app.services.news import get_news_overview
from app.services.portfolio import get_portfolio_overview
from app.services.simulation import get_latest_simulation_overview


def _truncate(text: str, *, limit: int = 96) -> str:
    normalized = " ".join(text.strip().split())
    if len(normalized) <= limit:
        return normalized
    return f"{normalized[:limit].rstrip()}..."


def get_latest_coach_activity(
    db: Session, *, user_id: str
) -> DashboardCoachActivity | None:
    latest_response = db.execute(
        select(ChatSession, ChatMessage)
        .join(ChatMessage, ChatMessage.session_id == ChatSession.id)
        .where(
            ChatSession.user_id == user_id,
            ChatSession.context_type == "coach",
            ChatMessage.role == "assistant",
        )
        .order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc())
    ).first()

    if latest_response is None:
        return None

    session, assistant_message = latest_response
    latest_question = db.scalar(
        select(ChatMessage.content)
        .where(
            ChatMessage.session_id == session.id,
            ChatMessage.role == "user",
            ChatMessage.created_at <= assistant_message.created_at,
        )
        .order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc())
    )
    payload = assistant_message.structured_payload or {}
    recommended_actions = payload.get("recommended_actions")
    intent = payload.get("intent")

    return DashboardCoachActivity(
        session_id=session.id,
        topic=session.topic,
        intent=intent if isinstance(intent, str) else None,
        question=latest_question or session.topic,
        answer_focus=_truncate(assistant_message.content),
        recommended_action=(
            recommended_actions[0]
            if isinstance(recommended_actions, list)
            and recommended_actions
            and isinstance(recommended_actions[0], str)
            else None
        ),
        updated_at=assistant_message.created_at,
    )


def build_dashboard_state(db: Session, *, user: UserProfile) -> DashboardResponse:
    behavior_profile = get_behavior_profile(db, user_id=user.id)
    latest_questionnaire = get_latest_questionnaire(db, user_id=user.id)
    latest_coach_activity = get_latest_coach_activity(db, user_id=user.id)
    learning_overview = (
        get_learning_overview(db, user_id=user.id)
        if user.onboarding_completed
        else DashboardLearningStatus(
            overall_progress_percentage=0,
            completed_courses_count=0,
            total_courses=0,
        )
    )
    portfolio_overview = (
        get_portfolio_overview(db, user_id=user.id)
        if user.onboarding_completed
        else DashboardPortfolioStatus(has_report=False)
    )
    simulation_overview = (
        get_latest_simulation_overview(db, user_id=user.id)
        if user.onboarding_completed
        else DashboardSimulationStatus(completed_sessions_count=0)
    )
    news_overview = (
        get_news_overview(db, user_id=user.id)
        if user.onboarding_completed
        else None
    )
    behavior_training_plan = (
        get_behavior_training_plan(db, user=user)
        if user.onboarding_completed
        else None
    )

    risk_level = behavior_profile.risk_level if behavior_profile else None
    bias_tags = behavior_profile.bias_tags if behavior_profile else []

    if user.onboarding_completed and latest_questionnaire is not None:
        next_actions = [
            (
                f"进入 Simulation，优先完成“{behavior_training_plan.focus_title}”方向的情境训练。"
                if behavior_training_plan is not None
                else "回看当前偏差标签，先挑一个最容易失守的行为作为本周训练重点。"
            ),
            (
                f"进入 Learning，先完成《{learning_overview.recommended_course_title}》这门课。"
                if learning_overview.recommended_course_title
                else "进入 Learning，继续巩固你的基金基础课。"
            ),
            (
                "进入 Portfolio，查看最近一份组合体检报告。"
                if portfolio_overview.has_report
                else "进入 Portfolio，录入第一份手工持仓快照。"
            ),
            (
                "回看最近一次情境训练复盘，把失守节点写成一句固定检查语。"
                if simulation_overview.latest_review_summary
                else "完成第一条情境训练后，这里会出现更具体的行为复盘动作。"
            ),
        ]
        questionnaire_value = "已完成"
    else:
        next_actions = [
            "先完善基础画像，让 dashboard 具备最小上下文。",
            "完成第一版风险与行为问卷，建立风险等级与偏差基线。",
            "回到 dashboard 查看个性化动作建议，再进入下一条产品路径。",
        ]
        questionnaire_value = "待完成"

    if latest_coach_activity is not None:
        coach_next_action = (
            latest_coach_activity.recommended_action
            or "回到 Coach，继续追问你最近一次基金基础问题。"
        )
        next_actions = [
            f"延续最近一次 Coach 主题“{latest_coach_activity.topic}”：{coach_next_action}",
            *next_actions[:2],
        ]

    if news_overview is not None and news_overview.has_analysis:
        next_actions = [
            f"回看最近新闻/政策分析“{news_overview.latest_title}”：{news_overview.recommended_action}",
            *next_actions[:3],
        ]

    summary_cards = [
        DashboardSummaryCard(
            label="问卷状态",
            value=questionnaire_value,
            detail="风险与行为基线来自最新一次问卷提交。",
        ),
        DashboardSummaryCard(
            label="风险等级",
            value=risk_level or "待评估",
            detail="结合波动承受、回撤反应与投资期限得出。",
        ),
        DashboardSummaryCard(
            label="行为焦点",
            value=bias_tags[0] if bias_tags else "待建立画像",
            detail="偏差标签会影响 coaching 与 dashboard 的下一步建议。",
        ),
        DashboardSummaryCard(
            label="学习进度",
            value=(
                f"{learning_overview.overall_progress_percentage}%"
                if learning_overview.total_courses > 0
                else "待开始"
            ),
            detail=(
                f"已完成 {learning_overview.completed_courses_count}/{learning_overview.total_courses} 门基础课。"
                if learning_overview.total_courses > 0
                else "学习路径会在进入 Learning 后形成真实进度。"
            ),
        ),
        DashboardSummaryCard(
            label="组合体检",
            value=(
                "已有报告"
                if portfolio_overview.has_report
                else "待录入"
            ),
            detail=(
                portfolio_overview.summary
                if portfolio_overview.summary
                else "录入第一份持仓快照后，这里会显示最近一份组合解释。"
            ),
        ),
        DashboardSummaryCard(
            label="情境训练",
            value=(
                f"{simulation_overview.completed_sessions_count} 次"
                if simulation_overview.completed_sessions_count > 0
                else "待开始"
            ),
            detail=(
                simulation_overview.latest_review_summary
                if simulation_overview.latest_review_summary
                else (
                    f"建议先从《{simulation_overview.recommended_scenario_title}》开始。"
                    if simulation_overview.recommended_scenario_title
                    else "开始第一条情境训练后，这里会显示最近一次复盘结果。"
                )
            ),
        ),
        DashboardSummaryCard(
            label="新闻政策",
            value=(
                "已有解读"
                if news_overview is not None and news_overview.has_analysis
                else "待解读"
            ),
            detail=(
                news_overview.beginner_translation
                if news_overview is not None
                and news_overview.has_analysis
                and news_overview.beginner_translation
                else "完成第一条新闻/政策分析后，这里会显示事实、影响路径和不确定性。"
            ),
        ),
        DashboardSummaryCard(
            label="最近 Coach",
            value=latest_coach_activity.topic if latest_coach_activity else "尚无记录",
            detail=(
                "最近一次 coach 交互会回写到 dashboard，形成可回看的训练痕迹。"
                if latest_coach_activity
                else "完成第一条 coach 问答后，这里会出现最近一次指导痕迹。"
            ),
        ),
    ]

    return DashboardResponse(
        user_id=user.id,
        onboarding_completed=user.onboarding_completed,
        risk_level=risk_level,
        bias_tags=bias_tags,
        latest_risk_score=(
            latest_questionnaire.risk_score if latest_questionnaire else None
        ),
        next_actions=next_actions,
        summary_cards=summary_cards,
        learning_status=learning_overview,
        portfolio_status=portfolio_overview,
        simulation_status=simulation_overview,
        news_status=news_overview,
        latest_coach_activity=latest_coach_activity,
    )
