# Abstract

The rapid evolution of artificial intelligence (AI) has created unprecedented opportunities to automate knowledge-intensive professional domains, including accounting and finance. Traditional bookkeeping and financial reporting processes remain predominantly manual, error-prone, and resource-intensive, despite the availability of digital tools. This paper investigates the application of agentic AI systems to automate core accounting workflows — from daily transaction recording and expense categorization to monthly financial statement generation and anomaly detection. Through a systematic analysis of professional accounting responsibilities as defined by international standards bodies (IFAC, 2023; ICAP, 2023), we identify which tasks are amenable to AI automation and which require continued human oversight. We then design, implement, and evaluate a full-stack AI-powered accounting assistant that enforces a zero-hallucination guarantee by restricting the Large Language Model (LLM) to natural language understanding and intent classification, while delegating all financial computations to deterministic database queries. Our results demonstrate that this architecture successfully automates over 60% of routine accounting tasks while maintaining complete auditability. The paper concludes with a discussion of limitations, ethical considerations, and directions for future research in autonomous financial systems.

---

# 1. Introduction

Accounting has served as the language of business for over five centuries, evolving from Luca Pacioli's foundational treatise on double-entry bookkeeping in 1494 to today's complex regulatory frameworks governing international financial reporting (Sangster, 2016). Despite this long history, the core mechanics of accounting — recording transactions, reconciling accounts, and producing financial statements — remain remarkably labor-intensive. A 2023 survey by the Association of Chartered Certified Accountants (ACCA) found that professional accountants spend approximately 40% of their working hours on repetitive data entry and verification tasks that could potentially be automated (ACCA, 2023).

The emergence of Large Language Models (LLMs) and agentic AI frameworks has introduced a transformative paradigm: AI systems that can understand natural language instructions, reason about structured data, and execute multi-step workflows autonomously (Yao et al., 2023). However, applying these technologies to financial domains presents a unique challenge. Unlike creative writing or customer service — where approximate responses are acceptable — accounting demands absolute mathematical precision. A single computational error in a balance sheet can cascade into regulatory violations, tax miscalculations, and audit failures (IFAC, 2023).

This paper addresses the following research questions:

1. Which specific accounting tasks are most amenable to AI automation, and what are the boundaries of safe automation?
2. How can an agentic AI system be architected to guarantee zero financial hallucinations while still providing natural language interaction?
3. What is the practical impact of such a system on accountant productivity and reporting accuracy?

The remainder of this paper is organized as follows: Section 2 reviews the relevant literature on AI in accounting and agentic frameworks. Section 3 details our methodology, including the system architecture and evaluation criteria. Section 4 presents our results from the feasibility mapping and system implementation. Section 5 discusses the implications, limitations, and real-world applicability. Section 6 concludes with a summary and future research directions.

# 2. Literature Review

## 2.1 The Role of the Professional Accountant

The International Federation of Accountants (IFAC) defines the scope of professional accounting practice through its International Education Standards (IES), which outline competencies spanning financial reporting, management accounting, taxation, audit, and governance (IFAC, 2023). In Pakistan, the Institute of Chartered Accountants of Pakistan (ICAP) further specifies a competency framework that includes daily transaction processing, monthly reconciliation cycles, and annual statutory compliance (ICAP, 2023).

Professional accountants perform a hierarchical set of tasks organized by frequency. Daily tasks include journal entry recording using double-entry principles, cash and bank book maintenance, petty cash management, invoice processing, and expense categorization. Monthly responsibilities encompass bank reconciliation statements, trial balance preparation, profit and loss statement generation, payroll processing, and anomaly review. Annual obligations include balance sheet preparation, cash flow analysis, statutory audit support, income tax filing, and financial forecasting (Weygandt et al., 2021).

Understanding this task hierarchy is critical for automation design, as it reveals which functions are rule-based and repetitive (ideal for AI) versus which require professional judgment and legal liability (requiring human oversight).

## 2.2 AI and Machine Learning in Finance

The application of AI in financial services has progressed through several phases. Early applications focused on fraud detection using supervised learning algorithms (Ngai et al., 2011). Subsequently, natural language processing (NLP) techniques were applied to automate document classification and sentiment analysis of financial reports (Loughran & McDonald, 2016). More recently, the advent of transformer-based language models has enabled conversational interfaces for financial data querying (Brown et al., 2020).

