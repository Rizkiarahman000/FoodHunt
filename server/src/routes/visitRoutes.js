import express from 'express'
import { VisitController } from '../controllers/visitController.js'

const router = express.Router()

router.get('/', VisitController.getAll)
router.get('/:id', VisitController.getById)
router.post('/', VisitController.create)
router.put('/:id', VisitController.update)
router.patch('/:id', VisitController.update)
router.delete('/:id', VisitController.remove)

export default router
