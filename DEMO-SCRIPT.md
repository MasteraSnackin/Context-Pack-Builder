# Context Pack Builder - Hackathon Demo Script

## 🎯 60-Second Demo Script

### Hook (5 seconds)
"Before starting any task, you waste 15 minutes gathering context across GitHub, docs, and calendar."

### Problem (10 seconds)
"Imagine you're assigned 'Ship feature X'. Let me show you the old way:
- Open GitHub → search commits
- Open Drive → find spec
- Check calendar → meetings
- Check Slack → context

**Exhausting.**"

### Solution (30 seconds)
[Open Context Pack Builder widget in Claude Desktop]

"Instead, I type my goal and click Build Context Pack."

**[Type: "Ship feature X"]**
**[Click "Build Context Pack"]**

[Show loading - 5 seconds]

**[Results appear]**

"In 10 seconds, I have everything:
- **Summary**: Feature X is a new API endpoint for user preferences
- **8 git commits** to review
- **3 docs**: spec, design, README
- **4 code files**: implementation + tests
- **Open questions**: 'Is auth required? What's the data retention policy?'
- **Next actions**:
  1. Review PR #42
  2. Run integration tests
  3. Schedule rollout demo"

### Closer (15 seconds)
"This works for any task:
- Debugging incidents
- Planning features
- Onboarding to new codebases

It saves **15 minutes every time you context-switch**.

And because it's an MCP app, it works **directly in Claude** — connecting systems Claude can't normally access."

---

## 🚀 Setup Instructions

### Before the Demo

1. **Start the dev server:**
   ```bash
   cd hacknight-repo
   pnpm dev
   ```

2. **Open DevTools:** http://localhost:3000/

3. **Configure Claude Desktop** (if demoing in Claude):
   Add to `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "context-pack-builder": {
         "url": "http://localhost:3000/mcp"
       }
     }
   }
   ```

4. **Set demo directory:**
   Make sure your terminal is in the `demo-repo/` directory or configure filesystem MCP to search there.

### Test Run (Do This 3 Times Before Demo)

1. Type: **"Ship feature X"**
2. Click: **Build Context Pack**
3. Wait 5-10 seconds
4. Verify results appear:
   - Summary ✓
   - Git commits (8 total) ✓
   - Docs (spec.md, design.md, README.md) ✓
   - Code files (feature-x.ts, feature-x.test.ts) ✓
   - Open questions ✓
   - Next actions ✓

---

## 📊 Judging Criteria Alignment

### ✅ Everyday Workplace Challenge (30%)
- **Pain Point**: 15-20 minutes of manual context gathering before every task
- **Broad Applicability**: Works for debugging, planning, reviewing, onboarding
- **Relatable**: Judges will recognize this from their own work

### ✅ Technical Execution (30%)
- **Proper MCP Usage**: Connects multiple MCP servers (filesystem + git)
- **Structured Output**: Not just text — organized by type (code/docs/other)
- **Persistent Storage**: Saves to Supabase for reuse
- **Clean UI**: Skybridge widget with purple gradient theme

### ✅ Demo Quality (25%)
- **Clear Value Prop**: First 10 seconds establish the problem
- **Live Demo**: Not slides — actual working app
- **Relatable Example**: "Ship feature X" resonates with engineers
- **Before/After Contrast**: Manual searching vs. one-click context pack

### ✅ Innovation (15%)
- **Novel Use Case**: Context aggregation, not CRUD
- **LLM Orchestration**: Aggregates multiple sources intelligently via Claude API
- **Extensibility**: Easy to add more MCP servers (GitHub, Calendar, Slack)

---

## 🎬 Backup Plan (If Demo Fails)

### Pre-Record Video
Before the event, record:
1. Screen recording of successful demo
2. Voice narration following the script
3. Duration: 60 seconds max

### Screenshots
Have ready:
- Empty state (before building)
- Loading spinner
- Final context pack results
- Past packs list

### Narration from Screenshots
If live demo breaks, use screenshots and say:
"Let me walk you through what happens [show screenshot]..."

---

## 🤔 Judges' Questions - Prepared Answers

**Q**: "Why not just ask Claude to search?"

**A**: "Claude can't access your private repos, local files, or calendar without MCP. This connects multiple systems Claude doesn't have access to, then aggregates them intelligently."

---

**Q**: "How is this different from a search tool?"

**A**: "Search gives you 100 results. This gives you 5 key resources, 3 questions, and 3 actions — curated and contextualized by an LLM that understands your goal."

---

**Q**: "What if I don't use Git?"

**A**: "The architecture is modular. Swap Git for Jira, add Notion docs, connect your CRM — it's MCP, so you plug in whatever tools you use."

---

**Q**: "Can I share context packs with my team?"

**A**: "Not in v1, but that's the obvious next feature: save packs to a team workspace, let others benefit from your research."

---

**Q**: "How do you handle large codebases?"

**A**: "We limit results (top 10 files, 5 commits) and use LLM to rank by relevance. For larger codebases, you can configure which directories to search."

---

**Q**: "What's the performance?"

**A**: "On a typical project: 2-3 seconds for filesystem search, 1-2 seconds for git, 3-5 seconds for LLM aggregation. Total: **under 10 seconds** vs. 15-20 minutes manually."

---

## 📁 Demo Repository Contents

Located at: `hacknight-repo/demo-repo/`

```
demo-repo/
├── README.md (Feature X overview)
├── docs/
│   ├── spec.md (API specification)
│   └── design.md (Technical architecture)
├── src/
│   ├── feature-x.ts (Implementation - 111 lines)
│   └── feature-x.test.ts (Tests - 126 lines)
└── .git/ (8 commits mentioning "Feature X")
```

**Git Commits:**
1. feat: add Feature X overview and documentation
2. docs: add Feature X specification and requirements
3. docs: add Feature X technical design and architecture
4. feat: implement Feature X core logic with caching and validation
5. test: add comprehensive tests for Feature X preferences API
6. fix: Feature X edge case handling for null preferences
7. perf: optimize Feature X caching layer for 80% faster reads
8. refactor: improve Feature X error messages and validation

---

## ✅ Pre-Demo Checklist

- [ ] API keys added to `.env` file
- [ ] Database migration run (`pnpm supabase db push`)
- [ ] Dev server starts without errors (`pnpm dev`)
- [ ] DevTools loads at http://localhost:3000/
- [ ] Test demo 3 times successfully
- [ ] Backup video recorded
- [ ] Screenshots ready
- [ ] Demo script memorized
- [ ] Timer set for 60 seconds
- [ ] Laptop fully charged
- [ ] Internet connection tested
- [ ] Claude Desktop configured (if using)

---

## 🎉 Good Luck!

Remember:
- **Speak clearly** and **slowly** (nerves make us rush)
- **Show enthusiasm** — your excitement is contagious
- **Make eye contact** with judges
- **Pause after key points** to let them sink in
- **Smile** — you built something awesome!

You've got this! 🚀