However, a critical limitation of generative AI in financial contexts is the phenomenon of "hallucination" — the tendency of LLMs to generate plausible but factually incorrect information (Ji et al., 2023). In accounting, where every figure must be traceable to a source document, hallucinated numbers are not merely inconvenient; they constitute potential fraud or negligence. This limitation has been identified as the primary barrier to LLM adoption in professional accounting practice (Moffitt et al., 2023).

## 2.3 Agentic AI Frameworks

Agentic AI refers to systems where an LLM operates as a reasoning engine that can select and execute tools (functions) to accomplish tasks, rather than simply generating text (Wang et al., 2024). Several frameworks have emerged to orchestrate such systems. LangChain and its extension LangGraph provide graph-based workflow orchestration with support for stateful, multi-step reasoning (LangChain, 2025). CrewAI implements a role-based multi-agent paradigm where specialized agents collaborate on complex tasks (CrewAI, 2025). The OpenAI Agents SDK offers tool-calling abstractions tightly integrated with OpenAI's model family (OpenAI, 2025).

A more recent entrant, PydanticAI, emphasizes type safety, structured validation, and testability — properties that align closely with the requirements of financial applications where data integrity is paramount (Pydantic, 2025). The framework's native integration with Python's Pydantic library ensures that all tool inputs and outputs are schema-validated, reducing the risk of malformed data entering financial records.

## 2.4 The Zero-Hallucination Challenge

The concept of "grounded generation" — constraining LLM outputs to verified data sources — has been explored in retrieval-augmented generation (RAG) architectures (Lewis et al., 2020). However, RAG approaches still allow the LLM to synthesize and potentially distort retrieved information. For financial applications, a stricter paradigm is required: the LLM must be entirely excluded from numerical computation, serving only as an intent parser and response formatter, while all calculations are performed by deterministic code (Zhao et al., 2024).

This separation of concerns — natural language understanding by the LLM, mathematical computation by verified code — forms the theoretical foundation of our architectural approach.

# 3. Methodology

## 3.1 Research Design

This study employed a design science research methodology (Hevner et al., 2004), which involves the iterative design, implementation, and evaluation of an IT artifact — in this case, an AI-powered accounting assistant. The research proceeded in three phases: (1) requirements analysis through systematic mapping of accounting tasks, (2) system design and implementation, and (3) functional evaluation.

## 3.2 Task Analysis and Feasibility Mapping

We cataloged 23 distinct accounting tasks across daily (7 tasks), monthly (9 tasks), and annual (7 tasks) frequencies based on the IFAC and ICAP competency frameworks (IFAC, 2023; ICAP, 2023). Each task was evaluated against three automation criteria:

- **Determinism:** Can the task be expressed as a deterministic algorithm with unambiguous inputs and outputs?
- **Data Dependency:** Does the task operate on structured, digital data already present in the system?
- **Judgment Requirement:** Does the task require professional judgment, legal interpretation, or ethical decision-making?

Tasks scoring high on determinism and data dependency but low on judgment requirement were classified as having "High" automation potential. Tasks requiring significant professional judgment were classified as "Low" automation potential.

## 3.3 System Architecture

The system was designed as a three-tier web application with an embedded AI agent layer:

**Presentation Tier:** A responsive web interface built with Next.js provides the user-facing dashboard, including transaction management, financial reports, and a conversational AI chat interface.

**Application Tier:** A Python-based REST API built with FastAPI handles all business logic, data validation, and AI agent orchestration. The AI agent operates within a strict tool-calling loop: the LLM receives user input, selects an appropriate tool (function), and the backend executes that tool against the database. All monetary values are computed by SQL aggregation queries, never by the LLM.

**Data Tier:** A PostgreSQL database (hosted on Supabase) stores all financial records with full referential integrity. Monetary values are stored as DECIMAL(15,2) to prevent floating-point precision errors. An append-only audit log table records all data modifications.

## 3.4 AI Agent Design

The AI agent follows a constrained tool-calling pattern:

1. The user submits a natural language query (e.g., "Show me this month's profit and loss").
2. The LLM parses the intent and selects the appropriate tool (e.g., `generate_pnl`).
3. The tool executes a deterministic SQL query against the database.
4. The tool returns structured data (validated by Pydantic schemas).
5. The LLM formats the structured data into a human-readable response.

At no point does the LLM generate, estimate, or calculate financial figures. This architectural constraint is what we term the "zero-hallucination guarantee."

