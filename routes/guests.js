const express = require('express');
const Guest = require('../models/Guest');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Récupérer tous les invités
router.get('/', authMiddleware, async (req, res) => {
  try {
    const guests = await Guest.find();
    res.json(guests);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter un invité
router.post('/', authMiddleware, async (req, res) => {
  try {
    const guest = new Guest(req.body);
    await guest.save();
    res.status(201).json(guest);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de l\'ajout de l\'invité' });
  }
});

// Supprimer un invité par e-mail
router.delete('/email/:email', authMiddleware, async (req, res) => {
  try {
    const guestEmail = req.params.email;
    console.log("Email reçu pour suppression :", guestEmail);

    if (!guestEmail) {
      return res.status(400).json({ error: "Email de l'invité manquant" });
    }

    const deletedGuest = await Guest.findOneAndDelete({ email: guestEmail });
    console.log("Invité supprimé :", deletedGuest);

    if (!deletedGuest) {
      return res.status(404).json({ error: "Invité non trouvé" });
    }

    res.status(200).json({ message: "Invité supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'invité :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});



module.exports = router;
