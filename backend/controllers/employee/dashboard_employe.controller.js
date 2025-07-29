const Project = require("../../models/project");
const Task = require("../../models/task");
const User = require("../../models/user");
const mongoose = require("mongoose");

// Fonction utilitaire pour générer des dates manquantes
const fillMissingDates = (data, startDate, endDate, format) => {
  const dateMap = Object.fromEntries(data.map((d) => [d.date, d]));
  const dates = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = current.toISOString().slice(0, 10);
    dates.push(
      dateMap[dateStr] || {
        date: dateStr,
        pourcentage: 0,
        nombre: "0/0",
        completed: 0,
        total: 0,
      }
    );
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// Statistiques quotidiennes
exports.getDailyStats = async (req, res) => {
  try {
    const { date } = req.query; // Format: YYYY-MM-DD
    const userId = req.user._id;

    const selectedDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const stats = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          late: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$deadline", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgProgress: { $avg: "$progress" },
          dailyCount: { $sum: { $cond: [{ $eq: ["$type", "daily"] }, 1, 0] } },
          longCount: { $sum: { $cond: [{ $eq: ["$type", "long"] }, 1, 0] } },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      late: 0,
      avgProgress: 0,
    };

    res.json({
      date: selectedDate.toISOString().slice(0, 10),
      stats: {
        ...result,
        completionRate:
          result.total > 0
            ? Math.round((result.completed / result.total) * 100)
            : 0,
      },
      tasks: await Task.find({
        assignedTo: userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      })
        .populate("project", "name")
        .sort({ createdAt: -1 }),
    });
  } catch (err) {
    console.error("[Daily Stats Controller] Error:", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques quotidiennes",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Statistiques mensuelles
exports.getMonthlyStats = async (req, res) => {
  try {
    const { year, month } = req.query; // Format: YYYY, MM (1-12)
    const userId = req.user._id;

    const selectedYear = parseInt(year) || new Date().getFullYear();
    const selectedMonth = parseInt(month) || new Date().getMonth() + 1;

    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);
    endDate.setHours(23, 59, 59, 999);

    // Stats quotidiennes pour le mois
    const dailyStats = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          late: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$deadline", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgProgress: { $avg: "$progress" },
          dailyCount: { $sum: { $cond: [{ $eq: ["$type", "daily"] }, 1, 0] } },
          longCount: { $sum: { $cond: [{ $eq: ["$type", "long"] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          total: 1,
          completed: 1,
          inProgress: 1,
          pending: 1,
          late: 1,
          avgProgress: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Stats globales pour le mois
    const monthlyStats = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          late: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$deadline", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgProgress: { $avg: "$progress" },
          dailyCount: { $sum: { $cond: [{ $eq: ["$type", "daily"] }, 1, 0] } },
          longCount: { $sum: { $cond: [{ $eq: ["$type", "long"] }, 1, 0] } },
        },
      },
    ]);

    const filledDailyStats = fillMissingDates(startDate, endDate, "%Y-%m-%d");

    res.json({
      month: `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`,
      stats: monthlyStats[0] || {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        late: 0,
        avgProgress: 0,
        completionRate: 0,
      },
      dailyStats: filledDailyStats,
    });
  } catch (err) {
    console.error("[Monthly Stats Controller] Error:", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques mensuelles",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.getYearlyStats = async (req, res) => {
  try {
    const { year } = req.query;
    const userId = req.user._id;

    const selectedYear = parseInt(year) || new Date().getFullYear();
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    endDate.setHours(23, 59, 59, 999);

    // Stats mensuelles pour l'année
    const monthlyStats = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          late: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$deadline", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgProgress: { $avg: "$progress" },
          dailyCount: { $sum: { $cond: [{ $eq: ["$type", "daily"] }, 1, 0] } },
          longCount: { $sum: { $cond: [{ $eq: ["$type", "long"] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          total: 1,
          completed: 1,
          inProgress: 1,
          pending: 1,
          late: 1,
          avgProgress: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { month: 1 } },
    ]);

    // Stats globales pour l'année
    const yearlyStats = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          late: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$deadline", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgProgress: { $avg: "$progress" },
          dailyCount: { $sum: { $cond: [{ $eq: ["$type", "daily"] }, 1, 0] } },
          longCount: { $sum: { $cond: [{ $eq: ["$type", "long"] }, 1, 0] } },
        },
      },
    ]);

    // Remplir les mois manquants
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, "0");
      return `${selectedYear}-${month}`;
    });

    const monthMap = Object.fromEntries(monthlyStats.map((m) => [m.month, m]));
    const filledMonthlyStats = allMonths.map(
      (month) =>
        monthMap[month] || {
          month,
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          late: 0,
          avgProgress: 0,
          completionRate: 0,
        }
    );

    res.json({
      year: selectedYear,
      stats: yearlyStats[0] || {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        late: 0,
        avgProgress: 0,
        completionRate: 0,
      },
      monthlyStats: filledMonthlyStats,
    });
  } catch (err) {
    console.error("[Yearly Stats Controller] Error:", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques annuelles",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Dashboard utilisateur (version originale avec quelques améliorations)
// exports.getUserStats = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const today = new Date();
//     const startDate = new Date();
//     startDate.setDate(today.getDate() - 6);

//     // Tâches journalières de l'employé
//     const rawDaily = await Task.aggregate([
//       {
//         $match: {
//           type: "daily",
//           assignedTo: userId,
//           createdAt: { $gte: startDate, $lte: today },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//           },
//           total: { $sum: 1 },
//           completed: {
//             $sum: {
//               $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id",
//           pourcentage: {
//             $cond: [
//               { $eq: ["$total", 0] },
//               0,
//               {
//                 $round: [
//                   { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
//                   0,
//                 ],
//               },
//             ],
//           },
//           nombre: {
//             $concat: [
//               { $toString: "$completed" },
//               "/",
//               { $toString: "$total" },
//             ],
//           },
//         },
//       },
//     ]);

//     // Ajouter les jours manquants
//     const getLastNDays = (n) => {
//       const dates = [];
//       for (let i = n - 1; i >= 0; i--) {
//         const d = new Date(today);
//         d.setDate(today.getDate() - i);
//         dates.push(d.toISOString().slice(0, 10));
//       }
//       return dates;
//     };

//     const last7Days = getLastNDays(7);
//     const mapRaw = Object.fromEntries(rawDaily.map((d) => [d.date, d]));

//     const dailyProgression = last7Days.map((date) => {
//       return (
//         mapRaw[date] || {
//           date,
//           pourcentage: 0,
//           nombre: "0/0",
//         }
//       );
//     });

//     // -------------------------------

//     const [taskStats] = await Task.aggregate([
//       {
//         $match: {
//           assignedTo: userId,
//         },
//       },
//       {
//         $facet: {
//           taskTypes: [
//             {
//               $group: {
//                 _id: "$type",
//                 total: { $sum: 1 },
//                 completed: {
//                   $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
//                 },
//                 inProgress: {
//                   $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
//                 },
//                 late: {
//                   $sum: {
//                     $cond: [
//                       {
//                         $and: [
//                           { $ne: ["$status", "completed"] },
//                           { $lt: ["$deadline", new Date()] },
//                         ],
//                       },
//                       1,
//                       0,
//                     ],
//                   },
//                 },
//                 pending: {
//                   $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
//                 },
//               },
//             },
//           ],
//           progressionStats: [
//             {
//               $group: {
//                 _id: null,
//                 avgProgression: { $avg: "$progress" },
//                 minProgression: { $min: "$progress" },
//                 maxProgression: { $max: "$progress" },
//               },
//             },
//           ],
//         },
//       },
//     ]);

//     const formattedTasksStats = (taskStats.taskTypes || []).map((type) => ({
//       type: type._id,
//       total: type.total,
//       completed: type.completed,
//       inProgress: type.inProgress,
//       late: type.late,
//       pending: type.pending,
//       completionRate:
//         type.total > 0 ? Math.round((type.completed / type.total) * 100) : 0,
//     }));

//     const progressionData = taskStats.progressionStats[0] || {
//       avgProgression: 0,
//       minProgression: 0,
//       maxProgression: 0,
//     };

//     // Activités récentes & critiques
//     const [recentActivities, criticalTasks] = await Promise.all([
//       Task.find({ assignedTo: userId })
//         .sort({ updatedAt: -1 })
//         .limit(5)
//         .populate("project", "name logo")
//         .populate("assignedTo", "profilePhoto position"),

//       Task.find({
//         assignedTo: userId,
//         deadline: { $lt: new Date() },
//         status: { $ne: "completed" },
//       })
//         .sort({ deadline: 1 })
//         .limit(5)
//         .populate("project", "name priority")
//         .populate("assignedTo", "profilePhoto position"),
//     ]);

//     const enrichedRecentActivities = recentActivities.map((activity) => ({
//       _id: activity._id,
//       title: activity.title,
//       type: activity.type,
//       status: activity.status,
//       progress: activity.progress,
//       project: activity.project,
//       assignedTo: {
//         photo: activity.assignedTo?.profilePhoto,
//         position: activity.assignedTo?.position,
//       },
//       intervention: activity.intervention,
//       deadline: activity.deadline,
//     }));

//     const enrichedCriticalTasks = criticalTasks.map((task) => ({
//       _id: task._id,
//       title: task.title,
//       type: task.type,
//       status: task.status,
//       progress: task.progress,
//       project: task.project,
//       assignedTo: {
//         photo: task.assignedTo?.profilePhoto,
//         position: task.assignedTo?.position,
//       },
//       intervention: task.intervention,
//       deadline: task.deadline,
//       daysLate: Math.floor((today - task.deadline) / (1000 * 60 * 60 * 24)),
//     }));

//     // -------------------------------
//     const userProjects = await Project.find({ assignedEmployees: userId });
//     const overallProgression =
//       userProjects.length > 0
//         ? Math.round(
//             userProjects.reduce((sum, p) => sum + p.progression, 0) /
//               userProjects.length
//           )
//         : 0;

//     // -------------------------------

//     res.json({
//       projects: {
//         total: userProjects.length,
//         overallProgression,
//       },
//       tasks: {
//         stats: formattedTasksStats,
//         progression: progressionData,
//         dailyProgression,
//         statusDistribution: {
//           completed: formattedTasksStats.reduce(
//             (sum, t) => sum + t.completed,
//             0
//           ),
//           inProgress: formattedTasksStats.reduce(
//             (sum, t) => sum + t.inProgress,
//             0
//           ),
//           late: formattedTasksStats.reduce((sum, t) => sum + t.late, 0),
//           pending: formattedTasksStats.reduce((sum, t) => sum + t.pending, 0),
//         },
//       },
//       activities: {
//         recent: enrichedRecentActivities,
//         critical: enrichedCriticalTasks,
//       },
//     });
//   } catch (err) {
//     console.error("[User Dashboard Controller] Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Erreur lors de la récupération des statistiques personnelles",
//       error: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };
// Dashboard utilisateur
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 6);

    // Tâches journalières de l'employé avec séparation par type
    const rawDaily = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startDate, $lte: today },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$type",
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          daily: {
            $push: {
              type: "daily",
              total: { $cond: [{ $eq: ["$_id.type", "daily"] }, "$total", 0] },
              completed: {
                $cond: [{ $eq: ["$_id.type", "daily"] }, "$completed", 0],
              },
            },
          },
          long: {
            $push: {
              type: "long",
              total: { $cond: [{ $eq: ["$_id.type", "long"] }, "$total", 0] },
              completed: {
                $cond: [{ $eq: ["$_id.type", "long"] }, "$completed", 0],
              },
            },
          },
          total: { $sum: "$total" },
          totalCompleted: { $sum: "$completed" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          daily: {
            $let: {
              vars: {
                dailyData: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$daily",
                        as: "item",
                        cond: { $ne: ["$$item.total", 0] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                total: "$$dailyData.total",
                completed: "$$dailyData.completed",
              },
            },
          },
          long: {
            $let: {
              vars: {
                longData: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$long",
                        as: "item",
                        cond: { $ne: ["$$item.total", 0] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                total: "$$longData.total",
                completed: "$$longData.completed",
              },
            },
          },
          total: 1,
          totalCompleted: 1,
        },
      },
    ]);

    // Ajouter les jours manquants
    const getLastNDays = (n) => {
      const dates = [];
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
      }
      return dates;
    };

    const last7Days = getLastNDays(7);
    const mapRaw = Object.fromEntries(
      rawDaily.map((d) => [
        d.date,
        {
          ...d,
          daily: d.daily || { total: 0, completed: 0 },
          long: d.long || { total: 0, completed: 0 },
        },
      ])
    );

    const dailyProgression = last7Days.map((date) => {
      const data = mapRaw[date] || {
        date,
        total: 0,
        totalCompleted: 0,
        daily: { total: 0, completed: 0 },
        long: { total: 0, completed: 0 },
      };

      return {
        date,
        pourcentage:
          data.total > 0
            ? Math.round((data.totalCompleted / data.total) * 100)
            : 0,
        nombre: `${data.totalCompleted}/${data.total}`,
        daily: {
          total: data.daily.total,
          completed: data.daily.completed,
          nombre: `${data.daily.completed}/${data.daily.total}`,
        },
        long: {
          total: data.long.total,
          completed: data.long.completed,
          nombre: `${data.long.completed}/${data.long.total}`,
        },
      };
    });

    // -------------------------------

    const [taskStats] = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
        },
      },
      {
        $facet: {
          taskTypes: [
            {
              $group: {
                _id: "$type",
                total: { $sum: 1 },
                completed: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
                inProgress: {
                  $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
                },
                late: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ["$status", "completed"] },
                          { $lt: ["$deadline", new Date()] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                pending: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
              },
            },
          ],
          progressionStats: [
            {
              $group: {
                _id: null,
                avgProgression: { $avg: "$progress" },
                minProgression: { $min: "$progress" },
                maxProgression: { $max: "$progress" },
              },
            },
          ],
          typeCounts: [
            {
              $group: {
                _id: null,
                dailyCount: {
                  $sum: { $cond: [{ $eq: ["$type", "daily"] }, 1, 0] },
                },
                longCount: {
                  $sum: { $cond: [{ $eq: ["$type", "long"] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
    ]);

    const formattedTasksStats = (taskStats.taskTypes || []).map((type) => ({
      type: type._id,
      total: type.total,
      completed: type.completed,
      inProgress: type.inProgress,
      late: type.late,
      pending: type.pending,
      completionRate:
        type.total > 0 ? Math.round((type.completed / type.total) * 100) : 0,
    }));

    const typeCounts = taskStats.typeCounts[0] || {
      dailyCount: 0,
      longCount: 0,
    };

    const progressionData = taskStats.progressionStats[0] || {
      avgProgression: 0,
      minProgression: 0,
      maxProgression: 0,
    };

    // Activités récentes & critiques
    const [recentActivities, criticalTasks] = await Promise.all([
      Task.find({ assignedTo: userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("project", "name logo")
        .populate("assignedTo", "profilePhoto position"),

      Task.find({
        assignedTo: userId,
        deadline: { $lt: new Date() },
        status: { $ne: "completed" },
      })
        .sort({ deadline: 1 })
        .limit(5)
        .populate("project", "name priority")
        .populate("assignedTo", "profilePhoto position"),
    ]);

    const enrichedRecentActivities = recentActivities.map((activity) => ({
      _id: activity._id,
      title: activity.title,
      type: activity.type,
      status: activity.status,
      progress: activity.progress,
      project: activity.project,
      assignedTo: {
        photo: activity.assignedTo?.profilePhoto,
        position: activity.assignedTo?.position,
      },
      intervention: activity.intervention,
      deadline: activity.deadline,
    }));

    const enrichedCriticalTasks = criticalTasks.map((task) => ({
      _id: task._id,
      title: task.title,
      type: task.type,
      status: task.status,
      progress: task.progress,
      project: task.project,
      assignedTo: {
        photo: task.assignedTo?.profilePhoto,
        position: task.assignedTo?.position,
      },
      intervention: task.intervention,
      deadline: task.deadline,
      daysLate: Math.floor((today - task.deadline) / (1000 * 60 * 60 * 24)),
    }));

    // -------------------------------
    const userProjects = await Project.find({ assignedEmployees: userId });
    const overallProgression =
      userProjects.length > 0
        ? Math.round(
            userProjects.reduce((sum, p) => sum + p.progression, 0) /
              userProjects.length
          )
        : 0;

    // -------------------------------

    res.json({
      projects: {
        total: userProjects.length,
        overallProgression,
      },
      tasks: {
        stats: formattedTasksStats,
        typeCounts,
        progression: progressionData,
        dailyProgression, // Maintenant avec les données daily et long
        statusDistribution: {
          completed: formattedTasksStats.reduce(
            (sum, t) => sum + t.completed,
            0
          ),
          inProgress: formattedTasksStats.reduce(
            (sum, t) => sum + t.inProgress,
            0
          ),
          late: formattedTasksStats.reduce((sum, t) => sum + t.late, 0),
          pending: formattedTasksStats.reduce((sum, t) => sum + t.pending, 0),
        },
      },
      activities: {
        recent: enrichedRecentActivities,
        critical: enrichedCriticalTasks,
      },
    });
  } catch (err) {
    console.error("[User Dashboard Controller] Error:", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques personnelles",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