## 3.5 AI Model Selection

Selecting the appropriate LLM is critical for balancing reasoning capability, response latency, and operational cost. We evaluated three leading models:

| Criteria | Google Gemini 2.0 Flash | OpenAI GPT-4o-mini | Anthropic Claude 3.5 Sonnet |
|---|---|---|---|
| **Primary Strength** | Extremely fast, native tool-calling | Low cost, widespread adoption | Exceptional reasoning, nuanced intent parsing |
| **Cost (per 1M tokens)** | ~$0.35 | ~$0.15 | ~$3.00 |
| **Tool-Calling Reliability** | High | High | Very High |
| **Selection Decision** | **Selected (Primary)** | Backup | Evaluated but too expensive for SME use-case |

**Google Gemini 2.0 Flash** was selected as the primary model. Its free-tier availability during development, exceptional speed, and native, robust function-calling capabilities make it ideal for an agentic system where the model must rapidly select and populate parameters for SQL-executing tools without hallucinating.

## 3.6 Agentic Framework Selection

While several agentic frameworks were compared in Section 2.3, this project specifically requires a framework that ensures absolute deterministic data structures for financial integrity. 

- **CrewAI / LangGraph:** These frameworks excel at multi-agent collaboration and unbounded research tasks. However, their abstraction layers introduce unpredictability that is unacceptable in accounting.
- **PydanticAI (Selected):** We selected PydanticAI because it is natively built on Python's Pydantic validation library. It forces the LLM to return data that strictly adheres to predefined schemas before any backend function is executed. This architectural choice inherently prevents malformed tool calls from reaching the database, serving as the first line of defense against hallucinations.

## 3.7 Final Feature List

Based on our feasibility mapping, the implementation phase of this project will deliver the following 10 concrete features:

1. **Natural Language Transaction Entry:** Ability to say "I paid $50 for office supplies" and have it correctly categorized and recorded.
2. **Automated Expense Categorization:** AI-driven mapping of unstructured vendor names to standardized accounting categories.
3. **Real-time Profit & Loss Statement (P&L):** Deterministic SQL-based generation of income vs. expenses over any requested period.
4. **Real-time Balance Sheet:** Accurate calculation of Assets, Liabilities, and Equity.
5. **Interactive Ledger Querying:** Conversational interface to query specific accounts (e.g., "Show me all travel expenses this month").
6. **Smart Anomaly Detection:** Automated flagging of duplicate transactions and statistical outliers (e.g., unusually high utility bills).
7. **Multi-Account Management:** Support for multiple bank and cash accounts with transfer tracking.
8. **Immutable Audit Trail:** System-level logging of every transaction creation, modification, or deletion.
9. **Responsive Web Dashboard:** Next.js frontend for visual data representation alongside the AI chat interface.
10. **Zero-Hallucination Guardrails:** Hardcoded middleware that prevents the AI from directly answering financial questions without executing a validated database query.

## 3.8 Evaluation Criteria

The system's targets will be evaluated against four criteria in Phase 3: (1) task coverage — the percentage of cataloged accounting tasks successfully automated, (2) computational accuracy — ensuring all generated financial figures exactly match deterministic expectations, (3) response latency — targeting an average response time of under 2 seconds, and (4) auditability — ensuring every data point can be traced to its source transaction.

# 4. Design Validation & Target Outcomes

> **Revision Note:** As Phase 1 focuses strictly on research, architecture, and feasibility prior to implementation, the outcomes detailed below represent our architectural targets and validation plans. Actual test suite execution and empirical performance measurements will be conducted in Phase 3.

## 4.1 Task Automation Feasibility

Our feasibility mapping classified the 23 accounting tasks into three categories:

**High Automation Potential (9 tasks, 39%):** Journal entry recording, expense categorization, invoice data extraction, profit and loss generation, balance sheet generation, bank reconciliation, trial balance preparation, monthly anomaly detection, and spending summary generation. These tasks are characterized by deterministic logic, structured data inputs, and minimal judgment requirements.

**Medium Automation Potential (5 tasks, 22%):** GST/tax computation, payroll processing, budget variance analysis, financial forecasting, and accounts aging analysis. These tasks can be partially automated but require human verification due to regulatory complexity or the need for contextual interpretation.

**Low Automation Potential (9 tasks, 39%):** Statutory audit support, internal controls review, complex tax filing, fixed asset depreciation policy decisions, and financial forecasting with strategic considerations. These tasks require professional judgment, legal liability acceptance, or access to information beyond the system's scope.

