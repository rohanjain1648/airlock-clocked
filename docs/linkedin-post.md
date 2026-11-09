# People's Choice — LinkedIn post

_Draft for the one public LinkedIn post that earns People's Choice. Requirements
(rules §8): include a demo/video, link your demo or write-up, tag the official
Clocked page with an **active @mention** (pick it from LinkedIn's suggestions —
pasting the URL does not count), and include **#ClockedChallenge**. Then add the
post URL to the entry form before the deadline._

---

**Would you let an AI agent close your support tickets? Only behind an airlock.**

An autonomous service-desk agent that can change tickets, email customers, and
run fix scripts is only as safe as the weakest message it reads. One injected
"ignore your instructions," one hallucinated "issue resolved," one script that
quietly disables antivirus — and it does real damage.

So I built **Airlock** for the @Clocked Build Challenge: a trust layer that runs
every ticket and every action through **ten Clocked endpoints**, where each gate
changes what the agent is allowed to do 👇

🛡️ **Guard** catches a prompt injection and *locks automation* — and drops a
poisoned knowledge-base article before the agent ever reads it
🕵️ **Protect** masks the only text the agent sees
🔬 **Inspect** disables the one-click "Run fix" when a script tries to blind
endpoint security
🧭 **Rerank + Compare** pick the right-tenant article, cluster a duplicate major
incident, and suppress a conflicting KB page
✅ **Verify** catches "your VPN access has been restored" as *contradicted* and
blocks auto-send — routing the draft to a human

Four real-world scenarios, full claim-level evidence, and a live credit/$ meter.
It runs end to end with **no API key** (replay mode), so you can try every gate.

▶️ Try it: _<your demo URL>_
💻 Code + write-up: _<your repo URL>_

What would you gate before you trusted an agent to act? 👇

#ClockedChallenge #AI #AgentSafety #PromptInjection #RAG #LLM

---

**Checklist before posting**
- [ ] Tag the official Clocked page via the @mention suggestion (not a pasted URL)
- [ ] Attach a short screen-recording or the demo GIF
- [ ] Include the demo link and the repo/write-up link
- [ ] `#ClockedChallenge` is present
- [ ] After posting, paste the post URL into the entry form and select People's Choice
- [ ] Do not engage from team accounts (rules §8); organic reactions/reposts/comments only
