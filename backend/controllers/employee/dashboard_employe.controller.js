const Project = require("../../models/project");
const Task = require("../../models/task");
const User = require("../../models/user");
const mongoose = require("mongoose");
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 6);

    // -------------------------------
    //  Tâches journalières  de l'employé
    const rawDaily = await Task.aggregate([
      {
        $match: {
          type: "daily",
          assignedTo: userId,
          createdAt: { $gte: startDate, $lte: today },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0], // si status = completed on donne 1 si non 0
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          pourcentage: {
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
          nombre: {
            $concat: [
              { $toString: "$completed" },
              "/",
              { $toString: "$total" },
            ],
          },
        },
      },
    ]);

    //  Ajouter les jours manquants
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
    const mapRaw = Object.fromEntries(rawDaily.map((d) => [d.date, d]));

    const dailyProgression = last7Days.map((date) => {
      return (
        mapRaw[date] || {
          date,
          pourcentage: 0,
          nombre: "0/0",
        }
      );
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

    const progressionData = taskStats.progressionStats[0] || {
      avgProgression: 0,
      minProgression: 0,
      maxProgression: 0,
    };

    // -------------------------------
    // 🔎 3. Activités récentes & critiques
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
    //
    const userProjects = await Project.find({ members: userId }); // Si tu as une liste de membres
    // overAllProgression sert a savoir l'avancement d'un employé par rapport à ses taches
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
        progression: progressionData,
        dailyProgression,
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