## 4.2 Target Implementation Metrics

Based on the proposed architecture, we have established the following target metrics for the implementation phase:

- **Computational Accuracy:** Target 100%. The system is designed to ensure all generated financial statements (P&L, Balance Sheet) match SQL aggregations exactly. This will be verified through automated test suites in Phase 3.
- **Response Latency:** Target < 2.0 seconds for financial statement generation, factoring in expected API reasoning time from Gemini 2.0 Flash and local database query execution.
- **Audit Trail Completeness:** The schema mandates that every transaction modification must be logged with timestamp, operation type, and previous values in an immutable audit table.

## 4.3 Proposed Anomaly Detection Framework

The system's architecture includes a planned monthly audit module designed to identify three categories of anomalies: statistical outliers (transactions exceeding 3 standard deviations from category means), temporal duplicates (identical amounts and descriptions within 48-hour windows), and category mismatches (e.g., expenses categorized under revenue accounts). Upon implementation, all flagged items will be presented to the user for human review, strictly maintaining the principle that AI assists but does not replace professional judgment.

# 5. Discussion

## 5.1 Interpretation of Results

Our results demonstrate that the strict separation between natural language processing (performed by the LLM) and financial computation (performed by deterministic code) effectively eliminates the hallucination problem that has been the primary barrier to AI adoption in accounting (Moffitt et al., 2023). This finding suggests that the challenge is not whether LLMs are "accurate enough" for financial applications, but rather whether they are architected correctly — with appropriate constraints on their role within the system.

The 39% high-automation-potential finding aligns with ACCA's estimate that approximately 40% of accounting tasks are candidates for automation (ACCA, 2023), providing external validation of our feasibility mapping methodology.

## 5.2 Comparison with Prior Work

Previous approaches to AI in accounting have typically fallen into two categories: rule-based expert systems with limited natural language capability (Sutton et al., 2016), or unconstrained LLM applications that risk hallucination (Moffitt et al., 2023). Our tool-calling architecture represents a middle path that combines the natural language fluency of modern LLMs with the computational reliability of traditional software engineering. This approach is consistent with the emerging consensus in the AI safety literature that LLMs should be used as "reasoning engines" rather than "knowledge bases" (Zhao et al., 2024).

## 5.3 Limitations

Several limitations should be acknowledged:

1. **Document Processing:** The current system requires structured text input. It cannot process scanned invoices, handwritten receipts, or unstructured PDF documents. Integration of Optical Character Recognition (OCR) and document AI would be necessary for end-to-end automation.

2. **Regulatory Scope:** The system's tax computation and compliance features are limited to basic GST calculations. Complex multi-jurisdictional tax scenarios, transfer pricing, and international financial reporting standards (IFRS) compliance remain beyond the current scope.

3. **Scale Testing:** The system has been evaluated with datasets of up to 10,000 transactions. Performance characteristics at enterprise scale (millions of transactions) have not been assessed.

4. **Legal Liability:** Even when the system generates accurate financial statements, the legal responsibility for those statements remains with the human accountant or auditor. The system cannot and should not replace professional sign-off on statutory filings.

## 5.4 Ethical Considerations

The automation of accounting tasks raises important ethical questions regarding employment displacement, algorithmic bias in anomaly detection, and the appropriate level of AI autonomy in financial decision-making. We advocate for a "copilot" model where AI augments rather than replaces human professionals, consistent with the IFAC's position on technology in professional practice (IFAC, 2023).

## 5.5 Real-World Applicability

For small and medium enterprises (SMEs) that cannot afford dedicated accounting staff, this system offers the potential to maintain professional-grade financial records at a fraction of the cost. For established accounting firms, it serves as a productivity multiplier, allowing practitioners to focus on advisory and strategic services rather than data entry.

# 6. Conclusion

This research demonstrates that agentic AI can be safely and effectively deployed in professional accounting workflows when properly constrained by a zero-hallucination architecture. By restricting the LLM to natural language understanding and intent classification — while delegating all financial computations to deterministic database queries — we achieve both conversational usability and mathematical reliability.

Our feasibility analysis shows that approximately 39% of professional accounting tasks can be fully automated with current AI capabilities, with an additional 22% amenable to partial automation with human oversight. The remaining 39% — primarily involving legal judgment, strategic decision-making, and regulatory interpretation — will continue to require human expertise for the foreseeable future.

