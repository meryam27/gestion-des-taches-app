const Project = require("../../models/project");
const Task = require("../../models/task");
const User = require("../../models/user");
const mongoose = require('mongoose');


exports.getEmployeeStats = async (req, res) => {
  try {
    const userId = req.user._id; // ID de l'employé connecté
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 6); // 7 derniers jours

    // Étape 1 : Agrégation des tâches journalières de l'employé par date
    const rawDaily = await Task.aggregate([
      {
        $match: {
          type: "daily",
          assignedTo: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: startDate,
            $lte: today,
          },
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
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
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

    // Étape 2 : Ajouter les jours manquants (jours sans tâche)
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

    // 1. Statistiques des projets de l'employé
    const employeeProjects = await Project.find({
      assignedEmployees: userId,
    }).select("status progression");

    const projectsStats = {
      active: employeeProjects.filter((p) => p.status === "active").length,
      inactive: employeeProjects.filter((p) => p.status === "inactive").length,
      completed: employeeProjects.filter((p) => p.status === "completed").length,
      total: employeeProjects.length,
      overallProgression:
        employeeProjects.length > 0
          ? Math.round(
              employeeProjects.reduce((sum, p) => sum + p.progression, 0) /
                employeeProjects.length
            )
          : 0,
    };

    // 2. Statistiques des tâches de l'employé
    const tasksStats = await Task.aggregate([
      {
        $match: {
          assignedTo: mongoose.Types.ObjectId(userId),
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

    // 3. Tâches récentes et critiques de l'employé
    const [recentActivities, criticalTasks] = await Promise.all([
      Task.find({ assignedTo: userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate({
          path: "project",
          select: "name logo",
        }),
      Task.find({
        assignedTo: userId,
        deadline: { $lt: new Date() },
        status: { $ne: "completed" },
      })
        .sort({ deadline: 1 })
        .limit(5)
        .populate({
          path: "project",
          select: "name priority",
        }),
    ]);

    // 4. Formatage des données
    const taskTypes = tasksStats[0]?.taskTypes || [];
    const progressionStats = tasksStats[0]?.progressionStats || [];

    const formattedTasksStats = taskTypes.map((type) => ({
      type: type._id,
      total: type.total,
      completed: type.completed,
      inProgress: type.inProgress,
      late: type.late,
      pending: type.pending,
      completionRate:
        type.total > 0 ? Math.round((type.completed / type.total) * 100) : 0,
    }));

    const progressionData = progressionStats[0] || {
      avgProgression: 0,
      minProgression: 0,
      maxProgression: 0,
    };

    // Enrichissement des activités récentes
    const enrichedRecentActivities = recentActivities.map((activity) => ({
      _id: activity._id,
      title: activity.title,
      type: activity.type,
      status: activity.status,
      progress: activity.progress,
      project: activity.project,
      intervention: activity.intervention,
      deadline: activity.deadline,
    }));

    // Enrichissement des tâches critiques
    const enrichedCriticalTasks = criticalTasks.map((task) => ({
      _id: task._id,
      title: task.title,
      type: task.type,
      status: task.status,
      progress: task.progress,
      project: task.project,
      intervention: task.intervention,
      deadline: task.deadline,
      daysLate: Math.floor((today - task.deadline) / (1000 * 60 * 60 * 24)),
    }));

    // Réponse finale
    res.json({
      projects: projectsStats,
      tasks: {
        stats: formattedTasksStats,
        progression: progressionData,
        total: taskTypes.reduce((sum, type) => sum + type.total, 0),
        dailyProgression,
        statusDistribution: {
          completed: taskTypes.reduce((sum, type) => sum + type.completed, 0),
          inProgress: taskTypes.reduce((sum, type) => sum + type.inProgress, 0),
          late: taskTypes.reduce((sum, type) => sum + type.late, 0),
          pending: taskTypes.reduce((sum, type) => sum + type.pending, 0),
        },
      },
      activities: {
        recent: enrichedRecentActivities,
        critical: enrichedCriticalTasks,
      },
    });
  } catch (err) {
    console.error("[Employee Dashboard Controller] Error:", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques employé",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
