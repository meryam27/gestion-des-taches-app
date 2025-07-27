const Project = require("../../models/project");
exports.getEmployeeProject = async (req, res) => {
  try {
    const employeId = req.user._id;
    const projects = await Project.find({ assignedEmployees: employeId })
      .populate("assignedEmployees", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.log(
      "Erreur lors de la récupération des projets de cet employé",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur  lors de la récupération des projets" });
  }
};
// --> avoir les projets d'un employé connecté