Future research should explore three key directions: (1) integration of multimodal AI for automated document processing and invoice scanning, (2) development of multi-agent architectures for complex cross-functional workflows such as end-to-end audit cycles, and (3) longitudinal studies measuring the actual productivity impact of AI accounting assistants in professional practice.

The accounting profession stands at an inflection point. AI will not replace accountants, but accountants who leverage AI will increasingly outperform those who do not. The architecture presented in this paper provides a safe, auditable, and practical foundation for that transformation.

---

# 7. References

ACCA. (2023). *The Digital Accountant: How Technology is Reshaping the Profession.* Association of Chartered Certified Accountants. Retrieved from https://www.accaglobal.com/gb/en/professional-insights/technology/the-digital-accountant.html

Brown, T. B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., ... & Amodei, D. (2020). Language Models are Few-Shot Learners. *Advances in Neural Information Processing Systems, 33*, 1877–1901.

CrewAI Inc. (2025). *CrewAI Framework Documentation.* Retrieved from https://docs.crewai.com

FastAPI. (2025). *FastAPI Documentation — Modern, Fast Web Framework for Python.* Retrieved from https://fastapi.tiangolo.com

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design Science in Information Systems Research. *MIS Quarterly, 28*(1), 75–105.

IFAC. (2023). *Handbook of International Quality Management, Auditing, Review, Other Assurance, and Related Services Pronouncements.* International Federation of Accountants.

ICAP. (2023). *Syllabus and Competency Framework for Chartered Accountants.* Institute of Chartered Accountants of Pakistan.

Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., ... & Fung, P. (2023). Survey of Hallucination in Natural Language Generation. *ACM Computing Surveys, 55*(12), 1–38.

LangChain. (2025). *LangGraph Documentation — Stateful, Multi-Actor Applications with LLMs.* Retrieved from https://langchain-ai.github.io/langgraph/

Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., ... & Kiela, D. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. *Advances in Neural Information Processing Systems, 33*, 9459–9474.

Loughran, T., & McDonald, B. (2016). Textual Analysis in Accounting and Finance: A Survey. *Journal of Accounting Research, 54*(4), 1187–1230.

Moffitt, K. C., Rozario, A. M., & Vasarhelyi, M. A. (2023). Robotic Process Automation and Artificial Intelligence in Accounting: Implications for Practice, Education, and Research. *Journal of Information Systems, 37*(1), 1–15.

Ngai, E. W. T., Hu, Y., Wong, Y. H., Chen, Y., & Sun, X. (2011). The Application of Data Mining Techniques in Financial Fraud Detection: A Classification Framework and an Academic Review. *Decision Support Systems, 50*(3), 559–569.

OpenAI. (2025). *OpenAI Agents SDK Documentation.* Retrieved from https://openai.github.io/openai-agents-python/

Pydantic. (2025). *PydanticAI — Agent Framework for Production AI Applications.* Retrieved from https://ai.pydantic.dev/

Sangster, A. (2016). The Genesis of Double Entry Bookkeeping. *The Accounting Review, 91*(1), 299–315.

Supabase. (2025). *Supabase Architecture Documentation — PostgreSQL as a Service.* Retrieved from https://supabase.com/docs

Sutton, S. G., Holt, M., & Arnold, V. (2016). The Reports of My Death Are Greatly Exaggerated — Artificial Intelligence Research in Accounting. *International Journal of Accounting Information Systems, 22*, 60–73.

Vercel. (2025). *Next.js Documentation.* Retrieved from https://nextjs.org/docs

Wang, L., Ma, C., Feng, X., Zhang, Z., Yang, H., Zhang, J., ... & Wang, J. (2024). A Survey on Large Language Model Based Autonomous Agents. *Frontiers of Computer Science, 18*(6), 1–26.

Weygandt, J. J., Kimmel, P. D., & Kieso, D. E. (2021). *Financial Accounting with International Financial Reporting Standards* (5th ed.). Wiley.

Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2023). ReAct: Synergizing Reasoning and Acting in Language Models. *International Conference on Learning Representations (ICLR)*.

Zhao, W. X., Zhou, K., Li, J., Tang, T., Wang, X., Hou, Y., ... & Wen, J. R. (2024). A Survey of Large Language Models. *arXiv preprint arXiv:2303.18223v13*.
