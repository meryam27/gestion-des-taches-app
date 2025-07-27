const Task = require("../../models/task");
const Project = require("../../models/project");
const User = require("../../models/user");
const mongoose = require("mongoose");
const path = require('path');

exports.getAllTasks = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}/public/`;
    // 1. Mise à jour des tâches en retard
    const now = new Date();
    await Task.bulkWrite([
      {
        updateMany: {
          filter: {
            type: "long",
            deadline: { $lt: now },
            status: { $nin: ["completed", "late"] }
          },
          update: { $set: { status: "late" } }
        }
      }
    ]);

    // 2. Récupération des tâches avec les relations
    const tasks = await Task.find({})
      .populate({
        path: "project",
        select: "name company logo priority progression",
      })
      .populate({
        path: "assignedTo",
        select: "profilePhoto name position",
      })
      .lean();

    // 3. Formatage de la réponse avec les chemins complets des images
    const formattedTasks = tasks.map((task) => {
      // Chemin complet pour le logo du projet
      const projectLogoPath = task.project?.logo 
         ? `${baseUrl}uploads/projects/originals/${task.project.logo}`
        : null;

      // Chemin complet pour la photo de profil
      const profilePhotoPath = task.assignedTo?.profilePhoto
        ? `${baseUrl}uploads/projects/originals/${task.assignedTo.profilePhoto}`
        : null;

      return {
        ...task,
        project: {
          name: task.project?.name,
          company: task.project?.company,
          logo: projectLogoPath, // Chemin complet du logo
          priority: task.project?.priority,
          progression: task.project?.progression,
        },
        assignedTo: task.assignedTo
          ? {
              profilePhoto: profilePhotoPath, // Chemin complet de la photo
              name: task.assignedTo.name,
              position: task.assignedTo.position,
            }
          : null,
      };
    });

    res.status(200).json(formattedTasks);
  } catch (err) {
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: err.message 
    });
  }
};



exports.createTask = async (req, res) => {
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
      assignedToId,
      progress,
      intervention
    } = req.body;

    // 1. Validation des données
    if (!title || !type || !projectId ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Title, type and project are required" });
    }

    if (type === "long" && !deadline) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Deadline is required for long tasks" });
    }

    // 2. Vérification que le projet existe
    const projectExists = await Project.findById(projectId).session(session);
    if (!projectExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Project not found" });
    }

    // 3. Vérification que l'utilisateur assigné existe (si fourni)
    let assignedUser = null;
    if (assignedToId) {
      assignedUser = await User.findById(assignedToId).session(session);
      if (!assignedUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Assigned user not found" });
      }
    }

    // 4. Création de la tâche
    const newTask = new Task({
      title,
      description: description || "",
      type,
      status: status|| "pending",
      deadline: type === "long" ? deadline : undefined, //si tu mis tache journaliere avec deadline il va pas se stocker en backend (deadline)
      project: projectId,
      assignedTo: assignedToId || undefined,
      progress: progress || 0,
      intervention:intervention || "on_site",
      createdAt: new Date()
    });

    // 5. Sauvegarde avec transaction
    const savedTask = await newTask.save({ session });

    // 6. Commit de la transaction
    await session.commitTransaction();
    session.endSession();

    // 7. Réponse avec les IDs
    res.status(201).json({
      message: "Task created successfully",
      task: {
        id: savedTask._id,
        title: savedTask.title,
        type: savedTask.type,
        status: savedTask.status,
        projectId: savedTask.project,
        assignedToId: savedTask.assignedTo || null
      }
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    
    if (err.name === "ValidationError") {
      return res.status(400).json({ 
        message: "Validation error",
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ 
      message: "Server error while creating task",
      error: err.message 
    });
  }
};


exports.updateTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      status,
      deadline,
      projectId,
      assignedToId,
      progress,
      intervention
    } = req.body;

    // 1. Vérification que la tâche existe
    const task = await Task.findById(id).session(session);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Task not found" });
    }

    // 2. Validation des données
    if (type && !["daily", "long"].includes(type)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid task type" });
    }

    if (status && !["pending", "inProgress", "completed", "late"].includes(status)) {
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
      return res.status(400).json({ message: "Progress must be between 0 and 100" });
    }

    // 3. Vérification du projet (si modification)
    if (projectId) {
      const projectExists = await Project.findById(projectId).session(session);
      if (!projectExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Project not found" });
      }
    }

    // 4. Vérification de l'utilisateur assigné (si modification)
    if (assignedToId) {
      const userExists = await User.findById(assignedToId).session(session);
      if (!userExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Assigned user not found" });
      }
    }

    // 5. Mise à jour des champs
    if (title) task.title = title;
    if (description !== undefined) task.description = description;//undefined si le champ description de  formulaire n'est pas envoyer 
    if (type) task.type = type;
    if (status) task.status = status;
    if (deadline) task.deadline = deadline;
    if (projectId){task.project = projectId };
    if (assignedToId !== undefined) {
      task.assignedTo = assignedToId  ; // Permet de désassigner en envoyant null
    }
    if (progress !== undefined) task.progress = progress;
    if (intervention) task.intervention = intervention;
    task.updatedAt = new Date();

    // 6. Gestion spéciale pour les tâches quotidiennes
    if (task.type === "daily") {
      task.deadline = undefined; // On supprime la deadline pour les tâches quotidiennes
    }

    // 7. Gestion automatique du statut "late"
    if (task.deadline && new Date() > task.deadline && task.status !== "completed") {
      task.status = "late";
    }

    // 8. Sauvegarde de la tâche mise à jour
    const updatedTask = await task.save({ session });

    // 9. Commit de la transaction
    await session.commitTransaction();
    session.endSession();

    // 10. Réponse avec la tâche mise à jour
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
        assignedToId: updatedTask.assignedTo,
        progress: updatedTask.progress,
        intervention: updatedTask.intervention,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt
      }
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.name === "ValidationError") {
      return res.status(400).json({ 
        message: "Validation error",
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }

    if (err.name === "CastError") {
      return res.status(400).json({ 
        message: "Invalid ID format" 
      });
    }

    res.status(500).json({ 
      message: "Server error while updating task",
      error: err.message 
    });
  }
};

exports.deleteTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // 1. Vérifier que la tâche existe et récupérer le projet associé
    const task = await Task.findById(id).session(session);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Tâche non trouvée" });
    }

    const projectId = task.project;

    // 2. Supprimer la tâche
    await Task.deleteOne({ _id: id }).session(session);

    // 3. Mettre à jour la progression du projet
    const project = await Project.findById(projectId).session(session);
    if (project) {
      // Récupérer toutes les tâches restantes du projet
      const remainingTasks = await Task.find({ project: projectId }).session(session);
      
      if (remainingTasks.length > 0) {
        // Calculer la nouvelle progression
        const completedCount = remainingTasks.filter(t => t.status === 'completed').length;
        project.progression = Math.round((completedCount / remainingTasks.length) * 100);
        
        // Mettre à jour le statut du projet si nécessaire
        if (project.progression === 100) {
          project.status = 'completed';
        } else if (project.status === 'completed') {
          project.status = 'active';
        }
      } else {
        // Si plus de tâches, réinitialiser la progression
        project.progression = 0;
        project.status = 'active';
      }

      await project.save({ session });
    }

    // 4. Valider la transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Tâche supprimée avec succès",
      affectedProject: projectId,
      newProgression: project?.progression || 0
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.name === "CastError") {
      return res.status(400).json({ message: "ID de tâche invalide" });
    }

    res.status(500).json({ 
      message: "Erreur lors de la suppression de la tâche",
      error: err.message 
    });
  }
};




