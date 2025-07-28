const Task = require("../../models/task");
exports.getEmployeTask = async (req, res) => {
  try {
    const employeId = req.user._id;
    const tasks = await Task.find({ assignedTo: employeId })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.log("Erreur lors de la récupération des taches ", error);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.createDailyTask = async (req, res) => {
  try {
    const { title, description, project, intervention } = req.body;
    const task = new Task({
      title,
      description,
      project,
      type: "daily",
      intervention: intervention || "on_site",
      assignedTo: req.user._id,
    });
    await task.save();
    res.status(201).json({ message: "tache crée" });
  } catch (error) {
    console.log("Erreur lors de la création des taches ", error);
    res.status(500).json({ error: error.message });
  }
};

exports.toggleStar = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "tache non trouvé" });
    }
    const index = task.starredBy.indexOf(userId);
    if (index === -1) {
      task.starredBy.push(userId);
    } else {
      task.starredBy.splice(index, 1);
    }
    await task.save();
    res.status(200).json({ message: "Done", starredBy: task.starredBy });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
