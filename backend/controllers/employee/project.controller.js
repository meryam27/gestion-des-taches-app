const Project = require("../../models/project");

const buildImageUrls = (req, project) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  // Si le chemin commence déjà par "uploads/"
  if (project.logo && project.logo.startsWith("uploads/")) {
    return {
      logoUrl: project.logo ? `${baseUrl}/public/${project.logo}` : null,
      thumbnailUrl: project.thumbnail
        ? `${baseUrl}/public/${project.thumbnail}`
        : null,
    };
  } else {
    // Pour la rétrocompatibilité avec les anciens chemins
    return {
      logoUrl: project.logo ? `${baseUrl}/public/${project.logo}` : null,
      thumbnailUrl: project.thumbnail
        ? `${baseUrl}/public/${project.thumbnail}`
        : null,
    };
  }
};
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
exports.getProjectDetail = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: "assignedEmployees",
        select: " _id name profilePhoto profilePhotoThumb position cin email",
        match: { role: { $in: ["employee", "manager"] } },
      })
      .select("-__v -createdAt")
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Formatage des dates
    project.startDate = project.startDate?.toISOString().split("T")[0];
    project.endDate = project.endDate?.toISOString().split("T")[0];

    // Ajout des URLs
    const { logoUrl, thumbnailUrl } = buildImageUrls(req, project);
    project.logoUrl = logoUrl;
    // project.thumbnailUrl = thumbnailUrl;
    // Formatage des employés
    project.assignedEmployees = [req.user.name];

    res.json({
      success: true,
      data: project,
    });
  } catch (err) {
    console.error("Error fetching project details:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du projet",
    });
  }
};
