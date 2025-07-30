const task = require("../../models/task");
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
exports.toggleFavoutes = async (req, res) => {
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

    const tasks = await Task.find({ assignedTo: userId, isFavorite: true });

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
