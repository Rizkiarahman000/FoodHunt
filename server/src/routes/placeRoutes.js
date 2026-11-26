import express from 'express'
import { PlaceController } from '../controllers/placeController.js'

const router = express.Router()

router.get('/', PlaceController.getAll)
router.get('/:id', PlaceController.getById)
router.post('/', PlaceController.create)
router.put('/:id', PlaceController.update)
router.patch('/:id', PlaceController.update)
router.delete('/:id', PlaceController.remove)

export default router
