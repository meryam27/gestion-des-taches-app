const express = require('express');
const tasksCrud = require('../../controllers/admin/crudTasks.controller');
const roleMiddleware = require('../../middlewares/role.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const router = express.Router();

// Route pour récupérer toutes les tâches avec mise à jour automatique du statut 'late'
router.get('/',authMiddleware,
  roleMiddleware.roleMiddleware('admin','manager'),
  tasksCrud.getAllTasks);
  router.post("/create",authMiddleware,
  roleMiddleware.roleMiddleware('admin','manager') ,
  tasksCrud.createTask);

/*router.put("/update/:id",authMiddleware,
   roleMiddleware.roleMiddleware('admin','manager'),
   tasksCrud.updateTask
);*/

router.put("/update/:id",authMiddleware,
   roleMiddleware.roleMiddleware('admin','manager'),
   tasksCrud.updateTask
);

router.delete("/:id",authMiddleware,
   roleMiddleware.roleMiddleware('admin','manager'),
   tasksCrud.deleteTask
);




module.exports = router;