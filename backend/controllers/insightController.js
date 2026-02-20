// const Goal = require("../models/Goal");
// const GitHubStat = require("../models/GitHubStat");
// const CommitHistory = require("../models/CommitHistory");

// const getSmartSuggestions = async (req, res) => {
//   try {
//     const goal = await Goal.findOne({ user: req.user._id });
//     if (!goal) {
//       return res.status(404).json({ message: "No goal set for this user" });
//     }

//     const todayStr = new Date().toISOString().split("T")[0];
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
//     const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

//     // --------- 1. Get today's commit count from CommitHistory ---------
//     const allCommits = await CommitHistory.find({ user: req.user._id });
//     let todayCommits = 0;
//     allCommits.forEach((entry) => {
//       const dateStr = entry.date.toISOString().split("T")[0];
//       if (dateStr === todayStr) {
//         todayCommits = entry.commitCount;
//       }
//     });

//     // --------- 2. Get total PRs from GitHubStat for last 7 days ---------
//     const allStats = await GitHubStat.find({ user: req.user._id });
//     let totalPRs = 0;
//     allStats.forEach((entry) => {
//       const dateStr = entry.date.toISOString().split("T")[0];
//       if (dateStr >= sevenDaysAgoStr && dateStr <= todayStr) {
//         totalPRs += entry.pullRequests;
//       }
//     });

//     // --------- 3. Create suggestions ---------
//     const suggestions = [];

//     if (todayCommits < goal.dailyCommitGoal) {
//       const remaining = goal.dailyCommitGoal - todayCommits;
//       suggestions.push(
//         `You've made ${todayCommits} commits today. Try pushing ${remaining} more to meet your daily goal of ${goal.dailyCommitGoal}.`
//       );
//     }

//     if (todayCommits === 0) {
//       suggestions.push(
//         `You haven't made any commits today. Your daily goal is ${goal.dailyCommitGoal}. Time to get started! 🚀`
//       );
//     }

//     const remainingPRs = goal.weeklyPRGoal - totalPRs;
//     if (remainingPRs > 0) {
//       suggestions.push(
//         `You've made ${totalPRs} pull requests this week. You have ${remainingPRs} left to meet your weekly goal of ${goal.weeklyPRGoal}.`
//       );
//     }

//     return res.status(200).json({ suggestions });
//   } catch (err) {
//     console.error("Smart Suggestions Error:", err.message);
//     return res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };

// module.exports = { getSmartSuggestions };



const OpenAI = require("openai");
const Goal = require("../models/Goal");
const GitHubStat = require("../models/GitHubStat");
const CommitHistory = require("../models/CommitHistory");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ------------------------- TOOL DEFINITIONS ------------------------- */

const tools = [
  {
    type: "function",
    function: {
      name: "getUserGoal",
      description: "Fetch user's daily commit and weekly PR goals",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getTodayCommits",
      description: "Get today's commit count for the user",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getWeeklyPRs",
      description: "Get total pull requests in last 7 days",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
        },
        required: ["userId"],
      },
    },
  },
];

/* ------------------------- TOOL EXECUTION ------------------------- */

async function handleToolCall(name, args) {
  const userId = args.userId;

  if (name === "getUserGoal") {
    const goal = await Goal.findOne({ user: userId });
    if (!goal) return { error: "No goal found" };

    return {
      dailyCommitGoal: goal.dailyCommitGoal,
      weeklyPRGoal: goal.weeklyPRGoal,
    };
  }

  if (name === "getTodayCommits") {
    const todayStr = new Date().toISOString().split("T")[0];
    const commits = await CommitHistory.find({ user: userId });

    let todayCommits = 0;
    commits.forEach((entry) => {
      const dateStr = entry.date.toISOString().split("T")[0];
      if (dateStr === todayStr) {
        todayCommits = entry.commitCount;
      }
    });

    return { todayCommits };
  }

  if (name === "getWeeklyPRs") {
    const todayStr = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    const stats = await GitHubStat.find({ user: userId });

    let totalPRs = 0;
    stats.forEach((entry) => {
      const dateStr = entry.date.toISOString().split("T")[0];
      if (dateStr >= sevenDaysAgoStr && dateStr <= todayStr) {
        totalPRs += entry.pullRequests;
      }
    });

    return { totalPRs };
  }

  return { error: "Unknown tool" };
}

/* ------------------------- CONTROLLER ------------------------- */

const getSmartSuggestions = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const messages = [
      {
        role: "system",
        content:
          "You are an Engineering Productivity Agent. \
           Always fetch user goal, today's commits, and weekly PRs using tools before generating suggestions. \
           Then provide smart, motivating, and data-driven recommendations.",
      },
      {
        role: "user",
        content: `Analyze my development progress. My userId is ${userId}`,
      },
    ];

    // First LLM Call (planning + tool selection)
    const firstResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
    });

    let message = firstResponse.choices[0].message;

    // If model wants to call tools
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const toolResult = await handleToolCall(
          toolCall.function.name,
          JSON.parse(toolCall.function.arguments)
        );

        messages.push(message);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      // Second LLM Call (final reasoning)
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });

      return res.status(200).json({
        suggestions: finalResponse.choices[0].message.content,
      });
    }

    // If no tools were called
    return res.status(200).json({
      suggestions: message.content,
    });
  } catch (err) {
    console.error("Agent Error:", err);
    return res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports = { getSmartSuggestions };