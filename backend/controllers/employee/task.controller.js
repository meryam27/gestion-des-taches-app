const Task = require("../../models/task");
const Project = require("../../models/project");

const mongoose = require("mongoose");
exports.getEmployeTask = async (req, res) => {
  try {
    const employeId = req.user._id;
    const tasks = await Task.find({ assignedTo: employeId })
      .populate({
        path: "project",
        select: "name company logo priority progression",
      })
      .populate("assignedTo", "name email profilePhoto")
      .populate("createdBy", "_id name email")
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.log("Erreur lors de la récupération des taches ", error);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.createDailyTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      title,
      description,

      status,

      projectId,
      assignedToId,
      progress,
      intervention,
    } = req.body;

    // 1. Validation des données
    if (!title || !projectId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Title and project are required" });
    }

    // 2. Vérification que le projet existe
    const projectExists = await Project.findById(projectId).session(session);
    if (!projectExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Project not found" });
    }

    // 4. Création de la tâche
    const newTask = new Task({
      title,
      description: description || "",
      type: "daily",
      status: status || "pending",
      project: projectId,
      assignedTo: req.user._id,
      progress: progress || 0,
      intervention: intervention || "on_site",
      createdBy: req.user._id,
      createdAt: new Date(),
    });

    const savedTask = await newTask.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Task created successfully",
      task: {
        id: savedTask._id,
        title: savedTask.title,
        type: savedTask.type,
        status: savedTask.status,
        projectId: savedTask.project,
        assignedToId: savedTask.assignedTo,
        createdBy: savedTask.createdBy,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      message: "Server error while creating task",
      error: err.message,
    });
  }
};
exports.deleteEmployeTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const taskId = req.params.taskId;
    const userId = req.user._id;

    // 1. Vérifier que la tâche existe et récupérer le projet associé
    const task = await Task.findById(taskId).session(session);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "tu n a pas le droit de supprimer cette tache" });
    }

    const projectId = task.project;

    // 2. Supprimer la tâche
    await Task.deleteOne({ _id: taskId }).session(session);

    // 3. Mettre à jour la progression du projet
    const project = await Project.findById(projectId).session(session);
    if (project) {
      // Récupérer toutes les tâches restantes du projet
      const remainingTasks = await Task.find({ project: projectId }).session(
        session
      );

      if (remainingTasks.length > 0) {
        // Calculer la nouvelle progression
        const completedCount = remainingTasks.filter(
          (t) => t.status === "completed"
        ).length;
        project.progression = Math.round(
          (completedCount / remainingTasks.length) * 100
        );

        // Mettre à jour le statut du projet si nécessaire
        if (project.progression === 100) {
          project.status = "completed";
        } else if (project.status === "completed") {
          project.status = "active";
        }
      } else {
        // Si plus de tâches, réinitialiser la progression
        project.progression = 0;
        project.status = "active";
      }

      await project.save({ session });
    }

    // 4. Valider la transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Tâche supprimée avec succès",
      affectedProject: projectId,
      newProgression: project?.progression || 0,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.name === "CastError") {
      return res.status(400).json({ message: "ID de tâche invalide" });
    }

    res.status(500).json({
      message: "Erreur lors de la suppression de la tâche",
      error: err.message,
    });
  }
};
exports.updateEmployeTask = async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user._id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      title,
      description,
      type,
      status,
      deadline,
      projectId,
      createdById,
      progress,
      intervention,
    } = req.body;

    const task = await Task.findById(taskId).session(session);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Task not found" });
    }

    if (type && !["daily", "long"].includes(type)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid task type" });
    }

    if (
      status &&
      !["pending", "inProgress", "completed", "late"].includes(status)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid task status" });
    }

    if (intervention && !["remote", "on_site"].includes(intervention)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid intervention type" });
    }

    if (progress && (progress < 0 || progress > 100)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Progress must be between 0 and 100" });
    }

    if (projectId) {
      const projectExists = await Project.findById(projectId).session(session);
      if (!projectExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Project not found" });
      }
    }

    if (createdById) {
      const userExists = await User.findById(createdById).session(session);
      if (!userExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "utilisateur non trouvé" });
      }
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (type) task.type = type;
    if (status) task.status = status;
    if (deadline) task.deadline = deadline;
    if (projectId) {
      task.project = projectId;
    }
    if (createdById) {
      task.createdBy = createdById;
    }
    if (progress !== undefined) task.progress = progress;
    if (intervention) task.intervention = intervention;
    task.updatedAt = new Date();

    if (task.type === "daily") {
      task.deadline = undefined;
    }

    if (
      task.deadline &&
      new Date() > task.deadline &&
      task.status !== "completed"
    ) {
      task.status = "late";
    }

    const updatedTask = await task.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Task updated successfully",
      task: {
        id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        type: updatedTask.type,
        status: updatedTask.status,
        deadline: updatedTask.deadline,
        projectId: updatedTask.project,
        createdById: updatedTask.createdBy,
        progress: updatedTask.progress,
        intervention: updatedTask.intervention,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    res.status(500).json({
      message: "Server error while updating task",
      error: err.message,
    });
  }
};
exports.toggleFavorites = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user._id;
    console.log(req);
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "tache non trouvé" });
    }
    if (!task.assignedTo.equals(userId))
      return res.status(403).json({
        message: "tu n est pas autorisé a favoriser ou défavoriser cette tache",
      });
    task.isFavorite = !task.isFavorite;
    await task.save();
    res.status(200).json({
      message: task.isFavorite
        ? "tache favorisé avec succes"
        : "tache retiré avec succes",
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
exports.getFavoriteTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({
      assignedTo: userId,
      isFavorite: true,
    })
      .populate("project", "_id name progression status logo priority company")
      .populate("assignedTo", "_id name position profilePhoto")
      .populate("createdBy", "_id name email");

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
