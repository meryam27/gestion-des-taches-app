const mongoose = require('mongoose');
const Project = require('./models/project');
const Task = require('./models/task');
const User = require('./models/user');
const connectDB = require("./config/db");
const dotenv = require("dotenv");

dotenv.config();
connectDB();

// Fonction principale
const seedDatabase = async () => {
  try{
    // Nettoyer la base de données existante
    await Promise.all([
      User.deleteMany(),
      Project.deleteMany(),
      Task.deleteMany()
    ]);

    console.log('Anciennes données supprimées');
    const employees=[];
    // Création des utilisateurs (employés)
    usersTest=[
      {
        name: "Jean Dupont",
        email: "jean@entreprise.com",
        password: "password123",
        role: "employee",
        position: "Développeur Frontend",
        cin: "J123456",
        profilePhoto: "uploads/users/originals/test_image.png"
      },
      {
        name: "Marie Martin",
        email: "marie@entreprise.com",
        password: "password123",
        role: "employee",
        position: "Designer UI/UX",
        cin: "M789012",
        profilePhoto:  "uploads/users/originals/test_image.png",
       // profilePhotoThumb:  "uploads/users/thumbnails/test_image.png"
      },
      {
        name: "Ahmed Khan",
        email: "ahmed@entreprise.com",
        password: "password123",
        role: "manager",
        position: "Développeur Backend",
        cin: "A345678",
        profilePhoto: "uploads/users/originals/test_image.png",
       //profilePhotoThumb: "uploads/users/thumbnails/test_image.png"
      },

      { name: "Admin DevPu",
        email: "admin@devpu.com",
        password: "admin123", // hashé automatiquement via pre('save')
        role: "admin",
        position:"directeur",
        cin:123456,
        profilePhoto:"uploads/users/originals/image-directeur.png",

      }
    ];

         
        for (const userData of usersTest) {
          const user = new User(userData);
          await user.save();
          employees.push(user) // Le hash se fait automatiquement ici
          console.log(`✅ Utilisateur ajouté : ${user.email}`);
        } 
    

    console.log(`${employees.length} employés créés`);

    // Création des projets
    const projects = await Project.insertMany([
      {
        name: "Site Web Corporatif",
        description: "Développement du nouveau site web de l'entreprise",
        company: "Tech Solutions",
        city: "Casablanca",
        priority: "high",
        logo: "logo_tech.png",
        assignedEmployees: [employees[0]._id, employees[1]._id]
      },
      {
        name: "Application Mobile",
        description: "Développement d'une application mobile cross-platform",
        company: "Mobile Inc",
        city: "Rabat",
        status: "active",
        logo: "apple_logo.png",
        assignedEmployees: [employees[2]._id]
      },
      {
        name: "Système de Gestion",
        description: "Plateforme de gestion interne",
        company: "Internal Systems",
        city: "Tanger",
        status: "inactive",
        logo: "apple_logo.png"
      }
    ]);

    console.log(`${projects.length} projets créés`);

    // Création des tâches
    const tasks = await Task.insertMany([
      {
        title: "Maquette Accueil",
        description: "Créer la maquette de la page d'accueil",
        type: "long",
        status: "completed",
        deadline: new Date('2023-12-15'),
        project: projects[0]._id,
        assignedTo: employees[1]._id,
        intervention:"on_site",
        progress: 100
      },
      {
        title: "Intégration Header",
        description: "Intégrer le header responsive",
        type: "daily",
        status: "inProgress",
        project: projects[0]._id,
        assignedTo: employees[0]._id,
        intervention:"on_site",
        progress: 70
      },
      {
        title: "API Authentification",
        description: "Développer le module d'authentification",
        type: "long",
        status: "pending",
        deadline: new Date('2023-12-20'),
        project: projects[1]._id,
        assignedTo: employees[2]._id,
        intervention:"remote",
        progress: 0
      },
      {
        title: "Tests Unitaires",
        description: "Écrire les tests unitaires pour le module utilisateur",
        type: "long",
        status: "pending",
        deadline: new Date('2023-12-10'),
        project: projects[1]._id,
        intervention:"remote",
        progress: 0
      }
    ]);

    console.log(`${tasks.length} tâches créées`);

    // Mise à jour des progressions des projets
    await Promise.all(
      projects.map(project => mongoose.model('Project').findByIdAndUpdate(
        project._id,
        { $set: { progression: Math.floor(Math.random() * 100) } }
      ))
    );
   

    console.log('Progression des projets mise à jour');

    console.log('Base de données peuplée avec succès!');
    process.exit(0);

  } catch (error) {
    console.error('Erreur lors du peuplement de la base:', error);
    process.exit(1);
  }
};


// Exécution du script
seedDatabase();